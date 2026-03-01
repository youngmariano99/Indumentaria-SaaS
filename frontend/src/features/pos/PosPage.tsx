import { useState, useEffect } from "react";
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
  X,
} from "@phosphor-icons/react";
import { posApi } from "./api/posApi";
import type { MetodoPagoDto, ProductoLayerPosDto, VarianteLayerPosDto } from "./api/posApi";
import { clientesApi } from "../catalog/api/clientesApi";
import type { ClienteDto } from "../catalog/api/clientesApi";
import styles from "./PosPage.module.css";

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

/** Normaliza respuesta del API (PascalCase) a camelCase para uso en el front */
function normalizarProductoPos(raw: Record<string, unknown>): ProductoLayerPosDto {
  const variantesRaw = raw.variantes ?? raw.Variantes;
  const variantes = Array.isArray(variantesRaw) ? variantesRaw : [];
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    nombre: String(raw.nombre ?? raw.Nombre ?? ""),
    precioBase: Number(raw.precioBase ?? raw.PrecioBase ?? 0),
    ean13: String(raw.ean13 ?? raw.Ean13 ?? "").trim(),
    variantes: variantes.map((v: Record<string, unknown>) => ({
      varianteId: String(v.varianteId ?? v.VarianteId ?? ""),
      sizeColor: String(v.sizeColor ?? v.SizeColor ?? "").trim(),
      talle: String(v.talle ?? v.Talle ?? "").trim(),
      color: String(v.color ?? v.Color ?? "").trim(),
      sku: String(v.sku ?? v.Sku ?? "").trim(),
      stockActual: Number(v.stockActual ?? v.StockActual ?? 0),
    })),
  };
}

export function PosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<LineItem[]>([]);
  const [descuentoGlobalPct, setDescuentoGlobalPct] = useState("");
  const [recargoGlobalPct, setRecargoGlobalPct] = useState("");

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [productos, setProductos] = useState<ProductoLayerPosDto[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPagoDto[]>([]);
  const [metodoPagoActivo, setMetodoPagoActivo] = useState<string>("");

  const [clientes, setClientes] = useState<ClienteDto[]>([]);
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState<string>("");

  const [procesandoCobro, setProcesandoCobro] = useState(false);
  const [cobroExitoso, setCobroExitoso] = useState<string | null>(null);

  /** Producto abierto en el modal para elegir variante (talle/color) */
  const [productoModal, setProductoModal] = useState<ProductoLayerPosDto | null>(null);

  /** Paginación de la lista de productos */
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catResult, mpResult, clResult] = await Promise.allSettled([
          posApi.obtenerCatalogoPos(),
          posApi.obtenerMetodosPago(),
          clientesApi.getAll(),
        ]);

        if (catResult.status === "fulfilled") {
          const list = Array.isArray(catResult.value) ? catResult.value : [];
          setProductos(list.map((p) => normalizarProductoPos(p as any)));
        }

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
    const existente = carrito.find((i) => i.varianteId === variante.varianteId);
    if (existente) {
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
        },
      ]);
    }
    setProductoModal(null);
  };

  const onSeleccionarProducto = (producto: ProductoLayerPosDto) => {
    if (producto.variantes.length === 0) return;
    if (producto.variantes.length === 1) {
      agregarVarianteAlCarrito(producto, producto.variantes[0]);
    } else {
      setProductoModal(producto);
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

  const descuentoNum = parseFloat(descuentoGlobalPct.replace(",", ".")) || 0;
  const recargoNum = parseFloat(recargoGlobalPct.replace(",", ".")) || 0;

  const subtotal = carrito.reduce(
    (acc, i) => acc + i.precioUnitario * i.cantidad,
    0
  );
  const descuentoMonto = (subtotal * descuentoNum) / 100;
  const recargoMonto = (subtotal * recargoNum) / 100;
  const total = subtotal - descuentoMonto + recargoMonto;

  const handleCobrar = async () => {
    if (carrito.length === 0 || !metodoPagoActivo) return;

    setProcesandoCobro(true);
    setCobroExitoso(null);
    try {
      const payload = {
        metodoPagoId: metodoPagoActivo,
        clienteId: clienteSeleccionadoId ? clienteSeleccionadoId : undefined,
        montoTotalDeclarado: total,
        descuentoGlobalPct: descuentoNum,
        recargoGlobalPct: recargoNum,
        detalles: carrito.map((i) => ({
          varianteProductoId: i.varianteId,
          cantidad: i.cantidad,
          precioUnitarioDeclarado: i.precioUnitario,
        })),
      };

      const res = await posApi.cobrarTicket(payload);

      setCarrito([]);
      setDescuentoGlobalPct("");
      setRecargoGlobalPct("");
      setClienteSeleccionadoId("");
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
              type="search"
              className={styles.searchInput}
              placeholder="Buscar por nombre, talle, SKU o código de barra..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar productos"
            />
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
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={styles.productCard}
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
                      <Plus size={20} weight="bold" className={styles.productAddIcon} />
                    </button>
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

        {/* Modal: elegir variante (talle/color) cuando el producto tiene varias */}
        {productoModal && (
          <div
            className={styles.modalOverlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-variantes-title"
            onClick={() => setProductoModal(null)}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2 id="modal-variantes-title" className={styles.modalTitle}>
                  {productoModal.nombre}
                </h2>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={() => setProductoModal(null)}
                  aria-label="Cerrar"
                >
                  <X size={24} />
                </button>
              </div>
              <p className={styles.modalSubtitle}>
                Todas las variantes cargadas y su stock. Elegí una para agregar al carrito.
              </p>
              <ul className={styles.varianteList}>
                {productoModal.variantes.map((v) => {
                  const stock = getStockActual(v);
                  const sinStock = stock < 1;
                  return (
                    <li key={v.varianteId}>
                      <button
                        type="button"
                        className={`${styles.varianteCard} ${sinStock ? styles.varianteCardSinStock : ""}`}
                        onClick={() => !sinStock && agregarVarianteAlCarrito(productoModal, v)}
                        disabled={sinStock}
                        aria-label={sinStock ? `${v.sizeColor} sin stock` : `Agregar ${v.sizeColor} (stock: ${stock})`}
                      >
                        <span className={styles.varianteTalleColor}>{v.sizeColor}</span>
                        {getSku(v) && (
                          <span className={styles.varianteSku}>{getSku(v)}</span>
                        )}
                        <span className={styles.varianteStock} title="Stock">
                          Stock: {stock}
                        </span>
                        <span className={styles.variantePrecio}>
                          ${productoModal.precioBase.toLocaleString("es-AR")}
                        </span>
                        {!sinStock && <Plus size={18} weight="bold" className={styles.productAddIcon} />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

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
                if (c && c.saldoAFavor && c.saldoAFavor > 0) {
                  return (
                    <div style={{ marginTop: '0.75rem', padding: '0.5rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontSize: '0.875rem' }}>
                      <Wallet size={16} weight="fill" />
                      <span>Saldo a Favor del Cliente: <strong>${c.saldoAFavor.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</strong></span>
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
                        <span className={styles.cartItemDetail}>
                          ${line.precioUnitario.toLocaleString("es-AR")} × {line.cantidad}
                        </span>
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

            {/* Descuento / Recargo global */}
            <div className={styles.adjustmentsRow}>
              <div className={styles.adjustmentField}>
                <label className={styles.adjustmentLabel}>Descuento %</label>
                <input
                  type="text"
                  className={styles.adjustmentInput}
                  placeholder="0"
                  value={descuentoGlobalPct}
                  onChange={(e) => setDescuentoGlobalPct(e.target.value)}
                  inputMode="decimal"
                  aria-label="Descuento global en porcentaje"
                />
              </div>
              <div className={styles.adjustmentField}>
                <label className={styles.adjustmentLabel}>Recargo %</label>
                <input
                  type="text"
                  className={styles.adjustmentInput}
                  placeholder="0"
                  value={recargoGlobalPct}
                  onChange={(e) => setRecargoGlobalPct(e.target.value)}
                  inputMode="decimal"
                  aria-label="Recargo global en porcentaje"
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
              <div className={`${styles.totalRow} ${styles.totalRowFinal}`}>
                <span>Total</span>
                <span>${total.toLocaleString("es-AR")}</span>
              </div>
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
              disabled={carrito.length === 0 || procesandoCobro || !metodoPagoActivo}
              aria-label="Cobrar venta"
            >
              <Receipt size={22} weight="bold" />
              {procesandoCobro ? "Procesando..." : "Cobrar"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
