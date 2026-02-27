import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ChartLine,
  House,
  Package,
  Storefront,
  UserPlus,
  GearSix,
} from "@phosphor-icons/react";
import styles from "./DashboardPage.module.css";

const salesLast7Days = [
  { day: "Lun", value: 18_500 },
  { day: "Mar", value: 21_200 },
  { day: "Mié", value: 19_800 },
  { day: "Jue", value: 24_100 },
  { day: "Vie", value: 28_900 },
  { day: "Sáb", value: 31_400 },
  { day: "Dom", value: 17_600 },
];

const paymentByMethodToday = [
  { label: "Efectivo", amount: 120_000, color: "#22c55e" },
  { label: "Tarjeta débito", amount: 85_000, color: "#3b82f6" },
  { label: "Tarjeta crédito", amount: 64_000, color: "#a855f7" },
  { label: "QR / billetera", amount: 41_000, color: "#f97316" },
];

const topProducts = [
  { name: "Jean Mom Azul", sold: 82, revenue: 945_000 },
  { name: "Remera Oversize Blanca", sold: 64, revenue: 512_000 },
  { name: "Campera Cargo Verde", sold: 37, revenue: 666_000 },
];

const carteraClientes = {
  clientesConDeuda: 32,
  clientesActivos: 156,
  deudaTotal: 1_250_000,
};

const productosStatsMock = {
  nuevosHoy: 3,
  sinStock: 12,
  stockBajo: 7,
};

const modulosDisponibles = [
  {
    id: "tienda-online",
    nombre: "Tienda online",
    descripcion: "Tu catálogo en la web, ventas 24/7 y carrito integrado.",
    precio: "Próximamente",
  },
  {
    id: "reportes-avanzados",
    nombre: "Reportes avanzados",
    descripcion: "Exportación Excel, gráficos por período y comparativas.",
    precio: "Próximamente",
  },
  {
    id: "multi-sucursal",
    nombre: "Multi-sucursal",
    descripcion: "Varias tiendas, stock por sede y reportes consolidados.",
    precio: "Próximamente",
  },
];

type Contexto = "saas" | "tienda";

export function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contexto, setContexto] = useState<Contexto>("saas");
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  const totalProductos = contexto === "saas" ? 324 : 187;

  const totalIngresosHoy = paymentByMethodToday.reduce(
    (acc, m) => acc + m.amount,
    0,
  );

  const paymentSegments = paymentByMethodToday.map((m) => ({
    ...m,
    pct: (m.amount / totalIngresosHoy) * 100,
  }));

  let offsetAcc = 25;
  const paymentSegmentsWithOffset = paymentSegments.map((seg) => {
    const currentOffset = offsetAcc;
    offsetAcc -= seg.pct;
    return { ...seg, offset: currentOffset };
  });

  const maxSales = Math.max(...salesLast7Days.map((d) => d.value));
  const esTiendaOnline = contexto === "tienda";

  return (
    <div className={`${styles.shell} ${sidebarOpen ? "" : styles.sidebarCollapsed}`}>
      <aside
        className={`${styles.sidebar} ${
          sidebarOpen ? "" : styles.sidebarCollapsed
        }`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <div className={styles.sidebarLogoMark}>PI</div>
            <span>POS Indumentaria</span>
          </div>
          <button
            type="button"
            className={styles.sidebarToggle}
            aria-label={sidebarOpen ? "Colapsar menú" : "Expandir menú"}
            onClick={() => setSidebarOpen((v) => !v)}
          >
            ☰
          </button>
        </div>

        <nav className={styles.nav} aria-label="Navegación principal">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
          >
            <span className={styles.navItemIcon}>
              <House size={20} weight="bold" />
            </span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/catalogo"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
          >
            <span className={styles.navItemIcon}>
              <Package size={20} weight="bold" />
            </span>
            <span>Catálogo</span>
          </NavLink>

          <NavLink
            to="/pos"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
          >
            <span className={styles.navItemIcon}>🛒</span>
            <span>Punto de venta</span>
          </NavLink>

          <button
            type="button"
            className={styles.navItem}
            style={{ border: "none", background: "transparent" }}
          >
            <span className={styles.navItemIcon}>
              <ChartLine size={20} weight="bold" />
            </span>
            <span>Reportes</span>
          </button>

          <button
            type="button"
            className={styles.navItem}
            style={{ border: "none", background: "transparent" }}
          >
            <span className={styles.navItemIcon}>
              <GearSix size={20} weight="bold" />
            </span>
            <span>Configuración</span>
          </button>
        </nav>

        <div className={styles.navFooter}>
          <div>Appy Studios</div>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarRow}>
            <div className={styles.topbarTitle}>
              <h1>Resumen general</h1>
              <p>Visión rápida de cómo viene tu negocio hoy.</p>
            </div>

            <div className={styles.userMetrics} aria-label="Usuarios del sistema">
              <div className={styles.userMetricsTitle}>Usuarios</div>
              <div className={styles.userMetricsRow}>
                <div
                  className={`${styles.userMetricPill} ${styles.userMetricPillActive}`}
                >
                  <span className={styles.userMetricLabel}>Activos</span>
                  <span className={styles.userMetricValue}>—</span>
                </div>
                <div className={styles.userMetricPill}>
                  <span className={styles.userMetricLabel}>Registrados</span>
                  <span className={styles.userMetricValue}>—</span>
                </div>
              </div>
            </div>

            <div className={styles.topbarControls}>
              <div
                className={styles.segmentControl}
                aria-label="Contexto de datos"
              >
                <button
                  type="button"
                  className={`${styles.segmentButton} ${
                    contexto === "saas" ? styles.segmentButtonActive : ""
                  }`}
                  onClick={() => setContexto("saas")}
                >
                  SaaS
                </button>
                <button
                  type="button"
                  className={`${styles.segmentButton} ${
                    contexto === "tienda" ? styles.segmentButtonActive : ""
                  }`}
                  onClick={() => setContexto("tienda")}
                >
                  Tienda online
                </button>
              </div>
            </div>
          </div>

        </header>

        <main className={styles.content}>
          {esTiendaOnline ? (
            <section aria-label="Estado de tienda online">
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.cardTitle}>Tienda online</div>
                    <div className={styles.cardSub}>
                      Esta funcionalidad forma parte de un plan pago. Todavía no
                      la tenés habilitada en tu cuenta.
                    </div>
                  </div>
                </div>
                <div className={styles.cardSub}>
                  Cuando actives este módulo vas a ver acá métricas de tu canal
                  online: ventas por día, carrito promedio, productos más
                  vendidos y sesiones de la tienda.
                </div>
              </div>
            </section>
          ) : (
            <>
          {/* Fila principal: catálogo + ingresos + cartera */}
          <section className={styles.grid} aria-label="Métricas principales">
            <div style={{ gridColumn: "span 4 / span 4" }}>
              <div className={`${styles.card} ${styles.cardTall}`}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.cardTitle}>
                      Productos en catálogo
                    </div>
                    <div className={styles.cardSub}>
                      Total de productos activos que pueden venderse.
                    </div>
                  </div>
                </div>
                <div className={styles.cardKpi}>{totalProductos}</div>
                <div className={styles.cardMiniStats}>
                  <div className={styles.cardMiniRow}>
                    <span className={styles.cardMiniLabel}>Nuevos hoy</span>
                    <span className={styles.cardMiniValue}>
                      {productosStatsMock.nuevosHoy}
                    </span>
                  </div>
                  <div className={styles.cardMiniRow}>
                    <span className={styles.cardMiniLabel}>Sin stock</span>
                    <span className={styles.cardMiniValue}>
                      {productosStatsMock.sinStock}
                    </span>
                  </div>
                  <div className={styles.cardMiniRow}>
                    <span className={styles.cardMiniLabel}>
                      Stock bajo (menos de 5)
                    </span>
                    <span className={styles.cardMiniValue}>
                      {productosStatsMock.stockBajo}
                    </span>
                  </div>
                </div>
                <div className={styles.cardPromo}>
                  Si querés que el catálogo esté controlado, adquirí la
                  integración avanzada con WP: el sistema te avisa cuando el
                  stock llega a cero y te envía un reporte.
                </div>
                <Link
                  to="/modulos"
                  className={styles.cardPromoBtn}
                >
                  Adquirir módulo
                </Link>
              </div>
            </div>

            <div style={{ gridColumn: "span 4 / span 4" }}>
              <div className={`${styles.card} ${styles.cardTall}`}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.cardTitle}>
                      Ingresos por método de pago (hoy)
                    </div>
                    <div className={styles.cardSub}>
                      Ventas confirmadas del día por forma de cobro.
                    </div>
                  </div>
                  <span className={`${styles.tag} ${styles.tagPositive}`}>
                    Hoy
                  </span>
                </div>
                <div className={styles.paymentDonutWrap}>
                  <div className={styles.paymentDonut}>
                    <svg viewBox="0 0 42 42" role="img" aria-label="Ingresos por método de pago">
                      <circle
                        className={styles.paymentDonutBg}
                        cx="21"
                        cy="21"
                        r="15.915"
                      />
                      {paymentSegmentsWithOffset.map((seg) => (
                        <circle
                          key={seg.label}
                          cx="21"
                          cy="21"
                          r="15.915"
                          fill="none"
                          stroke={seg.color}
                          strokeWidth="3"
                          strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                          strokeDashoffset={seg.offset}
                        />
                      ))}
                    </svg>
                  </div>
                  <div className={styles.paymentDonutTotal}>
                    ${totalIngresosHoy.toLocaleString("es-AR")}
                  </div>
                  <div className={styles.paymentLegend}>
                    {paymentSegments.map((seg) => (
                      <div key={seg.label} className={styles.paymentLegendItem}>
                        <div className={styles.paymentLegendLabel}>
                          <span
                            className={styles.paymentLegendDot}
                            style={{ backgroundColor: seg.color }}
                          />
                          <span>{seg.label}</span>
                        </div>
                        <span className={styles.paymentLegendPct}>
                          ${seg.amount.toLocaleString("es-AR")} ·{" "}
                          {Math.round(seg.pct)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ gridColumn: "span 4 / span 4" }}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.cardTitle}>Cartera de clientes</div>
                    <div className={styles.cardSub}>
                      Deudas activas y dinero en la calle.
                    </div>
                  </div>
                </div>
                <div className={styles.carteraStats}>
                  <div className={styles.carteraStatMain}>
                    <span className={styles.carteraStatValue}>
                      {carteraClientes.clientesConDeuda}
                    </span>
                    <span className={styles.carteraStatLabel}>
                      clientes con saldo pendiente
                    </span>
                  </div>
                  <div className={styles.carteraStatRow}>
                    <span className={styles.carteraStatLabel}>Clientes activos</span>
                    <span className={styles.carteraStatValueSmall}>
                      {carteraClientes.clientesActivos}
                    </span>
                  </div>
                  <div className={styles.carteraStatRow}>
                    <span className={styles.carteraStatLabel}>Deuda total</span>
                    <span className={styles.carteraStatValueSmall}>
                      ${carteraClientes.deudaTotal.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>
                <Link to="/clientes/nuevo" className={styles.carteraBtn}>
                  <UserPlus size={18} weight="bold" />
                  Gestionar nuevo cliente
                </Link>
                <p className={styles.cardSub} style={{ marginTop: 0 }}>
                  Próximamente: alta y listado de clientes.
                </p>
              </div>
            </div>

          </section>

          {/* Bloque de texto: esta es la sección Dashboard */}
          

          {/* Segunda fila: ventas por día + top productos */}
          <section className={styles.grid} aria-label="Detalles de ventas">
            <div style={{ gridColumn: "span 7 / span 7" }}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.cardTitle}>
                      Ventas por día (últimos 7 días)
                    </div>
                    <div className={styles.cardSub}>
                      Monto facturado por día, incluyendo todos los métodos de
                      pago.
                    </div>
                  </div>
                  <div className={styles.chartLegend}>
                    <span>
                      <span
                        className={styles.legendDot}
                        style={{ backgroundColor: "#6366f1" }}
                      />{" "}
                      Ventas
                    </span>
                  </div>
                </div>
                <div className={styles.chartLineWrap}>
                  <svg
                    viewBox="0 0 100 40"
                    role="img"
                    aria-label="Gráfico de líneas de ventas por día"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <defs>
                      <linearGradient
                        id="areaGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polyline
                      fill="url(#areaGradient)"
                      stroke="none"
                      points={`${salesLast7Days
                        .map((d, idx) => {
                          const x = (idx / 6) * 100;
                          const y = 40 - (d.value / maxSales) * 28 - 4;
                          return `${x},${y}`;
                        })
                        .join(" ")} 100,40 0,40`}
                    />
                    <polyline
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="1.5"
                      points={salesLast7Days
                        .map((d, idx) => {
                          const x = (idx / 6) * 100;
                          const y = 40 - (d.value / maxSales) * 28 - 4;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                    {salesLast7Days.map((d, idx) => {
                      const x = (idx / 6) * 100;
                      const y = 40 - (d.value / maxSales) * 28 - 4;
                      const isActive =
                        idx === (selectedDayIndex ?? hoveredDayIndex ?? -1);
                      return (
                        <circle
                          key={d.day}
                          cx={x}
                          cy={y}
                          r={isActive ? 2.1 : 1.4}
                          fill={isActive ? "#6366f1" : "#ffffff"}
                          stroke="#6366f1"
                          strokeWidth="0.6"
                          onMouseEnter={() => setHoveredDayIndex(idx)}
                          onMouseLeave={() => setHoveredDayIndex(null)}
                          onClick={() =>
                            setSelectedDayIndex((prev) =>
                              prev === idx ? null : idx,
                            )
                          }
                          style={{ cursor: "pointer" }}
                        />
                      );
                    })}
                  </svg>
                </div>
                <div className={styles.cardSub}>
                  {(() => {
                    const idx =
                      selectedDayIndex != null
                        ? selectedDayIndex
                        : hoveredDayIndex;
                    if (idx != null) {
                      return (
                        <>
                          {salesLast7Days[idx].day}: $
                          {salesLast7Days[idx].value.toLocaleString("es-AR")}
                        </>
                      );
                    }
                    return (
                      <>
                        Promedio diario: $
                        {Math.round(totalIngresosHoy / 7).toLocaleString(
                          "es-AR",
                        )}
                        .
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div style={{ gridColumn: "span 5 / span 5" }}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.cardTitle}>
                      Productos que más se vendieron
                    </div>
                    <div className={styles.cardSub}>
                      Ranking según unidades vendidas en la última semana.
                    </div>
                  </div>
                </div>
                <div className={styles.topProductsList}>
                  {topProducts.map((p, idx) => {
                    const maxSold = topProducts[0].sold;
                    const width = Math.round((p.sold / maxSold) * 100);
                    return (
                      <div key={p.name} className={styles.topProductRow}>
                        <div className={styles.topProductMeta}>
                          <span className={styles.topProductName}>
                            {idx + 1}. {p.name}
                          </span>
                          <span className={styles.topProductSub}>
                            {p.sold} unidades · $
                            {p.revenue.toLocaleString("es-AR")}
                          </span>
                        </div>
                        <div className={styles.topProductBarOuter}>
                          <div
                            className={styles.topProductBarInner}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Call to action hacia catálogo */}
          <section>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.cardTitle}>
                    ¿Querés cargar nuevos productos?
                  </div>
                  <div className={styles.cardSub}>
                    Andá al catálogo para crear productos con su matriz de
                    talles y colores.
                  </div>
                </div>
                <Link to="/catalogo/nuevo" className={styles.tag}>
                  <Storefront size={14} />
                  Ir al catálogo
                </Link>
              </div>
            </div>
          </section>

          {/* Módulos que podés adquirir (tarjetas tipo precios) */}
          <section className={styles.modulosSection} aria-label="Módulos disponibles">
            <h2 className={styles.modulosSectionTitle}>
              Módulos que podés adquirir
            </h2>
            <div className={styles.modulosGrid}>
              {modulosDisponibles.map((mod) => (
                <div key={mod.id} className={styles.moduloCard}>
                  <div className={styles.moduloCardHeader}>
                    <h3 className={styles.moduloCardTitle}>{mod.nombre}</h3>
                    <span className={styles.moduloCardPrecio}>
                      {mod.precio}
                    </span>
                  </div>
                  <p className={styles.moduloCardDesc}>{mod.descripcion}</p>
                  <button
                    type="button"
                    className={styles.moduloCardBtn}
                    disabled
                  >
                    Próximamente
                  </button>
                </div>
              ))}
            </div>
          </section>
          </>
          )}
        </main>
      </div>
    </div>
  );
}

