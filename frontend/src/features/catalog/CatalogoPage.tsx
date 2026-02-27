import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  House,
  Package,
  PlusCircle,
  Tag,
  Palette,
  WarningCircle,
  Storefront,
  UserPlus,
  GearSix,
  ChartLine,
} from "@phosphor-icons/react";
import { catalogApi } from "./api/catalogApi";
import type { ProductoConVariantes } from "./types";
import layoutStyles from "../dashboard/DashboardPage.module.css";
import catalogStyles from "./CatalogoPage.module.css";

/**
 * Página principal del catálogo de productos.
 * Obtiene los productos del backend (GET /api/productos) y los muestra en una grilla de cards.
 * Cada card muestra el nombre, precio, temporada y los chips de variantes (talle/color).
 */
export function CatalogoPage() {
    const [productos, setProductos] = useState<ProductoConVariantes[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window === "undefined") {
            return true;
        }
        return window.innerWidth > 768;
    });

    useEffect(() => {
        let cancelado = false;

        const cargar = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await catalogApi.obtenerCatalogo();
                if (!cancelado) setProductos(data);
            } catch {
                if (!cancelado) setError("No pudimos cargar el catálogo. Revisá la conexión con el servidor.");
            } finally {
                if (!cancelado) setLoading(false);
            }
        };

        cargar();
        return () => { cancelado = true; };
    }, []);

    const totalVariantes = productos.reduce((acc, p) => acc + p.variantes.length, 0);

    return (
        <div className={`${layoutStyles.shell} ${sidebarOpen ? "" : layoutStyles.sidebarCollapsed}`}>
            <aside
                className={`${layoutStyles.sidebar} ${
                    sidebarOpen ? "" : layoutStyles.sidebarCollapsed
                }`}
            >
                <div className={layoutStyles.sidebarHeader}>
                    <div className={layoutStyles.sidebarLogo}>
                        <div className={layoutStyles.sidebarLogoMark}>PI</div>
                        <span>POS Indumentaria</span>
                    </div>
                    <button
                        type="button"
                        className={layoutStyles.sidebarToggle}
                        aria-label={sidebarOpen ? "Colapsar menú" : "Expandir menú"}
                        onClick={() => setSidebarOpen((v) => !v)}
                    >
                        ☰
                    </button>
                </div>

                <nav className={layoutStyles.nav} aria-label="Navegación principal">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `${layoutStyles.navItem} ${isActive ? layoutStyles.navItemActive : ""}`
                        }
                    >
                        <span className={layoutStyles.navItemIcon}>
                            <House size={20} weight="bold" />
                        </span>
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/catalogo"
                        className={({ isActive }) =>
                            `${layoutStyles.navItem} ${isActive ? layoutStyles.navItemActive : ""}`
                        }
                    >
                        <span className={layoutStyles.navItemIcon}>
                            <Package size={20} weight="bold" />
                        </span>
                        <span>Catálogo</span>
                    </NavLink>

                    <NavLink
                        to="/pos"
                        className={({ isActive }) =>
                            `${layoutStyles.navItem} ${isActive ? layoutStyles.navItemActive : ""}`
                        }
                    >
                        <span className={layoutStyles.navItemIcon}>🛒</span>
                        <span>Punto de venta</span>
                    </NavLink>

                    <button
                        type="button"
                        className={layoutStyles.navItem}
                        style={{ border: "none", background: "transparent" }}
                    >
                        <span className={layoutStyles.navItemIcon}>
                            <ChartLine size={20} weight="bold" />
                        </span>
                        <span>Reportes</span>
                    </button>

                    <button
                        type="button"
                        className={layoutStyles.navItem}
                        style={{ border: "none", background: "transparent" }}
                    >
                        <span className={layoutStyles.navItemIcon}>
                            <GearSix size={20} weight="bold" />
                        </span>
                        <span>Configuración</span>
                    </button>
                </nav>

                <div className={layoutStyles.navFooter}>
                    <div>Appy Studios</div>
                </div>
            </aside>

            <div className={layoutStyles.main}>
                <header className={layoutStyles.topbar}>
                    <div className={layoutStyles.topbarRow}>
                        <div className={layoutStyles.topbarTitle}>
                            <h1>Catálogo de productos</h1>
                            <p>Gestioná los productos y su matriz de variantes (talle/color).</p>
                        </div>
                        <div className={layoutStyles.topbarControls}>
                            <button
                                type="button"
                                className={layoutStyles.segmentButton}
                                style={{ cursor: "default" }}
                            >
                                <UserPlus size={14} weight="bold" style={{ marginRight: 4 }} />
                                Próximamente: colaboradores
                            </button>
                        </div>
                    </div>
                </header>

                <div className={catalogStyles.page}>
                    <div className={catalogStyles.container}>

                        {/* ── Header ─────────────────────────────────────────────────────── */}
                        <div className={catalogStyles.header}>
                            <div className={catalogStyles.headerText}>
                                <h1>Catálogo de Productos</h1>
                                <p>Gestioná los productos y su matriz de variantes (talle/color).</p>
                            </div>
                            <Link to="/catalogo/nuevo" className={catalogStyles.btnNuevo}>
                                <PlusCircle size={20} weight="bold" />
                                Nuevo producto
                            </Link>
                        </div>

                        {/* ── Loading ─────────────────────────────────────────────────────── */}
                        {loading && (
                            <div className={catalogStyles.loadingWrap}>
                                <div className={catalogStyles.spinner} />
                                <span>Cargando catálogo…</span>
                            </div>
                        )}

                        {/* ── Error ───────────────────────────────────────────────────────── */}
                        {!loading && error && (
                            <div className={catalogStyles.errorAlert} role="alert">
                                <WarningCircle size={18} style={{ verticalAlign: "middle", marginRight: 8 }} />
                                {error}
                            </div>
                        )}

                        {/* ── Contenido ───────────────────────────────────────────────────── */}
                        {!loading && !error && (
                            <>
                                {/* Estadísticas */}
                                {productos.length > 0 && (
                                    <div className={catalogStyles.statsBar}>
                                        <div className={catalogStyles.statChip}>
                                            <Package size={16} />
                                            <strong>{productos.length}</strong> producto{productos.length !== 1 ? "s" : ""}
                                        </div>
                                        <div className={catalogStyles.statChip}>
                                            <Palette size={16} />
                                            <strong>{totalVariantes}</strong> variante{totalVariantes !== 1 ? "s" : ""} en total
                                        </div>
                                    </div>
                                )}

                                {/* Empty state */}
                                {productos.length === 0 && (
                                    <div className={catalogStyles.empty}>
                                        <Package size={64} weight="thin" className={catalogStyles.emptyIcon} />
                                        <h2 className={catalogStyles.emptyTitle}>Tu catálogo está vacío</h2>
                                        <p className={catalogStyles.emptyText}>
                                            Empezá cargando tu primer producto con su matriz de talles y colores.
                                            El sistema crea automáticamente todas las variantes.
                                        </p>
                                        <Link to="/catalogo/nuevo" className={catalogStyles.btnNuevo}>
                                            <PlusCircle size={18} weight="bold" />
                                            Cargar primer producto
                                        </Link>
                                    </div>
                                )}

                                {/* Grilla de cards */}
                                {productos.length > 0 && (
                                    <div className={catalogStyles.grid}>
                                        {productos.map(producto => (
                                            <ProductoCard key={producto.id} producto={producto} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// Sub-componente: Card de producto
// ──────────────────────────────────────────────────────────────────────────────

const MAX_CHIPS = 6; // Cuántos chips de variantes mostrar antes de "+N más"

function ProductoCard({ producto }: { producto: ProductoConVariantes }) {
    const precio = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    }).format(producto.precioBase);

    const chipsVisibles = producto.variantes.slice(0, MAX_CHIPS);
    const restantes = producto.variantes.length - MAX_CHIPS;

    return (
        <article className={catalogStyles.card}>
            <div className={catalogStyles.cardAccent} />
            <div className={catalogStyles.cardBody}>
                <div className={catalogStyles.cardHeader}>
                    <h2 className={catalogStyles.cardName}>{producto.nombre}</h2>
                    <span className={catalogStyles.cardPrice}>{precio}</span>
                </div>

                {producto.descripcion && (
                    <p className={catalogStyles.cardDesc}>{producto.descripcion}</p>
                )}

                <div className={catalogStyles.cardMeta}>
                    <span className={catalogStyles.metaChip}>
                        <Tag size={12} />
                        {producto.temporada}
                    </span>
                    <span className={catalogStyles.metaChip}>
                        <Palette size={12} />
                        {producto.variantes.length} variante{producto.variantes.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Chips de variantes */}
                {producto.variantes.length > 0 && (
                    <div className={catalogStyles.variantesSection}>
                        <p className={catalogStyles.variantesLabel}>Variantes disponibles</p>
                        <div className={catalogStyles.variantesList}>
                            {chipsVisibles.map(v => (
                                <span key={v.id} className={catalogStyles.varianteChip}>
                                    {v.talle} / {v.color}
                                </span>
                            ))}
                            {restantes > 0 && (
                                <span className={catalogStyles.variantesMore}>+{restantes} más</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}
