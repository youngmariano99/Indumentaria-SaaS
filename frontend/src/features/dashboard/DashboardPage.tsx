import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Storefront, UserPlus } from "@phosphor-icons/react";
import { Suspense } from "react";
import { useRubro } from "../../hooks/useRubro";
import { reportsApi, type DashboardDto } from "../reports/api/reportsApi";
import styles from "./DashboardPage.module.css";

const PAYMENT_COLORS: Record<string, string> = {
  "Efectivo": "#22c55e",
  "Tarjeta débito": "#3b82f6",
  "Tarjeta crédito": "#a855f7",
  "QR / billetera": "#f97316",
  "Transferencia": "#06b6d4"
};

const modulosDisponibles = [
  {
    id: "tienda-online",
    nombre: "Tienda online",
    beneficioCorto: "Expandí tu negocio al mundo online.",
    descripcion:
      "Publicá tu catálogo, recibí pedidos 24/7 y conectá el stock con tu local físico.",
    precio: "$15.900 / mes",
    adquiridos: 23,
    destacado: true,
    features: [
      "Catálogo online siempre actualizado",
      "Carrito de compras simple",
      "Sincronización de stock con el POS",
    ],
  },
  {
    id: "reportes-avanzados",
    nombre: "Reportes avanzados",
    beneficioCorto: "Tomá decisiones con números claros.",
    descripcion:
      "Exportá a Excel, mirá comparativas por período y entendé qué locales y productos rinden mejor.",
    precio: "$7.900 / mes",
    adquiridos: 14,
    destacado: false,
    features: [
      "Reportes listos para contabilidad",
      "Comparativas por rango de fechas",
      "Exportación a Excel y CSV",
    ],
  },
  {
    id: "multi-sucursal",
    nombre: "Multi-sucursal",
    beneficioCorto: "Controlá varias tiendas desde un solo lugar.",
    descripcion:
      "Centralizá el stock, las ventas y la caja de cada sucursal sin perder el detalle.",
    precio: "$20.900 / mes",
    adquiridos: 9,
    destacado: false,
    features: [
      "Stock por sucursal y stock consolidado",
      "Precios y promociones por tienda",
      "Reporte de ventas por sucursal",
    ],
  },
  {
    id: "qr-barras",
    nombre: "Lectura con QR y códigos de barras",
    beneficioCorto: "Obtene la información de tus productos mas rapido.",
    descripcion:
      "Sumá lectura con QR y código de barras en un mismo flujo, sin complicarte.",
    precio: "$4.900 / mes",
    adquiridos: 31,
    destacado: false,
    features: [
      "Lectura de código de barras en el POS",
      "Lectura con QR",
      "Menos errores de tipeo en caja y mayor disponibilidad de productos",
    ],
  },
  {
    id: "facturacion-arca",
    nombre: "Facturación Arca",
    beneficioCorto: "Facturá en regla sin salir del sistema.",
    descripcion:
      "Emití comprobantes con Arca directo desde el POS y llevá el historial de facturas ordenado.",
    precio: "$10.500 / mes",
    adquiridos: 17,
    destacado: false,
    features: [
      "Emisión de facturas desde el POS",
      "Historial de comprobantes centralizado",
      "Datos listos para tu contador",
    ],
  },
  {
    id: "catalogo-asistido",
    nombre: "Control de catálogo asistido",
    beneficioCorto: "Tené tu catálogo siempre ordenado y al día.",
    descripcion:
      "Detectá productos sin stock, stock bajo todo en un ChatBot.",
    precio: "$5.900 / mes",
    adquiridos: 11,
    destacado: false,
    features: [
      "Alertas de productos sin stock",
      "Avisos de stock bajo configurable",
      "Resumen de productos nuevos para revisar",
    ],
  },
];

type Contexto = "saas" | "tienda";

export function DashboardPage() {
  const [contexto, setContexto] = useState<Contexto>("saas");
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const { resolveComponent } = useRubro();

  const FinancialsWidget = resolveComponent('FinancialsWidget');
  const AgingWidget = resolveComponent('AgingWidget');
  const StockAlertWidget = resolveComponent('StockAlertWidget');

  const [data, setData] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await reportsApi.getDashboard();
        setData(dashboardData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Cargando dashboard...</div>;
  }

  if (!data) {
    return <div className={styles.error}>Error al cargar los datos del dashboard.</div>;
  }

  // Mapeo selectivo según contexto (por ahora solo Saas tiene datos reales)
  const totalProductos = contexto === "saas" ? data.totalProductos : 0;

  const totalIngresosHoy = data.metodosPagoHoy.reduce(
    (acc, m) => acc + m.montoTotal,
    0,
  );

  const paymentByMethodTodayFormatted = data.metodosPagoHoy.map(m => ({
    label: m.nombre,
    amount: m.montoTotal,
    color: PAYMENT_COLORS[m.nombre] || "#94a3b8"
  }));

  const paymentSegments = paymentByMethodTodayFormatted.map((m) => ({
    ...m,
    pct: totalIngresosHoy > 0 ? (m.amount / totalIngresosHoy) * 100 : 0,
  }));

  let offsetAcc = 25;
  const paymentSegmentsWithOffset = paymentSegments.map((seg) => {
    const currentOffset = offsetAcc;
    offsetAcc -= seg.pct;
    return { ...seg, offset: currentOffset };
  });

  const maxSales = Math.max(...data.ventasUltimos7Dias.map((d) => d.valor), 1);
  const esTiendaOnline = contexto === "tienda";

  return (
    <>
      <header className={styles.topbar}>
        <div className={styles.topbarRow}>
          <div className={styles.topbarTitle}>
            <h1>Dashboard Industrial</h1>
            <p>Control de operaciones en tiempo real.</p>
          </div>

          <div className={styles.topbarActions}>
            <div
              className={styles.segmentControl}
              aria-label="Contexto de datos"
            >
              <button
                type="button"
                className={`${styles.segmentButton} ${contexto === "saas" ? styles.segmentButtonActive : ""
                  }`}
                onClick={() => setContexto("saas")}
              >
                ERP Corporativo
              </button>
              <button
                type="button"
                className={`${styles.segmentButton} ${contexto === "tienda" ? styles.segmentButtonActive : ""
                  }`}
                onClick={() => setContexto("tienda")}
              >
                Tienda Online
              </button>
            </div>
            
            <div className={styles.userMetricsCompact} title="Usuarios y Servicio">
              <div className={styles.userMetricItem}>
                 <span className={styles.userMetricDot} />
                 <strong>{data.usuariosActivos}</strong> activos
              </div>
              <div className={styles.userMetricDivider} />
              <div className={styles.userMetricItem}>
                 <strong>{data.diasRestantesMembresia}</strong> días de licencia
              </div>
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
                  <div className={styles.cardTitle}>Módulo Tienda Online</div>
                  <div className={styles.cardSub}>
                    Esta funcionalidad forma parte de un plan extendido.
                  </div>
                </div>
              </div>
              <div className={styles.cardSub} style={{ padding: '0 var(--space-4) var(--space-4)' }}>
                Al activar este módulo podrás sincronizar tu catálogo físico con la web, recibir pedidos y cobrar online automáticamente.
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* 1. Métricas Rápidas (4 columnas) */}
            <section className={styles.gridStats}>
              <div className={styles.cardStat}>
                <div className={styles.cardStatTitle}>Productos Activos</div>
                <div className={styles.cardStatValue}>{totalProductos}</div>
                <div className={styles.cardStatTrend}>+{data.productosNuevosHoy} hoy</div>
              </div>
              
              <div className={styles.cardStat}>
                <div className={styles.cardStatTitle}>Ingresos Hoy</div>
                <div className={styles.cardStatValue}>${totalIngresosHoy.toLocaleString("es-AR")}</div>
                <div className={styles.cardStatTrend}>{data.metodosPagoHoy.length} formas de cobro</div>
              </div>

              <div className={styles.cardStat}>
                <div className={styles.cardStatTitle}>Cartera con Deuda</div>
                <div className={styles.cardStatValue}>{data.carteraClientes.clientesConDeuda}</div>
                <div className={styles.cardStatTrend}>${data.carteraClientes.deudaTotal.toLocaleString("es-AR")} pendiente</div>
              </div>

              <div className={styles.cardStat}>
                <div className={styles.cardStatTitle}>Stock Crítico</div>
                <div className={`${styles.cardStatValue} ${data.productosSinStock > 0 ? styles.textDanger : ""}`}>
                  {data.productosSinStock + data.productosStockBajo}
                </div>
                <div className={styles.cardStatTrend}>{data.productosSinStock} agotados</div>
              </div>
            </section>

            {/* 2. Alertas Críticas (Ancho completo) */}
            {StockAlertWidget && (
              <section className={styles.sectionFull}>
                <Suspense fallback={<div>Cargando alertas...</div>}>
                  <StockAlertWidget />
                </Suspense>
              </section>
            )}

            {/* 3. Gráfico de Ventas (Ancho completo para mejor detalle) */}
            <section className={styles.sectionFull}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.cardTitle}>Ventas por Día (Últimos 7 días)</div>
                    <div className={styles.cardSub}>Tendencia de facturación semanal.</div>
                  </div>
                </div>
                <div className={styles.chartLineWrapExtended}>
                  <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polyline
                      fill="url(#areaGradient)"
                      points={`${data.ventasUltimos7Dias.map((d, idx) => {
                        const x = (idx / 6) * 100;
                        const y = 30 - (d.valor / maxSales) * 22 - 4;
                        return `${x},${y}`;
                      }).join(" ")} 100,30 0,30`}
                    />
                    <polyline
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="1"
                      points={data.ventasUltimos7Dias.map((d, idx) => {
                        const x = (idx / 6) * 100;
                        const y = 30 - (d.valor / maxSales) * 22 - 4;
                        return `${x},${y}`;
                      }).join(" ")}
                    />
                    {data.ventasUltimos7Dias.map((d, idx) => {
                      const x = (idx / 6) * 100;
                      const y = 30 - (d.valor / maxSales) * 22 - 4;
                      const isActive = idx === (selectedDayIndex ?? hoveredDayIndex ?? -1);
                      return (
                        <circle
                          key={idx}
                          cx={x} cy={y} r={isActive ? 1.5 : 0.8}
                          fill={isActive ? "#4f46e5" : "white"}
                          stroke="#4f46e5" strokeWidth="0.3"
                          onMouseEnter={() => setHoveredDayIndex(idx)}
                          onMouseLeave={() => setHoveredDayIndex(null)}
                          onClick={() => setSelectedDayIndex(p => p === idx ? null : idx)}
                          style={{ cursor: 'pointer' }}
                        />
                      );
                    })}
                  </svg>
                </div>
                <div className={styles.chartInfo}>
                  {(() => {
                    const idx = selectedDayIndex ?? hoveredDayIndex;
                    if (idx != null) return <strong>{data.ventasUltimos7Dias[idx].dia}: ${data.ventasUltimos7Dias[idx].valor.toLocaleString("es-AR")}</strong>;
                    return <span>Promedio diario: ${Math.round(data.ventasUltimos7Dias.reduce((a,b)=>a+b.valor,0)/7).toLocaleString("es-AR")}</span>;
                  })()}
                </div>
              </div>
            </section>

            {/* 4. Trío de Reportes (3 columnas, evita el amontonamiento) */}
            <section className={styles.gridTrio}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Distribución de Cobros</div>
                </div>
                {FinancialsWidget ? (
                  <Suspense fallback={<div>Cargando...</div>}><FinancialsWidget /></Suspense>
                ) : (
                  <div className={styles.paymentDonutWrap}>
                    <div className={styles.paymentDonutSmall}>
                      <svg viewBox="0 0 42 42">
                        <circle className={styles.paymentDonutBg} cx="21" cy="21" r="15.915" />
                        {paymentSegmentsWithOffset.map((seg) => (
                          <circle
                            key={seg.label}
                            cx="21" cy="21" r="15.915"
                            fill="none" stroke={seg.color} strokeWidth="3"
                            strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                            strokeDashoffset={seg.offset}
                          />
                        ))}
                      </svg>
                    </div>
                    <div className={styles.paymentLegendCompact}>
                      {paymentSegments.slice(0, 3).map((seg) => (
                        <div key={seg.label} className={styles.paymentLegendItem}>
                          <span className={styles.paymentLegendDot} style={{ backgroundColor: seg.color }} />
                          <span className={styles.truncate}>{seg.label}</span>
                          <span className={styles.muted}>{Math.round(seg.pct)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Top de Ventas (Semana)</div>
                </div>
                <div className={styles.topProductsList}>
                  {data.topProductosSemana.slice(0, 4).map((p, idx) => (
                    <div key={idx} className={styles.topProductRowCompact}>
                      <div className={styles.topProductInfo}>
                        <span className={`${styles.topProductName} ${styles.truncate}`}>{p.nombre}</span>
                        <span className={styles.topProductDetail}>{p.cantidadVendida} u.</span>
                      </div>
                      <div className={styles.topProductBarOuter}>
                        <div className={styles.topProductBarInner} style={{ width: `${(p.cantidadVendida / data.topProductosSemana[0].cantidadVendida) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Cartera y Morosidad</div>
                </div>
                {AgingWidget ? (
                  <Suspense fallback={<div>Cargando morosidad...</div>}><AgingWidget /></Suspense>
                ) : (
                  <div className={styles.carteraSummary}>
                    <div className={styles.carteraStatRow}>
                      <span>Clientes con deuda:</span>
                      <strong>{data.carteraClientes.clientesConDeuda}</strong>
                    </div>
                    <div className={styles.carteraStatRow}>
                      <span>Monto pendiente:</span>
                      <strong className={styles.textWarning}>${data.carteraClientes.deudaTotal.toLocaleString("es-AR")}</strong>
                    </div>
                    <div className={styles.carteraStatRow}>
                       <span>Clientes activos:</span>
                       <span>{data.carteraClientes.clientesActivos}</span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 3. Accesos Directos */}
            <section className={styles.gridActions}>
               <div className={styles.cardAction}>
                  <div className={styles.cardActionIcon}><Storefront size={20} /></div>
                  <div className={styles.cardActionText}>
                    <h4>Gestión de Catálogo</h4>
                    <p>Creá productos, talles y colores detallados.</p>
                  </div>
                  <Link to="/catalogo/nuevo" className={styles.btnAction}>Nuevo Producto</Link>
               </div>
               <div className={styles.cardAction}>
                  <div className={styles.cardActionIcon}><UserPlus size={20} /></div>
                  <div className={styles.cardActionText}>
                    <h4>Administración CRM</h4>
                    <p>Gestioná deudas y perfiles de clientes 360.</p>
                  </div>
                  <Link to="/clientes" className={styles.btnAction}>Ver Cartera</Link>
               </div>
            </section>




            {/* Módulos que podés adquirir (tarjetas tipo precios) */}
            <section className={styles.modulosSection} aria-label="Módulos disponibles">
              <h2 className={styles.modulosSectionTitle}>
                Módulos que podés adquirir
              </h2>
              <div className={styles.modulosPillGroup} aria-hidden="true">
                <span className={styles.modulosPill}>Más usado por tiendas como la tuya</span>
              </div>
              <div className={styles.modulosGrid}>
                {modulosDisponibles.map((mod) => (
                  <div
                    key={mod.id}
                    className={`${styles.moduloCard} ${mod.destacado ? styles.moduloCardFeatured : ""
                      }`}
                  >
                    <div className={styles.moduloCardHeader}>
                      <h3 className={styles.moduloCardTitle}>{mod.nombre}</h3>
                      <span className={styles.moduloCardBadgeRight}>
                        Módulo
                      </span>
                    </div>
                    <div className={styles.moduloCardPrecioBlock}>
                      <span className={styles.moduloCardPrecioPrincipal}>
                        {mod.precio}
                      </span>
                      <span className={styles.moduloCardPrecioSub}>
                        {mod.beneficioCorto}
                      </span>
                    </div>
                    <p className={styles.moduloCardDesc}>{mod.descripcion}</p>
                    <ul className={styles.moduloCardFeatures}>
                      {mod.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <div className={styles.moduloCardMetaRow}>
                      <span className={styles.moduloCardCounter}>
                        {mod.adquiridos.toLocaleString("es-AR")} cuentas ya lo usan
                      </span>
                    </div>
                    <button
                      type="button"
                      className={
                        mod.destacado
                          ? styles.moduloCardBtnPrimary
                          : styles.moduloCardBtnGhost
                      }
                    >
                      Adquirilo ya
                    </button>
                  </div>
                ))}
              </div>
              <p className={styles.modulosFootnote}>
                Todos los precios serán en pesos argentinos. No hay costos ocultos ni
                instalación obligatoria: vas a poder activar cada módulo cuando lo necesites.
              </p>
            </section>
          </>
        )}
      </main>
    </>
  );
}
