import { useState, useEffect } from "react";
import { GearSix, Check, WarningCircle, Spinner, X } from "@phosphor-icons/react";
import { ajustesApi } from "./api/ajustesApi";
import { TALLES_POR_TIPO, NOMBRE_TIPO, TIPOS_PRODUCTO } from "../catalog/data/tallesPorTipo";
import styles from "./AjustesPage.module.css";

/**
 * Página de Configuración.
 * Tab "Talles por tipo": el tenant personaliza qué talles se pre-cargan
 * en el formulario de carga de productos según el tipo de categoría.
 */
export function AjustesPage() {
    const [tallesPorTipo, setTallesPorTipo] = useState<Record<string, string[]>>(() => {
        // Inicializar con los defaults del sistema
        const defaults: Record<string, string[]> = {};
        TIPOS_PRODUCTO.forEach(tipo => { defaults[tipo] = [...TALLES_POR_TIPO[tipo]]; });
        return defaults;
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>(TIPOS_PRODUCTO[0]);
    const [inputTalle, setInputTalle] = useState("");

    // Cargar configuración del backend al montar
    useEffect(() => {
        const cargar = async () => {
            try {
                const data = await ajustesApi.obtenerTalles();
                if (data.tallesPorTipo && Object.keys(data.tallesPorTipo).length > 0) {
                    // Merge: usar configuración del backend, defaults para los tipos no configurados
                    setTallesPorTipo(prev => ({ ...prev, ...data.tallesPorTipo }));
                }
            } catch {
                // Si falla, usa los defaults locales sin bloquear al usuario
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    const agregarTalle = () => {
        const v = inputTalle.trim().toUpperCase();
        if (!v || tallesPorTipo[activeTab]?.includes(v)) { setInputTalle(""); return; }
        setTallesPorTipo(prev => ({
            ...prev,
            [activeTab]: [...(prev[activeTab] ?? []), v],
        }));
        setInputTalle("");
    };

    const quitarTalle = (tipo: string, talle: string) => {
        setTallesPorTipo(prev => ({
            ...prev,
            [tipo]: prev[tipo].filter(t => t !== talle),
        }));
    };

    const restaurarDefaults = () => {
        setTallesPorTipo(prev => ({
            ...prev,
            [activeTab]: [...TALLES_POR_TIPO[activeTab]],
        }));
    };

    const handleGuardar = async () => {
        setSaving(true);
        setError(null);
        setSaved(false);
        try {
            await ajustesApi.guardarTalles({ tallesPorTipo });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch {
            setError("No se pudo guardar la configuración. Intentá de nuevo.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>
                            <GearSix size={24} weight="bold" className={styles.pageTitleIcon} />
                            Configuración
                        </h1>
                        <p className={styles.pageSubtitle}>
                            Personalizá las opciones del sistema para tu negocio.
                        </p>
                    </div>
                </div>

                {/* Tabs de secciones futuras */}
                <div className={styles.tabsBar}>
                    <button type="button" className={`${styles.tab} ${styles.tabActive}`}>
                        Talles por tipo
                    </button>
                    <button type="button" className={styles.tab} disabled>
                        Mi cuenta <span className={styles.tabBadge}>Próximamente</span>
                    </button>
                    <button type="button" className={styles.tab} disabled>
                        Notificaciones <span className={styles.tabBadge}>Próximamente</span>
                    </button>
                </div>

                {/* Panel principal */}
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h2 className={styles.panelTitle}>Talles predefinidos por tipo de producto</h2>
                            <p className={styles.panelDesc}>
                                Estos talles se pre-cargan automáticamente en el formulario de carga de productos
                                al seleccionar el tipo. Podés agregar o quitar talles según los productos que vendés.
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className={styles.loadingRow}>
                            <Spinner size={20} className={styles.spinIcon} />
                            <span>Cargando configuración…</span>
                        </div>
                    ) : (
                        <div className={styles.editor}>
                            {/* Selector de tipo (tabs verticales) */}
                            <div className={styles.tiposList}>
                                {TIPOS_PRODUCTO.map(tipo => (
                                    <button
                                        key={tipo}
                                        type="button"
                                        className={`${styles.tipoBtn} ${activeTab === tipo ? styles.tipoBtnActive : ""}`}
                                        onClick={() => { setActiveTab(tipo); setInputTalle(""); }}
                                    >
                                        <span>{NOMBRE_TIPO[tipo]}</span>
                                        <span className={styles.tipoBadge}>{tallesPorTipo[tipo]?.length ?? 0}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Editor de chips para el tipo activo */}
                            <div className={styles.chipsEditor}>
                                <div className={styles.chipsEditorHeader}>
                                    <span className={styles.chipsEditorTitle}>
                                        Talles de&nbsp;<strong>{NOMBRE_TIPO[activeTab]}</strong>
                                    </span>
                                    <button
                                        type="button"
                                        className={styles.restoreBtn}
                                        onClick={restaurarDefaults}
                                    >
                                        Restaurar defaults
                                    </button>
                                </div>

                                {/* Chips actuales */}
                                <div className={styles.chipsGrid}>
                                    {(tallesPorTipo[activeTab] ?? []).map(talle => (
                                        <span key={talle} className={styles.chip}>
                                            {talle}
                                            <button
                                                type="button"
                                                className={styles.chipRemove}
                                                onClick={() => quitarTalle(activeTab, talle)}
                                                aria-label={`Quitar talle ${talle}`}
                                            >
                                                <X size={11} weight="bold" />
                                            </button>
                                        </span>
                                    ))}
                                </div>

                                {/* Agregar nuevo talle */}
                                <div className={styles.addRow}>
                                    <input
                                        className={styles.addInput}
                                        type="text"
                                        placeholder="Nuevo talle (Enter para agregar)"
                                        value={inputTalle}
                                        onChange={e => setInputTalle(e.target.value.toUpperCase())}
                                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); agregarTalle(); } }}
                                    />
                                    <button type="button" className={styles.addBtn} onClick={agregarTalle}>
                                        Agregar
                                    </button>
                                </div>

                                <p className={styles.chipsHint}>
                                    Estos talles se muestran como sugerencia en el formulario — el usuario siempre puede escribir talles personalizados adicionales.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Feedback + Guardar */}
                    {error && (
                        <div className={styles.errorAlert} role="alert">
                            <WarningCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.saveBtn}
                            onClick={handleGuardar}
                            disabled={saving || loading}
                        >
                            {saving ? (
                                <><Spinner size={16} className={styles.spinIcon} /> Guardando…</>
                            ) : saved ? (
                                <><Check size={16} weight="bold" /> Guardado</>
                            ) : (
                                "Guardar cambios"
                            )}
                        </button>
                        {saved && (
                            <span className={styles.savedConfirm}>
                                <Check size={14} weight="bold" />
                                Configuración guardada correctamente
                            </span>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
