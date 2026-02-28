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
} from "@phosphor-icons/react";
import { posApi } from "./api/posApi";
import type { MetodoPagoDto } from "./api/posApi";
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

/** Flat product object ready to be added to cart */
type PosProductItem = {
  id: string; // unique visual ID (e.g. prodId-varId)
  productId: string;
  varianteId: string;
  nombre: string;
  variante: string;
  precio: number;
};

export function PosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<LineItem[]>([]);
  const [descuentoGlobalPct, setDescuentoGlobalPct] = useState("");
  const [recargoGlobalPct, setRecargoGlobalPct] = useState("");

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [catalogo, setCatalogo] = useState<PosProductItem[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPagoDto[]>([]);
  const [metodoPagoActivo, setMetodoPagoActivo] = useState<string>("");

  const [procesandoCobro, setProcesandoCobro] = useState(false);
  const [cobroExitoso, setCobroExitoso] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catData, mpData] = await Promise.all([
          posApi.obtenerCatalogoPos(),
          posApi.obtenerMetodosPago(),
        ]);

        // Flatten catálogo
        const flatCatalog: PosProductItem[] = [];
        catData.forEach((p) => {
          p.variantes.forEach((v) => {
            flatCatalog.push({
              id: `${p.id}-${v.varianteId}`,
              productId: p.id,
              varianteId: v.varianteId,
              nombre: p.nombre,
              variante: v.sizeColor,
              precio: p.precioBase,
            });
          });
        });

        setCatalogo(flatCatalog);
        setMetodosPago(mpData);
        if (mpData.length > 0) {
          setMetodoPagoActivo(mpData[0].id);
        }
      } catch (error) {
        console.error("Error cargando datos POS:", error);
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchInitialData();
  }, []);

  const productosFiltrados = catalogo.filter(
    (p) =>
      !busqueda.trim() ||
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.variante.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarAlCarrito = (p: PosProductItem) => {
    const existente = carrito.find(
      (i) => i.varianteId === p.varianteId
    );
    if (existente) {
      setCarrito((prev) =>
        prev.map((i) =>
          i.id === existente.id
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        )
      );
    } else {
      setCarrito((prev) => [
        ...prev,
        {
          id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          productId: p.productId,
          varianteId: p.varianteId,
          nombre: p.nombre,
          variante: p.variante,
          precioUnitario: p.precio,
          cantidad: 1,
          descuentoPct: 0,
          recargoPct: 0,
        },
      ]);
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
              placeholder="Buscar por nombre o variante..."
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
              productosFiltrados.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={styles.productCard}
                  onClick={() => agregarAlCarrito(p)}
                  aria-label={`Agregar ${p.nombre} ${p.variante}`}
                >
                  <div className={styles.productCardBody}>
                    <span className={styles.productName}>{p.nombre}</span>
                    <span className={styles.productVariante}>{p.variante}</span>
                    <span className={styles.productPrice}>
                      ${p.precio.toLocaleString("es-AR")}
                    </span>
                  </div>
                  <Plus size={20} weight="bold" className={styles.productAddIcon} />
                </button>
              ))
            )}
          </div>
        </section>

        {/* ── Zona carrito + cliente + totales + pago ─────────────────────── */}
        <aside className={styles.cartSection} aria-label="Venta en curso">
          <div className={styles.cartCard}>
            <h2 className={styles.cartTitle}>
              <Receipt size={20} weight="bold" />
              Venta en curso
            </h2>

            {/* Cliente (cartera) — placeholder hasta que exista módulo */}
            <div className={styles.clientBlock}>
              <div className={styles.clientLabel}>
                <User size={16} />
                Cliente
              </div>
              <div className={styles.clientValue}>
                Sin cliente — Cartera en desarrollo
              </div>
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
