import { useQuery } from '@tanstack/react-query';
import { adminInsightsApi } from './api/adminInsightsApi';
import {
    Users,
    TrendUp,
    WarningCircle,
    Ghost,
    Storefront,
    CalendarCheck
} from '@phosphor-icons/react';
import styles from './AdminInsightsPage.module.css';

export function AdminInsightsPage() {
    const { data: usage, isLoading: loadingUsage } = useQuery({
        queryKey: ['admin-insights-usage'],
        queryFn: adminInsightsApi.getUsageStats,
        refetchInterval: 60000
    });

    const { data: ghostInventory, isLoading: loadingGhost } = useQuery({
        queryKey: ['admin-insights-ghost'],
        queryFn: adminInsightsApi.getGhostInventory
    });

    const { data: churnRisk, isLoading: loadingChurn } = useQuery({
        queryKey: ['admin-insights-churn'],
        queryFn: adminInsightsApi.getChurnRisk
    });

    if (loadingUsage && loadingGhost && loadingChurn) {
        return <div className={styles.loading}>Cargando inteligencia de negocios...</div>;
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1><TrendUp size={32} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> SaaS Insights & Analytics</h1>
                <p>Métricas de adopción, retención y salud comercial del ecosistema multitenant.</p>
            </header>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}><Users size={20} /> Usuarios Activos Hoy (Global)</span>
                    <span className={styles.statValue}>{usage?.globalDau ?? 0}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}><CalendarCheck size={20} /> Retención Semanal</span>
                    <span className={styles.statValue}>94.2%</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}><Storefront size={20} /> Tiendas con Actividad</span>
                    <span className={styles.statValue}>{usage?.topTenants.length ?? 0}</span>
                </div>
            </div>

            <div className={styles.mainGrid}>
                {/* Tabla de Top Tenants */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <Storefront size={20} />
                        <h2>Adopción por Tienda (DAU)</h2>
                    </div>
                    <div className={styles.sectionContent}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Inquilino</th>
                                    <th>Usuarios</th>
                                    <th>Crecimiento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usage?.topTenants.map(tenant => (
                                    <tr key={tenant.tenantId}>
                                        <td><strong>{tenant.tenantName}</strong></td>
                                        <td>{tenant.activeUsersCount}</td>
                                        <td style={{ color: '#22c55e' }}>+{tenant.growthPercentage.toFixed(1)}%</td>
                                    </tr>
                                ))}
                                {usage?.topTenants.length === 0 && (
                                    <tr><td colSpan={3} style={{ textAlign: 'center' }}>Sin datos hoy</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Alertas de Churn */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <WarningCircle size={20} color="#ef4444" />
                        <h2>Riesgo de Churn (Abandono)</h2>
                    </div>
                    <div className={styles.sectionContent}>
                        <div className={styles.alertRow}>
                            {churnRisk?.map(risk => (
                                <div key={risk.tenantId} className={`${styles.itemCard} ${risk.nivelRiesgo === 'Crítico' ? styles.riskHigh : styles.riskMedium}`}>
                                    <div className={styles.itemTitle}>
                                        <strong>{risk.tenantName}</strong>
                                        <span className={`${styles.badge} ${risk.nivelRiesgo === 'Crítico' ? styles.badgeRiskHigh : styles.badgeRiskMedium}`}>
                                            {risk.nivelRiesgo}
                                        </span>
                                    </div>
                                    <p className={styles.itemMeta}>{risk.motivo}</p>
                                </div>
                            ))}
                            {churnRisk?.length === 0 && (
                                <p style={{ color: '#64748b' }}>No hay inquilinos en riesgo detectados.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Inventario Fantasma */}
                <div className={styles.section} style={{ gridColumn: 'span 2' }}>
                    <div className={styles.sectionHeader}>
                        <Ghost size={20} color="#8b5cf6" />
                        <h2>Detección de Inventario Fantasma (Probabilidad de Discrepancia)</h2>
                    </div>
                    <div className={styles.sectionContent}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Tienda</th>
                                    <th>Última Venta</th>
                                    <th>Score Riesgo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ghostInventory?.map(item => (
                                    <tr key={item.productoId}>
                                        <td><strong>{item.nombreProducto}</strong></td>
                                        <td>{item.tenantName}</td>
                                        <td>{new Date(item.ultimaVenta).toLocaleDateString()}</td>
                                        <td>
                                            <span className={styles.badgeRiskHigh} style={{ padding: '2px 8px', borderRadius: '4px' }}>
                                                {item.probabilidadDiscrepancia}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {ghostInventory?.length === 0 && (
                                    <tr><td colSpan={4} style={{ textAlign: 'center' }}>Sin discrepancias detectadas.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
