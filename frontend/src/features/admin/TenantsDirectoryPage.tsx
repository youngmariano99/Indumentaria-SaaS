import { useAdminTenants } from './hooks/useAdminTenants';
import type { TenantAdmin } from './hooks/useAdminTenants';
import { Database, CheckCircle, XCircle } from '@phosphor-icons/react';
import styles from './TenantsDirectoryPage.module.css';

export function TenantsDirectoryPage() {
    const { data: tenants, isLoading, isError } = useAdminTenants();

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Contactando Centro de Datos...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={styles.errorContainer}>
                <h3>Acceso Denegado o Error de Conexión</h3>
                <p>No se pudo recuperar la matriz de inquilinos global. Verifique sus permisos SuperAdmin.</p>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div>
                    <h2>Directorio de Inquilinos</h2>
                    <p>Módulo SRE. Mostrando todas las instancias aisladas (Tenants) de la plataforma.</p>
                </div>
                <div className={styles.statChip}>
                    <Database size={16} />
                    {tenants?.length || 0} Tiendas Activas
                </div>
            </header>

            <div className={styles.tableCard}>
                <table className={styles.adminTable}>
                    <thead>
                        <tr>
                            <th>ID (UUID)</th>
                            <th>Local / Fantasía</th>
                            <th>Razón Social</th>
                            <th>URL Subdominio</th>
                            <th>Plan</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants?.map((t: TenantAdmin) => (
                            <tr key={t.id}>
                                <td className={styles.uuidCell}>{t.id.split('-')[0]}***</td>
                                <td className={styles.boldCell}>{t.nombre}</td>
                                <td>{t.empresaRazonSocial}</td>
                                <td>
                                    <span className={styles.urlPill}>{t.subdominio}.saas.com</span>
                                </td>
                                <td>
                                    <span className={styles.planBadge}>{t.plan}</span>
                                </td>
                                <td>
                                    {t.activo ? (
                                        <span className={styles.statusOk}><CheckCircle weight="fill" /> Activo</span>
                                    ) : (
                                        <span className={styles.statusSuspended}><XCircle weight="fill" /> Suspendido</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {tenants?.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                                    No hay inquilinos en la base de datos central.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
