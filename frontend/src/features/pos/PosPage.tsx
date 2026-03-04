import { useState, useEffect, useRef, useMemo } from "react";
import {
  MagnifyingGlass,
  Plus,
  Minus,
  Trash,
  User,
  CurrencyDollar,
  Wallet,
  Receipt,
  CheckCircle,
  Keyboard,
  Money,
  Circle,
  Camera
} from "@phosphor-icons/react";
import { posApi } from "./api/posApi";
import type { MetodoPagoDto, ProductoLayerPosDto, VarianteLayerPosDto } from "./api/posApi";
import { clientesApi } from "../catalog/api/clientesApi";
import type { ClienteDto } from "../catalog/api/clientesApi";
import styles from "./PosPage.module.css";
import { useBarcodeScanner } from "../../hooks/useBarcodeScanner";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";
import { CameraScanner } from "../../components/CameraScanner";

/** Ítem del carrito (en memoria; luego se sincronizará con backend/offline) */
type LineItem = {
  id: string;
  productId: string;
  varianteId: string;
  nombre: string;
  variante: string;
  precioUnitario: number;
  cantidad: number;
  descuentoPct: number;
  recargoPct: number;
  posibleDevolucion: boolean;
};

/** Acepta respuestas en camelCase o PascalCase del API */
function getEan13(p: ProductoLayerPosDto): string {
  const raw = (p as any).ean13 ?? (p as any).Ean13;
  return typeof raw === "string" ? raw.trim() : "";
}
function getTalle(v: VarianteLayerPosDto): string {
  const raw = (v as any).talle ?? (v as any).Talle;
  return typeof raw === "string" ? raw : "";
}
function getColor(v: VarianteLayerPosDto): string {
  const raw = (v as any).color ?? (v as any).Color;
  return typeof raw === "string" ? raw : "";
}
function getSku(v: VarianteLayerPosDto): string {
  const raw = (v as any).sku ?? (v as any).Sku;
  return typeof raw === "string" ? raw.trim() : "";
}
function getStockActual(v: VarianteLayerPosDto): number {
  const raw = (v as any).stockActual ?? (v as any).StockActual;
  return typeof raw === "number" ? raw : 0;
}
/** sizeColor suele venir como "Talle / Color"; si talle/color vienen vacíos, derivar desde acá */
function getSizeColor(v: VarianteLayerPosDto): string {
  const raw = (v as any).sizeColor ?? (v as any).SizeColor;
  return typeof raw === "string" ? raw.trim() : "";
}
/** Talle para mostrar: primero campo talle, si no viene, primera parte de sizeColor */
function getTalleParaMostrar(v: VarianteLayerPosDto): string {
  const t = getTalle(v);
  if (t) return t;
  const sc = getSizeColor(v);
  const idx = sc.indexOf(" / ");
  return idx >= 0 ? sc.slice(0, idx).trim() : sc.trim() || "";
}
/** Color para mostrar: primero campo color, si no viene, segunda parte de sizeColor */
function getColorParaMostrar(v: VarianteLayerPosDto): string {
  const c = getColor(v);
  if (c) return c;
  const sc = getSizeColor(v);
  const idx = sc.indexOf(" / ");
  return idx >= 0 ? sc.slice(idx + 3).trim() : "";
}

const PAGE_SIZE = 20;

export function PosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<LineItem[]>([]);
  const [ajusteGlobal, setAjusteGlobal] = useState("");
  const [montoRecibidoStr, setMontoRecibidoStr] = useState("");

  const [loadingInitial, setLoadingInitial] = useState(true);

  const localProductos = useLiveQuery(() => db.productos.toArray());
  const productos: ProductoLayerPosDto[] = useMemo(() => {
    if (!localProductos) return [];
    return localProductos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      precioBase: p.precioBase,
      ean13: p.codigoBodega || "",
      variantes: p.variantes.map(v => ({
        varianteId: v.id,
        sizeColor: v.talle && v.color ? `${v.talle} / ${v.color}` : v.talle || v.color || "",
        talle: v.talle,
        color: v.color,
        sku: v.sku,
        stockActual: v.stockVenta
      }))
    }));
  }, [localProductos]);

  const [metodosPago, setMetodosPago] = useState<MetodoPagoDto[]>([]);
  const [metodoPagoActivo, setMetodoPagoActivo] = useState<string>("");

  const [clientes, setClientes] = useState<ClienteDto[]>([]);
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState<string>("");

  // Referencias para enfoque
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Al cargar la vista el foco principal debe estar siempre en la barra de búsqueda para la lectura del código láser.
    searchInputRef.current?.focus();
  }, []);

  const [usarSaldoCliente, setUsarSaldoCliente] = useState<boolean>(false);

  const [procesandoCobro, setProcesandoCobro] = useState(false);
  const [cobroExitoso, setCobroExitoso] = useState<string | null>(null);

  /** ID del producto expandido para elegir variante (talle/color) in-situ */
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  /** Soporte Cámara UI Mobile */
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  /** Paginación de la lista de productos */
  const [paginaActual, setPaginaActual] = useState(1);
  const [scannerHidActivo, setScannerHidActivo] = useState(true); // Siempre activo por el hook

  // Listeners de teclado (Barra de comandos)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // [F2] o [Ctrl+K] -> Enfocar barra de busqueda
      if (e.key === "F2" || (e.ctrlKey && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // [F10] -> Procesar cobro si disponible
      if (e.key === "F10") {
        e.preventDefault();
        document.getElementById('btnCobrarF10')?.click();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useBarcodeScanner((scannedValue) => {
    const val = scannedValue.trim();
    if (!val) return;

    // Feedback visual de que el scanner leyó algo
    setScannerHidActivo(false);
    setTimeout(() => setScannerHidActivo(true), 500);

    // Buscar el producto...
    handleScannedCode(val);
  });

  const handleScannedCode = (val: string) => {
    const pFound = productos.find(p =>
      getEan13(p) === val || p.variantes.some(v => getSku(v) === val)
    );

    if (pFound) {
      const vFound = pFound.variantes.find(v => getSku(v) === val);
      if (vFound) {
        agregarVarianteAlCarrito(pFound, vFound);
      } else if (pFound.variantes.length === 1) {
        agregarVarianteAlCarrito(pFound, pFound.variantes[0]);
      } else {
        setExpandedProductId(pFound.id);
        setBusqueda("");
      }
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Disparamos sync de catálogo en background (no frenamos el UI si falla o tarda)
        posApi.sincronizarCatalogoLocal().catch(e => console.error("Sync catalogo falló", e));

        const [mpResult, clResult] = await Promise.allSettled([
          posApi.obtenerMetodosPago(),
          clientesApi.getAll(),
        ]);

        if (mpResult.status === "fulfilled" && mpResult.value.length > 0) {
          setMetodosPago(mpResult.value);
          setMetodoPagoActivo(mpResult.value[0].id);
        }

        if (clResult.status === "fulfilled") {
          setClientes(clResult.value);
        }
      } catch (error) {
        console.error("Error cargando datos POS:", error);
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchInitialData();
  }, []);

  /** Filtro: nombre, código de barra (EAN13 producto o SKU variante), talle, color */
  const productosFiltrados = productos.filter((p) => {
    const q = busqueda.trim();
    if (!q) return true;
    const qLower = q.toLowerCase();
    if (p.nombre.toLowerCase().includes(qLower)) return true;
    const ean13 = getEan13(p);
    if (ean13 && ean13.includes(q)) return true;
    const matchVariante = p.variantes.some(
      (v) =>
        getTalle(v).toLowerCase().includes(qLower) ||
        getColor(v).toLowerCase().includes(qLower) ||
        getSku(v).toLowerCase().includes(qLower) ||
        (v.sizeColor ?? (v as any).SizeColor as string)?.toLowerCase().includes(qLower)
    );
    return matchVariante;
  });

  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / PAGE_SIZE));
  const indiceInicio = (paginaActual - 1) * PAGE_SIZE;
  const productosPagina = productosFiltrados.slice(indiceInicio, indiceInicio + PAGE_SIZE);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const agregarVarianteAlCarrito = (producto: ProductoLayerPosDto, variante: VarianteLayerPosDto) => {
    const stock = getStockActual(variante);
    if (stock <= 0) {
      alert(`No hay stock disponible para ${producto.nombre} (${variante.sizeColor})`);
      return;
    }

    const existente = carrito.find((i) => i.varianteId === variante.varianteId);
    if (existente) {
      if (existente.cantidad >= stock) {
        alert(`No podés agregar más de este producto. Stock disponible: ${stock}`);
        return;
      }
      setCarrito((prev) =>
        prev.map((i) =>
          i.id === existente.id ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      );
    } else {
      setCarrito((prev) => [
        ...prev,
        {
          id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          productId: producto.id,
          varianteId: variante.varianteId,
          nombre: producto.nombre,
          variante: variante.sizeColor,
          precioUnitario: producto.precioBase,
          cantidad: 1,
          descuentoPct: 0,
          recargoPct: 0,
          posibleDevolucion: false,
        },
      ]);
    }
    setExpandedProductId(null);
  };

  const onSeleccionarProducto = (producto: ProductoLayerPosDto) => {
    if (producto.variantes.length === 0) return;
    if (producto.variantes.length === 1) {
      agregarVarianteAlCarrito(producto, producto.variantes[0]);
    } else {
      setExpandedProductId(prev => prev === producto.id ? null : producto.id);
    }
  };

  const cambiarCantidad = (lineId: string, delta: number) => {
    setCarrito((prev) =>
      prev
        .map((i) =>
          i.id === lineId
            ? { ...i, cantidad: Math.max(0, i.cantidad + delta) }
            : i
        )
        .filter((i) => i.cantidad > 0)
    );
  };

  const quitarLinea = (lineId: string) => {
    setCarrito((prev) => prev.filter((i) => i.id !== lineId));
  };

  const togglePosibleDevolucion = (lineId: string) => {
    setCarrito((prev) =>
      prev.map((i) =>
        i.id === lineId ? { ...i, posibleDevolucion: !i.posibleDevolucion } : i
      )
    );
  };

  const ajusteNum = parseFloat(ajusteGlobal.replace(",", ".")) || 0;
  // Negativo = descuento, Positivo = recargo
  const descuentoNum = ajusteNum < 0 ? Math.abs(ajusteNum) : 0;
  const recargoNum = ajusteNum > 0 ? ajusteNum : 0;

  const subtotal = carrito.reduce(
    (acc, i) => acc + i.precioUnitario * i.cantidad,
    0
  );
  const descuentoMonto = (subtotal * descuentoNum) / 100;
  const recargoMonto = (subtotal * recargoNum) / 100;
  const total = subtotal - descuentoMonto + recargoMonto;

  const getSugerenciasPago = (monto: number): number[] => {
    if (monto <= 0) return [];
    const sugerencias = new Set<number>();
    sugerencias.add(monto); // Exacto

    // Billetes comunes en ARS
    const billetes = [1000, 2000, 5000, 10000, 20000];

    // Si el monto ya es redondo a 1000, sugerir el próximo billete grande
    const ceil1000 = Math.ceil(monto / 1000) * 1000;
    if (ceil1000 > monto) sugerencias.add(ceil1000);

    for (const b of billetes) {
      if (b > monto) {
        sugerencias.add(b);
      } else {
        const multiplo = Math.ceil(monto / b) * b;
        if (multiplo > monto && multiplo - monto <= b * 2) {
          sugerencias.add(multiplo);
        }
      }
    }

    return Array.from(sugerencias).sort((a, b) => a - b).slice(0, 4); // Max 4 sugerencias
  };

  const sugerenciasPago = getSugerenciasPago(total);

  const montoRecibido = parseFloat(montoRecibidoStr.replace(",", ".")) || 0;

  let totalFinal = total;
  const c = clientes.find(x => x.id === clienteSeleccionadoId);
  if (usarSaldoCliente && c && c.saldoAFavor !== 0) {
    if (c.saldoAFavor > 0) {
      totalFinal -= Math.min(total, c.saldoAFavor);
    } else {
      totalFinal += Math.abs(c.saldoAFavor);
    }
  }
  const totalAPagar = Math.max(0, totalFinal);

  const vuelto = montoRecibido > totalAPagar ? (montoRecibido - totalAPagar) : 0;
  const esEfectivoActivo = metodosPago.find(m => m.id === metodoPagoActivo)?.nombre.toLowerCase().includes('efectivo');

  const handleCobrar = async () => {
    if (carrito.length === 0 || (!metodoPagoActivo && total > 0)) return;

    setProcesandoCobro(true);
    setCobroExitoso(null);
    try {
      let totalConSaldo = total;
      if (usarSaldoCliente && clienteSeleccionadoId) {
        const c = clientes.find((x) => x.id === clienteSeleccionadoId);
        if (c && c.saldoAFavor !== 0) {
          if (c.saldoAFavor > 0) {
            totalConSaldo -= Math.min(total, c.saldoAFavor);
          } else {
            totalConSaldo += Math.abs(c.saldoAFavor);
          }
        }
      }

      const payload = {
        metodoPagoId: metodoPagoActivo,
        clienteId: clienteSeleccionadoId ? clienteSeleccionadoId : undefined,
        usarSaldoCliente: usarSaldoCliente,
        montoTotalDeclarado: Math.max(0, totalConSaldo), // Lo que ve fisicamente el usuario en pantalla (UI Total)
        descuentoGlobalPct: descuentoNum,
        recargoGlobalPct: recargoNum,
        detalles: carrito.map((i) => ({
          varianteProductoId: i.varianteId,
          cantidad: i.cantidad,
          precioUnitarioDeclarado: i.precioUnitario,
          posibleDevolucion: i.posibleDevolucion,
        })),
      };

      const res = await posApi.cobrarTicket(payload);

      setCarrito([]);
      setAjusteGlobal("");
      setClienteSeleccionadoId("");
      setMontoRecibidoStr("");
      setUsarSaldoCliente(false); // reseteamos billetera
      setCobroExitoso(`¡Cobro completado! Ticket: ${res.ventaId.split('-')[0]}`);

      setTimeout(() => setCobroExitoso(null), 5000);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Error al procesar la venta.");
    } finally {
      setProcesandoCobro(false);
    }
  };

  return (
    <div className={styles.posPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Punto de venta</h1>
        <p className={styles.subtitle}>
          Agregá productos, asigná cliente si corresponde y cobrá.
        </p>
      </header>

      <div className={styles.grid}>
        {/* ── Zona productos (catálogo) ───────────────────────────────────── */}
        <section className={styles.productsSection} aria-label="Productos del catálogo">
          <div className={styles.searchWrap}>
            <MagnifyingGlass size={20} className={styles.searchIcon} />
            <input
              ref={searchInputRef}
              type="search"
              className={styles.searchInput}
              placeholder="Escanear producto o [F2] Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar o escanear productos"
            />
            <div style={{ right: '0.75rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '0.5rem', position: 'absolute', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: scannerHidActivo ? '#10b981' : '#9ca3af', fontWeight: 600, padding: '2px 6px', backgroundColor: scannerHidActivo ? '#f0fdf4' : '#f3f4f6', borderRadius: '4px' }}>
                <Circle size={8} weight="fill" color={scannerHidActivo ? '#10b981' : '#9ca3af'} />
                Scanner Pistola
              </div>
              <div style={{ fontSize: '0.65rem', backgroundColor: '#e5e7eb', color: '#6b7280', padding: '0.2rem 0.4rem', borderRadius: '0.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}> <Keyboard size={12} /> F2</div>
              {/* Botón Flotante para escaneo óptico móvil */}
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                aria-label="Abrir Cámara"
              >
                <Camera size={16} weight="bold" />
              </button>
            </div>
          </div>

          <div className={styles.productList}>
            {loadingInitial ? (
              <p className={styles.emptyHint}>Cargando catálogo POS...</p>
            ) : productosFiltrados.length === 0 ? (
              <p className={styles.emptyHint}>
                No hay productos que coincidan con la búsqueda.
              </p>
            ) : (
              <>
                {productosPagina.map((p) => {
                  const tallesUnicos = [...new Set(p.variantes.map((v) => getTalleParaMostrar(v)).filter(Boolean))];
                  const coloresUnicos = [...new Set(p.variantes.map((v) => getColorParaMostrar(v)).filter(Boolean))];
                  const hayTalles = tallesUnicos.length > 0;
                  const hayColores = coloresUnicos.length > 0;
                  const hayAlgo = hayTalles || hayColores;
                  const isExpanded = expandedProductId === p.id;
                  return (
                    <div key={p.id} style={{ display: 'flex', flexDirection: 'column' }}>
                      <button
                        type="button"
                        className={styles.productCard}
                        style={isExpanded ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderColor: 'var(--color-primary)' } : {}}
                        onClick={() => onSeleccionarProducto(p)}
                        aria-label={`Agregar ${p.nombre}`}
                      >
                        <div className={styles.productCardBody}>
                          <span className={styles.productName}>{p.nombre}</span>
                          <div className={styles.productTallesColores}>
                            {hayTalles && (
                              <>
                                <span className={styles.productTallesColoresLabel}>Talles:</span>
                                <span className={styles.productTallesColoresVal}>{tallesUnicos.slice(0, 10).join(", ")}{tallesUnicos.length > 10 ? "…" : ""}</span>
                              </>
                            )}
                            {hayTalles && hayColores && <span className={styles.productTallesColoresSep}> · </span>}
                            {hayColores && (
                              <>
                                <span className={styles.productTallesColoresLabel}>Colores:</span>
                                <span className={styles.productTallesColoresVal}>{coloresUnicos.slice(0, 8).join(", ")}{coloresUnicos.length > 8 ? "…" : ""}</span>
                              </>
                            )}
                            {!hayAlgo && p.variantes.length > 0 && (
                              <span className={styles.productTallesColoresVal}>{p.variantes.length} variante{p.variantes.length !== 1 ? "s" : ""} (sin talle/color cargado)</span>
                            )}
                          </div>
                          <span className={styles.productPrice}>
                            ${p.precioBase.toLocaleString("es-AR")}
                          </span>
                        </div>
                        <Plus size={20} weight="bold" className={styles.productAddIcon} style={isExpanded ? { transform: 'rotate(45deg)', transition: 'transform 0.2s' } : { transition: 'transform 0.2s' }} />
                      </button>

                      {isExpanded && (
                        <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem', border: '1px solid var(--color-primary)', borderTop: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
                          {p.variantes.map(v => {
                            const stock = getStockActual(v);
                            const sinStock = stock < 1;
                            return (
                              <button
                                key={v.varianteId}
                                type="button"
                                disabled={sinStock}
                                onClick={() => agregarVarianteAlCarrito(p, v)}
                                style={{ padding: '0.5rem', fontSize: '0.8rem', backgroundColor: sinStock ? '#f3f4f6' : 'white', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: sinStock ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: sinStock ? 0.6 : 1, transition: 'all 0.15s ease' }}
                                onMouseOver={(e) => { if (!sinStock) e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                                onMouseOut={(e) => { if (!sinStock) e.currentTarget.style.borderColor = '#d1d5db'; }}
                              >
                                <span style={{ fontWeight: 600, color: sinStock ? '#9ca3af' : '#111827' }}>{v.sizeColor}</span>
                                <span style={{ color: sinStock ? '#d1d5db' : '#6b7280', fontSize: '0.7rem', marginTop: '0.2rem' }}>{getSku(v) && `${getSku(v)} • `}Stk: {stock}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {totalPaginas > 1 && (
                  <div className={styles.pagination}>
                    <button
                      type="button"
                      className={styles.paginationBtn}
                      onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                      disabled={paginaActual <= 1}
                      aria-label="Página anterior"
                    >
                      Anterior
                    </button>
                    <span className={styles.paginationInfo}>
                      Página {paginaActual} de {totalPaginas}
                    </span>
                    <button
                      type="button"
                      className={styles.paginationBtn}
                      onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
                      disabled={paginaActual >= totalPaginas}
                      aria-label="Página siguiente"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>


        {/* ── Zona carrito + cliente + totales + pago ─────────────────────── */}
        <aside className={styles.cartSection} aria-label="Venta en curso">
          <div className={styles.cartCard}>
            <h2 className={styles.cartTitle}>
              <Receipt size={20} weight="bold" />
              Venta en curso {carrito.length > 0 && `(${carrito.length} ${carrito.length === 1 ? "ítem" : "ítems"})`}
            </h2>

            {/* Cliente (cartera) */}
            <div className={styles.clientBlock} style={{ marginBottom: "1rem" }}>
              <div className={styles.clientLabel} style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                <User size={16} />
                Cliente (Opcional)
              </div>
              <div className={styles.clientValue}>
                <select
                  value={clienteSeleccionadoId}
                  onChange={(e) => setClienteSeleccionadoId(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid #d1d5db" }}
                >
                  <option value="">Consumidor Final / Sin Asignar</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.documento ? `(${c.documento})` : ""}</option>)}
                </select>
              </div>
              {(() => {
                const c = clientes.find(x => x.id === clienteSeleccionadoId);
                if (c && c.saldoAFavor !== 0) {
                  const esAcreedor = c.saldoAFavor > 0;
                  return (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: esAcreedor ? '#f0fdf4' : '#fef2f2', border: `1px solid ${esAcreedor ? '#bbf7d0' : '#fecaca'}`, borderRadius: '0.375rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: esAcreedor ? '#166534' : '#991b1b', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Wallet size={16} weight="fill" />
                          <span>{esAcreedor ? 'Saldo a Favor:' : 'Saldo Deudor:'} <strong>${Math.abs(c.saldoAFavor).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</strong></span>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                          <input
                            type="checkbox"
                            checked={usarSaldoCliente}
                            onChange={(e) => setUsarSaldoCliente(e.target.checked)}
                            style={{ cursor: 'pointer', accentColor: esAcreedor ? '#16a34a' : '#dc2626' }}
                          />
                          Aplicar al Ticket
                        </label>
                      </div>
                      {usarSaldoCliente && (
                        <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.25rem' }}>
                          {esAcreedor
                            ? "El monto abonado se descontará de la billetera del cliente."
                            : "La deuda anterior del cliente se sumará al subtotal del ticket."}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Ítems del carrito */}
            <div className={styles.cartItems}>
              {carrito.length === 0 ? (
                <p className={styles.cartEmpty}>Agregá productos desde el catálogo.</p>
              ) : (
                <ul className={styles.cartList}>
                  {carrito.map((line) => (
                    <li key={line.id} className={styles.cartItem}>
                      <div className={styles.cartItemTop}>
                        <span className={styles.cartItemName}>
                          {line.nombre} <span className={styles.cartItemVariante}>· {line.variante}</span>
                        </span>
                        <span className={styles.cartItemSubtotal}>
                          ${(line.precioUnitario * line.cantidad).toLocaleString("es-AR")}
                        </span>
                      </div>
                      <div className={styles.cartItemBottom}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span className={styles.cartItemDetail}>
                            ${line.precioUnitario.toLocaleString("es-AR")} × {line.cantidad}
                          </span>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#4b5563', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={line.posibleDevolucion}
                              onChange={() => togglePosibleDevolucion(line.id)}
                            />
                            Posible Devolución
                          </label>
                        </div>
                        <div className={styles.cartItemActions}>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => cambiarCantidad(line.id, -1)}
                            aria-label="Menos uno"
                          >
                            <Minus size={14} weight="bold" />
                          </button>
                          <span className={styles.qtyNum}>{line.cantidad}</span>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => cambiarCantidad(line.id, 1)}
                            aria-label="Más uno"
                          >
                            <Plus size={14} weight="bold" />
                          </button>
                          <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => quitarLinea(line.id)}
                            aria-label="Quitar ítem"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Ajuste Global (Descuento/Recargo) */}
            <div className={styles.adjustmentsRow} style={{ gridTemplateColumns: '1fr' }}>
              <div className={styles.adjustmentField}>
                <label className={styles.adjustmentLabel}>Ajuste Global (%) — Usar - para descuento</label>
                <input
                  type="text"
                  className={styles.adjustmentInput}
                  placeholder="Ej: -10 (Descuento) o 10 (Recargo)"
                  value={ajusteGlobal}
                  onChange={(e) => {
                    // Permitir solo numeros y el signo menos
                    const val = e.target.value.replace(/[^\d.,-]/g, '');
                    setAjusteGlobal(val);
                  }}
                  inputMode="decimal"
                  aria-label="Ajuste global (+ recargo / - descuento)"
                />
              </div>
            </div>

            {/* Totales */}
            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString("es-AR")}</span>
              </div>
              {descuentoNum > 0 && (
                <div className={styles.totalRow}>
                  <span>Descuento ({descuentoNum}%)</span>
                  <span className={styles.totalDiscount}>
                    -${descuentoMonto.toLocaleString("es-AR")}
                  </span>
                </div>
              )}
              {recargoNum > 0 && (
                <div className={styles.totalRow}>
                  <span>Recargo ({recargoNum}%)</span>
                  <span className={styles.totalRecargo}>
                    +${recargoMonto.toLocaleString("es-AR")}
                  </span>
                </div>
              )}
              {(() => {
                const c = clientes.find(x => x.id === clienteSeleccionadoId);
                if (usarSaldoCliente && c && c.saldoAFavor !== 0) {
                  if (c.saldoAFavor > 0) {
                    const aplicable = Math.min(total, c.saldoAFavor);
                    return (
                      <div className={styles.totalRow} style={{ color: '#16a34a' }}>
                        <span>Billetera </span>
                        <span>-${aplicable.toLocaleString("es-AR")}</span>
                      </div>
                    );
                  } else {
                    return (
                      <div className={styles.totalRow} style={{ color: '#dc2626' }}>
                        <span>Deuda Anterior</span>
                        <span>+${Math.abs(c.saldoAFavor).toLocaleString("es-AR")}</span>
                      </div>
                    )
                  }
                }
                return null;
              })()}
              <div className={`${styles.totalRow} ${styles.totalRowFinal}`}>
                <span>Total</span>
                <span>${totalAPagar.toLocaleString("es-AR")}</span>
              </div>

              {/* Input Dinámico de Vuelto si es efectivo */}
              {esEfectivoActivo && (
                <div style={{ marginTop: '0.75rem', backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534' }}>Recibe: $</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={montoRecibidoStr}
                      onChange={(e) => setMontoRecibidoStr(e.target.value.replace(/[^\d.,]/g, ''))}
                      onFocus={(e) => e.target.select()}
                      placeholder="0"
                      style={{ width: '100px', textAlign: 'right', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid #86efac', outline: 'none' }}
                    />
                  </div>
                  {vuelto > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #bbf7d0', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#16a34a' }}>Vuelto:</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>${vuelto.toLocaleString("es-AR")}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Sugerencias de Efectivo Visuales */}
              {sugerenciasPago.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Cobro rápido (Efectivo)</span>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {sugerenciasPago.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const efectivo = metodosPago.find(m => m.nombre.toLowerCase().includes('efectivo'));
                          if (efectivo) setMetodoPagoActivo(efectivo.id);
                          setMontoRecibidoStr(sug.toString());
                        }}
                        style={{ padding: '0.3rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', backgroundColor: '#f9fafb', fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
                        aria-label={`Sugerencia de cobro: $${sug}`}
                      >
                        <Money size={14} /> ${sug.toLocaleString("es-AR")}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Métodos de pago */}
            <div className={styles.paymentBlock}>
              <div className={styles.paymentLabel}>
                <CurrencyDollar size={16} />
                Método de pago
              </div>
              <div className={styles.paymentMethods}>
                {loadingInitial ? (
                  <span style={{ fontSize: "0.85rem", color: "#666" }}>Cargando métodos...</span>
                ) : (
                  metodosPago.map((mp) => (
                    <button
                      key={mp.id}
                      type="button"
                      className={`${styles.paymentChip} ${metodoPagoActivo === mp.id ? styles.paymentChipActive : ""
                        }`}
                      onClick={() => setMetodoPagoActivo(mp.id)}
                    >
                      {/* TODO: Íconos dinámicos en base al nombre, por ahora default */}
                      <Wallet size={18} />
                      {mp.nombre}
                    </button>
                  ))
                )}
              </div>
            </div>

            {cobroExitoso && (
              <div style={{ color: "var(--success-color)", textAlign: "center", marginBottom: "0.5rem", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <CheckCircle size={18} weight="fill" />
                {cobroExitoso}
              </div>
            )}

            <button
              type="button"
              className={styles.cobrarBtn}
              onClick={handleCobrar}
              disabled={carrito.length === 0 || procesandoCobro || (!metodoPagoActivo && total > 0)}
              aria-label="Cobrar venta"
            >
              <Receipt size={22} weight="bold" />
              {procesandoCobro ? "Procesando..." : "Cobrar"}
            </button>
          </div>
        </aside>
      </div>

      <CameraScanner
        onOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onDetection={handleScannedCode}
      />
    </div>
  );
}
