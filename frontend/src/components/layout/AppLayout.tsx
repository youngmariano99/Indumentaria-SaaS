import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
    House,
    Package,
    ChartLine,
    GearSix,
    Folder,
    Users,
    Swap,
    UserCircle,
    CashRegister,
    DownloadSimple,
    SignOut
} from "@phosphor-icons/react";
import { useAuthStore } from "../../features/auth/store/authStore";
import { ReloadPrompt } from "../ReloadPrompt";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import { useSyncManager } from "../../hooks/useSyncManager";
import { MobileTabBar } from "./MobileTabBar";
import styles from "./AppLayout.module.css";

/**
 * Layout compartido para todas las rutas protegidas.
 * Contiene el sidebar/nav extraído de DashboardPage.
 * El contenido de cada ruta se inyecta via <Outlet />.
 */
export function AppLayout() {
    const { logout } = useAuthStore();
    const { isInstallable, promptInstall } = usePWAInstall();
    const { isOnline, isSyncing, pendingCount, syncNow } = useSyncManager();
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window === "undefined") return true;
        // En mobile el sidebar arranca siempre colapsado (solo iconos)
        return window.innerWidth > 768;
    });

    // Cerrar automáticamente el sidebar cuando el viewport baja a mobile,
    // y reabrirlo por defecto cuando vuelve a desktop.
    useEffect(() => {
        if (typeof window === "undefined") return;
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
                setMobileDrawerOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleMobileNavClick = () => {
        if (window.innerWidth <= 768) {
            setMobileDrawerOpen(false);
        }
    };

    return (
        <div className={`${styles.shell} ${sidebarOpen ? "" : styles.sidebarCollapsed}`}>
            {/* Overlay para móviles */}
            <div
                className={`${styles.mobileOverlay} ${mobileDrawerOpen ? styles.mobileOverlayActive : ""}`}
                onClick={() => setMobileDrawerOpen(false)}
            />

            <aside className={`${styles.sidebar} ${sidebarOpen && !mobileDrawerOpen ? "" : styles.sidebarCollapsed} ${mobileDrawerOpen ? styles.mobileDrawerOpen : ""} ${mobileDrawerOpen ? styles.forceExpanded : ""}`}>
                <div className={styles.sidebarHeader}>
                    {/* Logo minimal: solo usamos el espacio para el toggle, sin marca visual */}
                    <div className={styles.sidebarLogo} />
                    <button
                        type="button"
                        className={styles.sidebarToggle}
                        aria-label={sidebarOpen ? "Colapsar menú" : "Expandir menú"}
                        onClick={() => {
                            // En mobile no permitimos expandir el sidebar (solo iconos)
                            if (typeof window !== "undefined" && window.innerWidth <= 768) return;
                            setSidebarOpen(v => !v);
                        }}
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
                        onClick={handleMobileNavClick}
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
                        onClick={handleMobileNavClick}
                    >
                        <span className={styles.navItemIcon}>
                            <Package size={20} weight="bold" />
                        </span>
                        <span>Catálogo</span>
                    </NavLink>

                    <NavLink
                        to="/categorias"
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                        }
                        onClick={handleMobileNavClick}
                    >
                        <span className={styles.navItemIcon}>
                            <Folder size={20} weight="bold" />
                        </span>
                        <span>Categorías</span>
                    </NavLink>

                    <NavLink
                        to="/pos"
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                        }
                        onClick={handleMobileNavClick}
                    >
                        <span className={styles.navItemIcon}>🛒</span>
                        <span>Punto de venta</span>
                    </NavLink>

                    <NavLink
                        to="/devoluciones"
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                        }
                        onClick={handleMobileNavClick}
                    >
                        <span className={styles.navItemIcon}>
                            <Swap size={20} weight="bold" />
                        </span>
                        <span>Devoluciones</span>
                    </NavLink>

                    <NavLink
                        to="/arqueo"
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                        }
                        onClick={handleMobileNavClick}
                    >
                        <span className={styles.navItemIcon}>
                            <CashRegister size={20} weight="bold" />
                        </span>
                        <span>Arqueo de Caja</span>
                    </NavLink>

                    <NavLink
                        to="/reportes"
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                        }
                        onClick={handleMobileNavClick}
                    >
                        <span className={styles.navItemIcon}>
                            <ChartLine size={20} weight="bold" />
                        </span>
                        <span>Reportes</span>
                    </NavLink>

                    <NavLink
                        to="/clientes"
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                        }
                        onClick={handleMobileNavClick}
                    >
                        <span className={styles.navItemIcon}>
                            <Users size={20} weight="bold" />
                        </span>
                        <span>Clientes y CRM</span>
                    </NavLink>

                    <NavLink
                        to="/cuenta"
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                        }
                        onClick={handleMobileNavClick}
                    >
                        <span className={styles.navItemIcon}>
                            <UserCircle size={20} weight="bold" />
                        </span>
                        <span>Mi cuenta</span>
                    </NavLink>

                    <NavLink
                        to="/ajustes"
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                        }
                        onClick={handleMobileNavClick}
                    >
                        <span className={styles.navItemIcon}>
                            <GearSix size={20} weight="bold" />
                        </span>
                        <span>Configuración</span>
                    </NavLink>
                </nav>

                <div className={styles.navFooter}>
                    {isInstallable && (
                        <button
                            onClick={promptInstall}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: '#e2e8f0',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.85rem',
                                marginBottom: '12px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent' }}
                        >
                            <DownloadSimple size={18} />
                            {sidebarOpen && <span>Instalar App</span>}
                        </button>
                    )}

                    <button
                        onClick={logout}
                        className={styles.logoutBtn}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: '1px solid rgba(220, 38, 38, 0.3)',
                            color: '#dc2626',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.85rem',
                            marginBottom: '12px',
                            transition: 'all 0.2s',
                            justifyContent: sidebarOpen ? 'flex-start' : 'center'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(220, 38, 38, 0.06)' }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                        <SignOut size={18} />
                        {sidebarOpen && <span>Cerrar Sesión</span>}
                    </button>

                    <div style={{ textAlign: sidebarOpen ? 'left' : 'center', width: '100%' }}>Appy Studios</div>
                </div>
            </aside>

            <div className={styles.main}>
                {!isOnline && (
                    <div style={{ background: '#f59e0b', color: 'white', padding: '8px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
                        Aviso: Estás operando sin conexión a Internet. {pendingCount > 0 && `(${pendingCount} pendientes)`}
                    </div>
                )}
                {isOnline && isSyncing && (
                    <div style={{ background: '#3b82f6', color: 'white', padding: '8px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
                        Sincronizando {pendingCount} operaciones pendientes...
                    </div>
                )}
                {isOnline && pendingCount > 0 && !isSyncing && (
                    <div style={{ background: '#10b981', color: 'white', padding: '8px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                        Restablecida la red local. <button onClick={syncNow} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Sincronizar Ya ({pendingCount})</button>
                    </div>
                )}

                <Outlet />
                <ReloadPrompt />
            </div>

            <MobileTabBar onOpenDrawer={() => setMobileDrawerOpen(true)} />
        </div>
    );
}
