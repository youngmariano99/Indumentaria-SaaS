import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, PlusCircle, Tag, Palette, WarningCircle } from "@phosphor-icons/react";
import { catalogApi } from "./api/catalogApi";
import type { ProductoConVariantes } from "./types";
import styles from "./CatalogoPage.module.css";

/**
 * Página principal del catálogo de productos.
 * Obtiene los productos del backend (GET /api/productos) y los muestra en una grilla de cards.
 * Cada card muestra el nombre, precio, temporada y los chips de variantes (talle/color).
 */
export function CatalogoPage() {
    const [productos, setProductos] = useState<ProductoConVariantes[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        <div className={styles.page}>
            <div className={styles.container}>

                {/* ── Header ─────────────────────────────────────────────────────── */}
                <div className={styles.header}>
                    <div className={styles.headerText}>
                        <h1>Catálogo de Productos</h1>
                        <p>Gestioná los productos y su matriz de variantes (talle/color).</p>
                    </div>
                    <Link to="/catalogo/nuevo" className={styles.btnNuevo}>
                        <PlusCircle size={20} weight="bold" />
                        Nuevo producto
                    </Link>
                </div>

                {/* ── Loading ─────────────────────────────────────────────────────── */}
                {loading && (
                    <div className={styles.loadingWrap}>
                        <div className={styles.spinner} />
                        <span>Cargando catálogo…</span>
                    </div>
                )}

                {/* ── Error ───────────────────────────────────────────────────────── */}
                {!loading && error && (
                    <div className={styles.errorAlert} role="alert">
                        <WarningCircle size={18} style={{ verticalAlign: "middle", marginRight: 8 }} />
                        {error}
                    </div>
                )}

                {/* ── Contenido ───────────────────────────────────────────────────── */}
                {!loading && !error && (
                    <>
                        {/* Estadísticas */}
                        {productos.length > 0 && (
                            <div className={styles.statsBar}>
                                <div className={styles.statChip}>
                                    <Package size={16} />
                                    <strong>{productos.length}</strong> producto{productos.length !== 1 ? "s" : ""}
                                </div>
                                <div className={styles.statChip}>
                                    <Palette size={16} />
                                    <strong>{totalVariantes}</strong> variante{totalVariantes !== 1 ? "s" : ""} en total
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {productos.length === 0 && (
                            <div className={styles.empty}>
                                <Package size={64} weight="thin" className={styles.emptyIcon} />
                                <h2 className={styles.emptyTitle}>Tu catálogo está vacío</h2>
                                <p className={styles.emptyText}>
                                    Empezá cargando tu primer producto con su matriz de talles y colores.
                                    El sistema crea automáticamente todas las variantes.
                                </p>
                                <Link to="/catalogo/nuevo" className={styles.btnNuevo}>
                                    <PlusCircle size={18} weight="bold" />
                                    Cargar primer producto
                                </Link>
                            </div>
                        )}

                        {/* Grilla de cards */}
                        {productos.length > 0 && (
                            <div className={styles.grid}>
                                {productos.map(producto => (
                                    <ProductoCard key={producto.id} producto={producto} />
                                ))}
                            </div>
                        )}
                    </>
                )}

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
        <article className={styles.card}>
            <div className={styles.cardAccent} />
            <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardName}>{producto.nombre}</h2>
                    <span className={styles.cardPrice}>{precio}</span>
                </div>

                {producto.descripcion && (
                    <p className={styles.cardDesc}>{producto.descripcion}</p>
                )}

                <div className={styles.cardMeta}>
                    <span className={styles.metaChip}>
                        <Tag size={12} />
                        {producto.temporada}
                    </span>
                    <span className={styles.metaChip}>
                        <Palette size={12} />
                        {producto.variantes.length} variante{producto.variantes.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Chips de variantes */}
                {producto.variantes.length > 0 && (
                    <div className={styles.variantesSection}>
                        <p className={styles.variantesLabel}>Variantes disponibles</p>
                        <div className={styles.variantesList}>
                            {chipsVisibles.map(v => (
                                <span key={v.id} className={styles.varianteChip}>
                                    {v.talle} / {v.color}
                                </span>
                            ))}
                            {restantes > 0 && (
                                <span className={styles.variantesMore}>+{restantes} más</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}
