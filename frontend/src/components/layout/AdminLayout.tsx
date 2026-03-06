import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import { Database, ShieldCheck, SignOut, HardDrives, Binoculars } from '@phosphor-icons/react';
import styles from './AdminLayout.module.css';

export function AdminLayout() {
    const { user, logout, checkTokenValidity } = useAuthStore();

    if (!checkTokenValidity()) {
        return <Navigate to="/login" replace />;
    }

    // Protección de Frontera: Enum 1 (or "SuperAdmin") corresponde a SuperAdmin según SystemRole.cs
    if (user?.rol !== 1 && user?.rol !== 'SuperAdmin') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.brand}>
                    <ShieldCheck size={28} color="var(--color-error)" weight="duotone" />
                    <div className={styles.brandText}>
                        <h1>SaaS Root</h1>
                        <span>Telemetría Global</span>
                    </div>
                </div>

                <nav className={styles.nav}>
                    <NavLink to="/admin/tenants" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                        <Database size={20} />
                        Inquilinos (Tenants)
                    </NavLink>
                    <NavLink to="/admin/health" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                        <HardDrives size={20} />
                        Salud (Health)
                    </NavLink>
                    <NavLink to="/admin/audit" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                        <Binoculars size={20} />
                        Auditoría Forense
                    </NavLink>
                </nav>

                <div className={styles.footer}>
                    <button className={styles.logoutBtn} onClick={logout}>
                        <SignOut size={20} />
                        Cerrar Sesión Root
                    </button>
                </div>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.topbar}>
                    <div className={styles.warningBanner}>
                        ⚠️ ESTÁS EN ZONA SUPERADMIN: ACCESO A DATOS Y LOGS CRUZADOS DE TODOS LOS INQUILINOS ESTÁ HABILITADO.
                    </div>
                </header>

                <div className={styles.scrollArea}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
