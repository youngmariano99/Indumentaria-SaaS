import { useState } from "react";
import {
  MagnifyingGlass,
  Plus,
  Minus,
  Trash,
  User,
  CurrencyDollar,
  CreditCard,
  Wallet,
  Receipt,
  Bank,
} from "@phosphor-icons/react";
import styles from "./PosPage.module.css";

/** Ítem del carrito (en memoria; luego se sincronizará con backend/offline) */
type LineItem = {
  id: string;
  productId: string;
  nombre: string;
  variante: string;
  precioUnitario: number;
  cantidad: number;
  descuentoPct: number;
  recargoPct: number;
};

/** Producto disponible para agregar (mock; luego desde catálogo/API o BD local) */
const MOCK_PRODUCTOS = [
  { id: "1", nombre: "Jean Mom Azul", variante: "M / Azul", precio: 25_000 },
  { id: "2", nombre: "Remera Oversize Blanca", variante: "L / Blanco", precio: 8_000 },
  { id: "3", nombre: "Campera Cargo Verde", variante: "S / Verde", precio: 18_000 },
  { id: "4", nombre: "Short Deportivo Negro", variante: "M / Negro", precio: 6_500 },
  { id: "5", nombre: "Buzo Capucha Gris", variante: "XL / Gris", precio: 15_000 },
];

export function PosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<LineItem[]>([]);
  const [descuentoGlobalPct, setDescuentoGlobalPct] = useState("");
  const [recargoGlobalPct, setRecargoGlobalPct] = useState("");

  const productosFiltrados = MOCK_PRODUCTOS.filter(
    (p) =>
      !busqueda.trim() ||
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.variante.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarAlCarrito = (p: (typeof MOCK_PRODUCTOS)[0]) => {
    const existente = carrito.find(
      (i) => i.productId === p.id && i.variante === p.variante
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
          productId: p.id,
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

  const handleCobrar = () => {
    if (carrito.length === 0) return;
    // TODO: abrir flujo de método de pago y encolar ticket (Sprint 4 backend/offline)
    alert("Cobrar: en desarrollo. Se encolará el ticket y se sincronizará con el backend.");
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
            {productosFiltrados.length === 0 ? (
              <p className={styles.emptyHint}>
                No hay productos que coincidan con la búsqueda.
              </p>
            ) : (
              productosFiltrados.map((p) => (
                <button
                  key={`${p.id}-${p.variante}`}
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

            {/* Métodos de pago — placeholder visual; luego flujo real */}
            <div className={styles.paymentBlock}>
              <div className={styles.paymentLabel}>
                <CurrencyDollar size={16} />
                Método de pago
              </div>
              <div className={styles.paymentMethods}>
                <button type="button" className={styles.paymentChip} disabled>
                  <Wallet size={18} />
                  Efectivo
                </button>
                <button type="button" className={styles.paymentChip} disabled>
                  <CreditCard size={18} />
                  Tarjeta débito
                </button>
                <button type="button" className={styles.paymentChip} disabled>
                  <CreditCard size={18} />
                  Tarjeta crédito
                </button>
                <button type="button" className={styles.paymentChip} disabled>
                  <Bank size={18} />
                  Transferencia
                </button>
                <button type="button" className={styles.paymentChip} disabled>
                  Mixto
                </button>
              </div>
            </div>

            <button
              type="button"
              className={styles.cobrarBtn}
              onClick={handleCobrar}
              disabled={carrito.length === 0}
              aria-label="Cobrar venta"
            >
              <Receipt size={22} weight="bold" />
              Cobrar
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
