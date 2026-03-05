import { useAdminHealth } from './hooks/useAdminHealth';
import {
    XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { HardDrives, ChartLineUp, WarningCircle } from '@phosphor-icons/react';
import styles from './HealthDashboardPage.module.css';

// Colores de la paleta tech
const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#38bdf8'];

export function HealthDashboardPage() {
    const { data: health, isLoading, isError } = useAdminHealth();

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Estableciendo enlace de telemetría P99...</p>
            </div>
        );
    }

    if (isError || !health) {
        return (
            <div className={styles.errorContainer}>
                <WarningCircle size={48} />
                <h3>Fallo de Enlace SRE</h3>
                <p>El nodo principal no responde a métricas pg_stat_activity.</p>
            </div>
        );
    }

    // Preparamos datos simulados de línea de tiempo basándonos en el valor actual 
    // (En modo real esto sería un array de historical de la última hora traído del Backend)
    const cpuHistory = Array.from({ length: 20 }, (_, i) => ({
        name: `T-${20 - i}`,
        cpu: Math.max(0, health.systemCpuUsagePercentage - Math.random() * 20 + 10)
    }));

    const transactionData = [
        { name: 'Commited', value: health.totalTransactionsCommited },
        { name: 'Rollback', value: health.totalTransactionsRolledBack }
    ];

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div>
                    <h2>Telemetry HUD</h2>
                    <p>Estado del cluster PostgreSQL Neon y Carga de Nodos.</p>
                </div>
                <div className={styles.statusLive}>
                    <div className={styles.blinker}></div>
                    Live Sync
                </div>
            </header>

            {/* Tarjetas Superiores */}
            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>Conexiones Activas DB</div>
                    <div className={styles.kpiValue}>
                        {health.activeConnections} <span className={styles.kpiSub}>/ {health.maxConnections} max</span>
                    </div>
                    <div className={styles.kpiBar}>
                        <div
                            className={styles.kpiFill}
                            style={{ width: `${(health.activeConnections / health.maxConnections) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>Uso Estimado CPU</div>
                    <div className={styles.kpiValue}>
                        {health.systemCpuUsagePercentage.toFixed(1)}%
                    </div>
                    <div className={styles.kpiBar}>
                        <div
                            className={styles.kpiFillWarning}
                            style={{ width: `${health.systemCpuUsagePercentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>Cache Hit Ratio (PostgreSQL)</div>
                    <div className={styles.kpiValue}>
                        {health.cacheHitRatio.toFixed(2)}%
                    </div>
                    <p className={styles.kpiDesc}>El {health.cacheHitRatio.toFixed(0)}% de las consultas se leen de RAM, no de disco.</p>
                </div>
            </div>

            {/* Gráficos */}
            <div className={styles.chartsGrid}>
                {/* Historial CPU */}
                <div className={styles.chartBox}>
                    <h3><ChartLineUp size={20} /> Historial Stress CPU</h3>
                    <div className={styles.graphWrapper}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cpuHistory}>
                                <defs>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Area type="monotone" dataKey="cpu" stroke="#38bdf8" fillOpacity={1} fill="url(#colorCpu)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Transacciones Fallidas vs Exitosas */}
                <div className={styles.chartBox}>
                    <h3><HardDrives size={20} /> Estabilidad Transaccional</h3>
                    <div className={styles.graphWrapper}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={transactionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {transactionData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={styles.pieLegend}>
                        <div className={styles.legendItem}>
                            <span className={styles.dot} style={{ backgroundColor: COLORS[0] }}></span>
                            Commited ({health.totalTransactionsCommited})
                        </div>
                        <div className={styles.legendItem}>
                            <span className={styles.dot} style={{ backgroundColor: COLORS[1] }}></span>
                            Rollback ({health.totalTransactionsRolledBack})
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
