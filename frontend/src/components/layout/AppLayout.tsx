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
    UserCircle
} from "@phosphor-icons/react";
import styles from "./AppLayout.module.css";

/**
 * Layout compartido para todas las rutas protegidas.
 * Contiene el sidebar/nav extraído de DashboardPage.
 * El contenido de cada ruta se inyecta via <Outlet />.
 */
export function AppLayout() {
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
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className={`${styles.shell} ${sidebarOpen ? "" : styles.sidebarCollapsed}`}>
            <aside className={`${styles.sidebar} ${sidebarOpen ? "" : styles.sidebarCollapsed}`}>
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
                        to="/categorias"
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                        }
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
                    >
                        <span className={styles.navItemIcon}>🛒</span>
                        <span>Punto de venta</span>
                    </NavLink>

                    <NavLink
                        to="/devoluciones"
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                        }
                    >
                        <span className={styles.navItemIcon}>
                            <Swap size={20} weight="bold" />
                        </span>
                        <span>Devoluciones</span>
                    </NavLink>

                    <button
                        type="button"
                        className={styles.navItem}
                    >
                        <span className={styles.navItemIcon}>
                            <ChartLine size={20} weight="bold" />
                        </span>
                        <span>Reportes</span>
                    </button>

                    <NavLink
                        to="/clientes"
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                        }
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
                    >
                        <span className={styles.navItemIcon}>
                            <GearSix size={20} weight="bold" />
                        </span>
                        <span>Configuración</span>
                    </NavLink>
                </nav>

                <div className={styles.navFooter}>
                    <div>Appy Studios</div>
                </div>
            </aside>

            <div className={styles.main}>
                <Outlet />
            </div>
        </div>
    );
}
