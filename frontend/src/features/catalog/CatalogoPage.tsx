import { Link } from "react-router-dom";
import { Package, PlusCircle } from "@phosphor-icons/react";
import styles from "./CatalogoPage.module.css";

/**
 * Página principal del catálogo de productos.
 * Por ahora muestra un empty state con acceso al formulario de nuevo producto.
 * En el futuro aquí se listarán los productos obtenidos del backend.
 */
export function CatalogoPage() {
    return (
        <div className={styles.page}>
            <div className={styles.container}>

                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Catálogo de Productos</h1>
                        <p className={styles.subtitle}>
                            Gestioná los productos y su matriz de variantes (talle/color).
                        </p>
                    </div>
                    <Link to="/catalogo/nuevo" className={styles.btnNuevo}>
                        <PlusCircle size={20} weight="bold" />
                        Nuevo producto
                    </Link>
                </div>

                {/* Empty state — se reemplazará por la grilla de productos cuando exista el endpoint GET */}
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

            </div>
        </div>
    );
}
