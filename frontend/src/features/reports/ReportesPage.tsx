import { useEffect, useState, useMemo } from "react";
import { TrendUp, Warning, ChartPieSlice, PresentationChart, Ranking, Wallet } from "@phosphor-icons/react";
import {
    ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    AreaChart, Area
} from "recharts";
import { reportsApi, type PulsoDiarioDto, type ReporteCorporativoDto } from "./api/reportsApi";
import styles from "./ReportesPage.module.css";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4"];

export function ReportesPage() {
    const [mode, setMode] = useState<"pulso" | "corporativo">("pulso");
    const [pulsoData, setPulsoData] = useState<PulsoDiarioDto | null>(null);
    const [corpData, setCorpData] = useState<ReporteCorporativoDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [mode]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (mode === "pulso") {
                const data = await reportsApi.getPulsoDiario();
                setPulsoData(data);
            } else {
                const data = await reportsApi.getReporteCorporativo();
                setCorpData(data);
            }
        } catch (error) {
            console.error("Error al cargar reportes:", error);
        } finally {
            setLoading(false);
        }
    };

    const paymentChartData = useMemo(() => {
        if (!pulsoData) return [];
        return pulsoData.metodoPagoResumen.map(m => ({
            name: m.nombre,
            value: m.montoTotal
        }));
    }, [pulsoData]);

    const topProductsData = useMemo(() => {
        if (!pulsoData) return [];
        return pulsoData.productosEstrella.map(p => ({
            name: p.nombre.length > 15 ? p.nombre.substring(0, 12) + "..." : p.nombre,
            monto: p.totalMonto,
            unidades: p.cantidadVendida
        }));
    }, [pulsoData]);

    const abcChartData = useMemo(() => {
        if (!corpData) return [];
        return corpData.matrizABC.slice(0, 10).map(item => ({
            name: item.productoNombre.length > 20 ? item.productoNombre.substring(0, 17) + "..." : item.productoNombre,
            ingresos: item.ingresosAcumulados,
            rentabilidad: item.rentabilidad,
            clase: item.clasificacion
        }));
    }, [corpData]);

    if (loading && !pulsoData && !corpData) {
        return <div className={styles.loading}>Cargando inteligencia de negocio...</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>Centro de Inteligencia</h1>
                    <p className={styles.subtitle}>Análisis avanzado y reportes estratégicos</p>
                </div>
                <div className={styles.controls}>
                    <button
                        className={`${styles.toggleBtn} ${mode === "pulso" ? styles.toggleBtnActive : ""}`}
                        onClick={() => setMode("pulso")}
                    >
                        <Wallet size={16} mirrored={false} /> Pulso Diario
                    </button>
                    <button
                        className={`${styles.toggleBtn} ${mode === "corporativo" ? styles.toggleBtnActive : ""}`}
                        onClick={() => setMode("corporativo")}
                    >
                        <PresentationChart size={16} /> Corporativo
                    </button>
                </div>
            </header>

            {mode === "pulso" && pulsoData && (
                <div className={styles.render}>
                    <div className={styles.kpiGrid}>
                        <div className={styles.kpiCard}>
                            <span className={styles.kpiLabel}>Ventas del Día</span>
                            <span className={styles.kpiValue}>${pulsoData.totalVentasHoy.toLocaleString("es-AR")}</span>
                            <span className={styles.kpiSub}>
                                <Ranking size={14} weight="bold" /> {pulsoData.cantidadTicketsHoy} tickets generados
                            </span>
                        </div>
                        <div className={styles.kpiCard}>
                            <span className={styles.kpiLabel}>Ticket Promedio</span>
                            <span className={styles.kpiValue}>${pulsoData.ticketPromedioHoy.toLocaleString("es-AR")}</span>
                        </div>
                        <div className={styles.kpiCard}>
                            <span className={styles.kpiLabel}>Alertas de Inventario</span>
                            <span className={`${styles.kpiValue} ${pulsoData.variantesBajoStockMinimo > 0 ? styles.colorWarning : ""}`}>
                                {pulsoData.variantesBajoStockMinimo}
                            </span>
                            {pulsoData.variantesBajoStockMinimo > 0 && (
                                <span className={styles.kpiWarning}>
                                    <Warning size={14} weight="fill" /> Revisar stock crítico
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={styles.sectionGrid}>
                        {/* Gráfico de Métodos de Pago */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>
                                    <ChartPieSlice size={20} weight="duotone" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                    Distribución de Cobros
                                </h3>
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.chartContainer}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={paymentChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {paymentChartData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: any) => [`$${Number(value).toLocaleString("es-AR")}`, "Monto"]}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Gráfico de Ranking de Productos */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>Impacto en Facturación (Top 5)</h3>
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.chartContainer}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={topProductsData} layout="vertical" margin={{ left: 40, right: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '12px' }} />
                                            <Tooltip
                                                formatter={(value: any) => [`$${Number(value).toLocaleString("es-AR")}`, "Recaudado"]}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar dataKey="monto" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {mode === "corporativo" && corpData && (
                <div className={styles.render}>
                    <div className={styles.kpiGrid}>
                        <div className={styles.kpiCard}>
                            <span className={styles.kpiLabel}>Rentabilidad Bruta Acumulada</span>
                            <span className={styles.kpiValue}>${corpData.margenBrutoTotal.toLocaleString("es-AR")}</span>
                            <span className={styles.kpiTrend}>
                                <TrendUp size={14} weight="bold" /> {corpData.porcentajeMargenBruto}% eficiencia operativa
                            </span>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 className={styles.cardTitle}>Análisis de Rentabilidad ABC (Pareto)</h3>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', textAlign: 'right' }}>
                                    Visualizando el top de productos por impacto financiero.
                                </div>
                            </div>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.chartContainer} style={{ height: '400px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={abcChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" style={{ fontSize: '10px' }} />
                                        <YAxis style={{ fontSize: '10px' }} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.12)' }}
                                            formatter={(value: any) => `$${Number(value).toLocaleString("es-AR")}`}
                                        />
                                        <Area type="monotone" dataKey="ingresos" stroke="#6366f1" fillOpacity={1} fill="url(#colorIncome)" name="Ingresos Totales" />
                                        <Area type="monotone" dataKey="rentabilidad" stroke="#22c55e" fillOpacity={1} fill="url(#colorProfit)" name="Ganancia Bruta" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className={styles.cardFooter}>
                            Este gráfico muestra la brecha entre el ingreso total y la rentabilidad neta. Los productos Clase A deberían tener la mayor área ocupada.
                        </div>
                    </div>

                    <div className={styles.card} style={{ marginTop: '24px' }}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>Matriz de Clasificación Detallada</h3>
                        </div>
                        <div className={styles.cardContent}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Clase</th>
                                        <th>Producto</th>
                                        <th style={{ textAlign: "right" }}>Ingresos</th>
                                        <th style={{ textAlign: "right" }}>Proporción</th>
                                        <th style={{ textAlign: "right" }}>Rentabilidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {corpData.matrizABC.map((item, i) => (
                                        <tr key={i}>
                                            <td>
                                                <span className={`${styles.badge} ${item.clasificacion === 'A' ? styles.badgeA : item.clasificacion === 'B' ? styles.badgeB : styles.badgeC}`}>
                                                    Clase {item.clasificacion}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 500 }}>{item.productoNombre}</td>
                                            <td style={{ textAlign: "right" }}>${item.ingresosAcumulados.toLocaleString("es-AR")}</td>
                                            <td style={{ textAlign: "right" }}>{item.porcentajeDelTotal}%</td>
                                            <td style={{ textAlign: "right", color: item.rentabilidad > 0 ? '#166534' : '#991b1b', fontWeight: 600 }}>
                                                ${item.rentabilidad.toLocaleString("es-AR")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
