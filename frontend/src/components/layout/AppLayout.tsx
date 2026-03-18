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
    SignOut,
    Truck
} from "@phosphor-icons/react";
import { useAuthStore } from "../../features/auth/store/authStore";
import { ReloadPrompt } from "../ReloadPrompt";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import { useSyncManager } from "../../hooks/useSyncManager";
import { MobileTabBar } from "./MobileTabBar";
import { apiClient } from "../../lib/apiClient";
import { FeedbackOverlay } from "../../shared/components/FeedbackOverlay";
import { SelectorAccesoRapido } from "../../features/equipo/components/SelectorAccesoRapido";
import { SelectorSucursalHeader } from "../../features/sucursales/components/SelectorSucursalHeader";
import { useFeatureStore } from "../../store/featureStore";
import styles from "./AppLayout.module.css";

/**
 * Layout compartido para todas las rutas protegidas.
 */
export function AppLayout() {
    const { logout, user } = useAuthStore();
    const isOwner = user?.rol?.toString() === '2' || user?.rol === 'Owner' || user?.rol === 'owner';
    const { isInstallable, promptInstall } = usePWAInstall();
    const { isOnline, pendingCount } = useSyncManager();
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window === "undefined") return true;
        return window.innerWidth > 768;
    });
    const [isSwitchingUser, setIsSwitchingUser] = useState(false);
    const features = useFeatureStore(s => s.features);
    
    // Si es Owner, ve todo. Si no, consultamos el Feature Store.
    const canSeeVentas = isOwner || !!features['Ventas'];
    const canSeeCatalog = isOwner || !!features['Catalog'];
    const canSeeReports = isOwner || !!features['Reports'];
    const canSeeCRM = isOwner || !!features['CRM'];
    const canSeeProviders = isOwner || !!features['Providers'];
    const token = useAuthStore(s => s.token);
    const fetchFeatures = useFeatureStore(s => s.fetchFeatures);
    const initialized = useFeatureStore(s => s.initialized);

    useEffect(() => {
        if (!initialized && token) {
            fetchFeatures();
        }
    }, [initialized, token, fetchFeatures]);

    useEffect(() => {
        if (!token) return;
        const pingServer = async () => {
            try {
                let deviceId = localStorage.getItem("pwa_device_id");
                if (!deviceId) {
                    deviceId = "POS-" + Math.random().toString(36).substring(2, 6).toUpperCase();
                    localStorage.setItem("pwa_device_id", deviceId);
                }
                await apiClient.post("/telemetria/pwa-ping", {
                    dispositivoId: deviceId,
                    nombreDispositivo: (navigator.userAgent.includes("Mobile") ? "Celular POS " : "PC Caja ") + deviceId,
                    appVersion: "1.2.0-SaaS",
                    itemsPendientesSubida: pendingCount
                });
            } catch (err) {}
        };
        pingServer();
        const intervalId = setInterval(pingServer, 20000);
        return () => clearInterval(intervalId);
    }, [token, pendingCount]);

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
            <div
                className={`${styles.mobileOverlay} ${mobileDrawerOpen ? styles.mobileOverlayActive : ""}`}
                onClick={() => setMobileDrawerOpen(false)}
            />

            <aside className={`${styles.sidebar} ${sidebarOpen && !mobileDrawerOpen ? "" : styles.sidebarCollapsed} ${mobileDrawerOpen ? styles.mobileDrawerOpen : ""} ${mobileDrawerOpen ? styles.forceExpanded : ""}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.sidebarLogo} />
                    <button
                        type="button"
                        className={styles.sidebarToggle}
                        onClick={() => {
                            if (typeof window !== "undefined" && window.innerWidth <= 768) return;
                            setSidebarOpen(v => !v);
                        }}
                    >
                        ☰
                    </button>
                </div>

                <nav className={styles.nav}>
                    <NavLink to="/dashboard" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ""}`} onClick={handleMobileNavClick}>
                        <span className={styles.navItemIcon}><House size={20} weight="bold" /></span>
                        <span>Dashboard</span>
                    </NavLink>

                    {canSeeCatalog && (
                        <>
                            <NavLink to="/catalogo" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ""}`} onClick={handleMobileNavClick}>
                                <span className={styles.navItemIcon}><Package size={20} weight="bold" /></span>
                                <span>Catálogo</span>
                            </NavLink>

                            <NavLink to="/categorias" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ""}`} onClick={handleMobileNavClick}>
                                <span className={styles.navItemIcon}><Folder size={20} weight="bold" /></span>
                                <span>Categorías</span>
                            </NavLink>
                        </>
                    )}

                    {canSeeVentas && (
                        <>
                            <NavLink to="/pos" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ""}`} onClick={handleMobileNavClick}>
                                <span className={styles.navItemIcon}>🛒</span>
                                <span>Punto de venta</span>
                            </NavLink>

                            <NavLink to="/devoluciones" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ""}`} onClick={handleMobileNavClick}>
                                <span className={styles.navItemIcon}><Swap size={20} weight="bold" /></span>
                                <span>Devoluciones</span>
                            </NavLink>

                            <NavLink to="/arqueo" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ""}`} onClick={handleMobileNavClick}>
                                <span className={styles.navItemIcon}><CashRegister size={20} weight="bold" /></span>
                                <span>Arqueo de Caja</span>
                            </NavLink>
                        </>
                    )}

                    {canSeeReports && (
                        <NavLink to="/reportes" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ""}`} onClick={handleMobileNavClick}>
                            <span className={styles.navItemIcon}><ChartLine size={20} weight="bold" /></span>
                            <span>Reportes</span>
                        </NavLink>
                    )}

                    {canSeeCRM && (
                        <NavLink to="/clientes" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ""}`} onClick={handleMobileNavClick}>
                            <span className={styles.navItemIcon}><Users size={20} weight="bold" /></span>
                            <span>Clientes y CRM</span>
                        </NavLink>
                    )}

                    {isOwner && (
                        <NavLink to="/equipo" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ""}`} onClick={handleMobileNavClick}>
                            <span className={styles.navItemIcon}><Users size={20} weight="bold" /></span>
                            <span>Mi Equipo</span>
                        </NavLink>
                    )}

                    {canSeeProviders && (
                        <NavLink to="/proveedores" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ""}`} onClick={handleMobileNavClick}>
                            <span className={styles.navItemIcon}><Truck size={20} weight="bold" /></span>
                            <span>Proveedores</span>
                        </NavLink>
                    )}

                    <NavLink to="/cuenta" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ""}`} onClick={handleMobileNavClick}>
                        <span className={styles.navItemIcon}><UserCircle size={20} weight="bold" /></span>
                        <span>Mi cuenta</span>
                    </NavLink>

                    {isOwner && (
                        <NavLink to="/ajustes" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ""}`} onClick={handleMobileNavClick}>
                            <span className={styles.navItemIcon}><GearSix size={20} weight="bold" /></span>
                            <span>Configuración</span>
                        </NavLink>
                    )}

                    {/* Acción de Cambio de Turno mediante PIN */}
                    <button 
                        className={styles.navItem} 
                        style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', marginTop: 'auto' }}
                        onClick={() => setIsSwitchingUser(true)}
                    >
                        <span className={styles.navItemIcon}>
                            <Swap size={20} weight="bold" color="#ea580c" />
                        </span>
                        <span style={{ color: '#ea580c', fontWeight: 700 }}>Cambiar Usuario</span>
                    </button>
                </nav>

                <div className={styles.navFooter}>
                    {isInstallable && (
                        <button onClick={promptInstall} className={styles.pwaBtn} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '12px' }}>
                            <DownloadSimple size={18} />
                            {sidebarOpen && <span>Instalar App</span>}
                        </button>
                    )}

                    <button onClick={logout} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(220, 38, 38, 0.3)', color: '#dc2626', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '12px', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
                        <SignOut size={18} />
                        {sidebarOpen && <span>Cerrar Sesión</span>}
                    </button>

                    <div style={{ fontSize: '10px', opacity: 0.5, textAlign: 'center' }}>Appy Studios v1.2</div>
                </div>
            </aside>

            <main className={styles.shellMain}>
                {/* Header Superior con Selector de Sucursal y Perfil */}
                <header style={{ 
                    height: '64px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0 24px', 
                    background: 'white', 
                    borderBottom: '1px solid var(--color-gray-200)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {!sidebarOpen && !mobileDrawerOpen && (
                             <button
                                type="button"
                                className={styles.sidebarToggle}
                                onClick={() => setSidebarOpen(true)}
                                style={{ background: 'var(--color-gray-100)', color: 'var(--color-primary)' }}
                            >
                                ☰
                            </button>
                        )}
                        <SelectorSucursalHeader />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {isOnline ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16a34a', background: '#f0fdf4', padding: '4px 8px', borderRadius: '999px', fontWeight: 600 }}>
                                <div style={{ width: '6px', height: '6px', background: '#16a34a', borderRadius: '50%' }} />
                                Online
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#ea580c', background: '#fff7ed', padding: '4px 8px', borderRadius: '999px', fontWeight: 600 }}>
                                <div style={{ width: '6px', height: '6px', background: '#ea580c', borderRadius: '50%' }} />
                                Offline {pendingCount > 0 && `(${pendingCount} pend.)`}
                            </div>
                        )}

                        <div style={{ width: '1px', height: '24px', background: 'var(--color-gray-200)', margin: '0 4px' }} />
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--color-gray-900)' }}>{user?.nombre}</p>
                                <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-gray-500)', fontWeight: 500 }}>{user?.rol}</p>
                            </div>
                            <div style={{ 
                                width: '36px', 
                                height: '36px', 
                                borderRadius: '50%', 
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-focus))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '14px'
                            }}>
                                {user?.nombre?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {!isOnline && (
                    <div style={{ background: '#f59e0b', color: 'white', padding: '8px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
                        Aviso: Estás operando sin conexión a Internet. {pendingCount > 0 && `(${pendingCount} operaciones pendientes)`}
                    </div>
                )}
                <div className={styles.shellContent}>
                    <Outlet />
                </div>
            </main>

            {isSwitchingUser && (
                <SelectorAccesoRapido onClose={() => setIsSwitchingUser(false)} />
            )}

            <MobileTabBar onOpenDrawer={() => setMobileDrawerOpen(true)} />
            <FeedbackOverlay />
            <ReloadPrompt />
        </div>
    );
}
