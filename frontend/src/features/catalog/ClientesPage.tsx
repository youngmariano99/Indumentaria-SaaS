import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash, MagnifyingGlass, Funnel, X, CaretDown, CaretUp, ArrowSquareOut, ChartLineUp } from '@phosphor-icons/react';
import { clientesApi } from './api/clientesApi';
import type { ClienteDto, CrearClienteDto } from './api/clientesApi';
import { CondicionIva } from './types';
import { PerfilClientePage } from './PerfilClientePage';
import styles from './CatalogoPage.module.css'; // Reutilizamos estilos de catálogo
import layoutStyles from '../dashboard/DashboardPage.module.css';

const fmt = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

interface FiltrosMarketing {
    texto: string;
    totalGastadoMin: string;
    totalComprasMin: string;
    categoria: string;
}

const FILTROS_VACIOS: FiltrosMarketing = {
    texto: '',
    totalGastadoMin: '',
    totalComprasMin: '',
    categoria: ''
};

export function ClientesPage() {
    const [clientes, setClientes] = useState<ClienteDto[]>([]);
    const [loading, setLoading] = useState(true);

    // Marketing Filters
    const [filtros, setFiltros] = useState<FiltrosMarketing>(FILTROS_VACIOS);
    const [panelFiltros, setPanelFiltros] = useState(false);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clienteModalId, setClienteModalId] = useState<string | null>(null);

    const [formData, setFormData] = useState<CrearClienteDto>({
        documento: '',
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        condicionIva: CondicionIva.ConsumidorFinal,
        preferenciasJson: '{}'
    });

    useEffect(() => {
        loadClientes();
    }, []);

    const loadClientes = async () => {
        setLoading(true);
        try {
            const data = await clientesApi.getAll();
            setClientes(data);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await clientesApi.create(formData);
            closeModal();
            loadClientes();
        } catch (error) {
            console.error('Error al crear cliente:', error);
            alert("Error al crear cliente. Posible documento duplicado.");
        }
    };

    const handleDelete = async (id: string, nombre: string) => {
        if (!confirm(`¿Seguro que deseas eliminar el cliente ${nombre}?`)) return;
        try {
            await clientesApi.delete(id);
            loadClientes();
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            alert("Ocurrió un error al eliminar.");
        }
    };

    const resetForm = () => {
        setFormData({
            documento: '',
            nombre: '',
            email: '',
            telefono: '',
            direccion: '',
            condicionIva: CondicionIva.ConsumidorFinal,
            preferenciasJson: '{}'
        });
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    // Filter Logic
    const clientesFiltrados = useMemo(() => {
        return clientes.filter(c => {
            const textoLower = filtros.texto.toLowerCase();
            if (textoLower) {
                const enNombre = c.nombre.toLowerCase().includes(textoLower);
                const enDoc = c.documento?.includes(textoLower);
                const enEmail = c.email?.toLowerCase().includes(textoLower);
                if (!enNombre && !enDoc && !enEmail) return false;
            }
            if (filtros.totalGastadoMin && c.totalGastado < Number(filtros.totalGastadoMin)) return false;
            if (filtros.totalComprasMin && c.totalCompras < Number(filtros.totalComprasMin)) return false;
            if (filtros.categoria && c.categoriaPreferida !== filtros.categoria) return false;
            return true;
        });
    }, [clientes, filtros]);

    const opcionesCategorias = useMemo(() => {
        const cats = clientes.map(c => c.categoriaPreferida).filter(c => c && c !== 'Sin compras');
        return [...new Set(cats)];
    }, [clientes]);

    const filtrosActivos = useMemo(() =>
        filtros.texto || filtros.totalGastadoMin || filtros.totalComprasMin || filtros.categoria,
        [filtros]);

    const setFiltro = <K extends keyof FiltrosMarketing>(key: K, value: FiltrosMarketing[K]) =>
        setFiltros(prev => ({ ...prev, [key]: value }));

    return (
        <>
            <header className={layoutStyles.topbar}>
                <div className={layoutStyles.topbarRow}>
                    <div className={layoutStyles.topbarTitle}>
                        <h1>CRM Analítico & Marketing</h1>
                        <p>Analizá el historial de los clientes para segmentar tu público.</p>
                    </div>
                    <div className={layoutStyles.topbarControls}>
                        <button onClick={openModal} className={layoutStyles.btnPrimarySmall ?? layoutStyles.segmentButton}>
                            <Plus size={14} weight="bold" style={{ marginRight: 4 }} />
                            Nuevo cliente
                        </button>
                    </div>
                </div>
            </header>

            <div className={styles.page}>
                <div className={styles.container}>

                    {/* Buscador & Filtros Marketing */}
                    <div className={styles.searchBar}>
                        <div className={styles.searchInputWrap}>
                            <MagnifyingGlass size={16} className={styles.searchIcon} />
                            <input
                                className={styles.searchInput}
                                type="text"
                                placeholder="Buscar por nombre, documento o email..."
                                value={filtros.texto}
                                onChange={e => setFiltro("texto", e.target.value)}
                            />
                            {filtros.texto && (
                                <button type="button" className={styles.clearBtn} onClick={() => setFiltro("texto", "")}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            className={`${styles.filtrosToggle} ${panelFiltros ? styles.filtrosToggleActive : ""}`}
                            onClick={() => setPanelFiltros(p => !p)}
                        >
                            <Funnel size={15} weight={filtrosActivos ? "fill" : "regular"} />
                            Filtros Marketing
                            {filtrosActivos && <span className={styles.filtrosBadge} />}
                            {panelFiltros ? <CaretUp size={12} /> : <CaretDown size={12} />}
                        </button>

                        {filtrosActivos && (
                            <button type="button" className={styles.clearAllBtn} onClick={() => setFiltros(FILTROS_VACIOS)}>
                                <X size={12} /> Limpiar filtros
                            </button>
                        )}
                    </div>

                    {/* Panel de filtros Marketing */}
                    {panelFiltros && (
                        <div className={styles.filtrosPanel}>
                            <div className={styles.filtroGrid}>
                                <div className={styles.filtroField}>
                                    <label className={styles.filtroLabel}>Min. Total Gastado $</label>
                                    <input
                                        className={styles.filtroInput}
                                        type="number"
                                        min="0"
                                        placeholder="ej: 100000"
                                        value={filtros.totalGastadoMin}
                                        onChange={e => setFiltro("totalGastadoMin", e.target.value)}
                                    />
                                </div>
                                <div className={styles.filtroField}>
                                    <label className={styles.filtroLabel}>Min. Cantidad Compras</label>
                                    <input
                                        className={styles.filtroInput}
                                        type="number"
                                        min="0"
                                        placeholder="ej: 3"
                                        value={filtros.totalComprasMin}
                                        onChange={e => setFiltro("totalComprasMin", e.target.value)}
                                    />
                                </div>
                                <div className={styles.filtroField}>
                                    <label className={styles.filtroLabel}>Categoría Preferida</label>
                                    <select className={styles.filtroSelect} value={filtros.categoria} onChange={e => setFiltro("categoria", e.target.value)}>
                                        <option value="">Todas</option>
                                        {opcionesCategorias.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Grid de clientes */}
                    {loading ? (
                        <div className={styles.loadingWrap}>
                            <div className={styles.spinner} />
                            <span>Cargando cartera analítica...</span>
                        </div>
                    ) : clientesFiltrados.length === 0 ? (
                        <div className={styles.empty}>
                            <Funnel size={48} weight="thin" className={styles.emptyIcon} />
                            <h2 className={styles.emptyTitle}>Sin resultados</h2>
                            <p className={styles.emptyText}>Ningún cliente coincide con los perfiles buscados.</p>
                            <button type="button" className={styles.btnNuevo} onClick={() => setFiltros(FILTROS_VACIOS)}>
                                <X size={16} /> Limpiar filtros
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className={styles.statsBar}>
                                <span className={styles.statChip}>
                                    <ChartLineUp size={14} />
                                    <strong>{clientesFiltrados.length}</strong> clientes en este segmento
                                </span>
                            </div>

                            <div className={styles.tableWrap}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Cliente</th>
                                            <th>Contacto</th>
                                            <th style={{ textAlign: "center" }}>Total Compras</th>
                                            <th style={{ textAlign: "right" }}>Total Gastado</th>
                                            <th>Preferencia</th>
                                            <th style={{ textAlign: "right" }}>Saldo Billetera</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientesFiltrados.map(c => (
                                            <tr key={c.id} className={styles.tableRow} onClick={() => setClienteModalId(c.id)} title="Asomarse al Perfil 360" style={{ cursor: "pointer" }}>
                                                <td>
                                                    <div className={styles.cellNombre}>{c.nombre}</div>
                                                    <div className={styles.cellDesc}>{c.documento || 'S/D'}</div>
                                                </td>
                                                <td>
                                                    <div className={styles.cellMuted}>{c.telefono || '-'}</div>
                                                    <div className={styles.cellMuted} style={{ fontSize: '0.75rem' }}>{c.email || '-'}</div>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <span className={styles.countBadge}>{c.totalCompras}</span>
                                                </td>
                                                <td style={{ textAlign: "right", color: '#059669', fontWeight: 'bold' }}>
                                                    {fmt(c.totalGastado)}
                                                </td>
                                                <td>
                                                    <span className={styles.tipoBadge}>{c.categoriaPreferida}</span>
                                                </td>
                                                <td style={{ textAlign: "right" }}>
                                                    <span style={{
                                                        color: c.saldoAFavor > 0 ? '#059669' : c.saldoAFavor < 0 ? '#dc2626' : '#6b7280',
                                                        fontWeight: c.saldoAFavor !== 0 ? 'bold' : 'normal'
                                                    }}>
                                                        {fmt(c.saldoAFavor)}
                                                    </span>
                                                </td>
                                                <td onClick={e => e.stopPropagation()}>
                                                    <div className={styles.rowActions}>
                                                        <button type="button" className={styles.rowActionBtn} title="Ver completo" onClick={() => setClienteModalId(c.id)}>
                                                            <ArrowSquareOut size={14} />
                                                        </button>
                                                        <button type="button" className={`${styles.rowActionBtn} ${styles.rowActionDangerBtn || ""}`} style={{ color: "var(--color-danger)" }} title="Eliminar" onClick={() => handleDelete(c.id, c.nombre)}>
                                                            <Trash size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal Perfil 360 */}
            {clienteModalId && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", zIndex: 100 }}>
                    <div style={{ backgroundColor: "#f9fafb", width: "100%", maxWidth: "800px", height: "100%", overflowY: "auto", boxShadow: "-4px 0 15px rgba(0,0,0,0.1)", animation: "slideInRight 0.3s ease-out" }}>
                        <div style={{ position: "sticky", top: 0, padding: "1rem", backgroundColor: "white", borderBottom: "1px solid #e5e7eb", zIndex: 10 }}>
                            <h2 style={{ margin: 0, fontSize: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                Vista Rápida del Cliente
                                <button type="button" onClick={() => { setClienteModalId(null); loadClientes(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
                                    <X size={24} />
                                </button>
                            </h2>
                        </div>
                        <div style={{ padding: "1rem" }}>
                            <PerfilClientePage clientIdProp={clienteModalId} onCloseModal={() => { setClienteModalId(null); loadClientes(); }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Crear */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={closeModal} style={{ zIndex: 105, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0 }}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', width: '100%', maxWidth: '500px' }}>
                        <div className={styles.modalHeader} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h2 style={{ margin: 0 }}>Nuevo Cliente</h2>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Nombre Completo / Razón Social <span style={{ color: 'red' }}>*</span></label>
                                    <input type="text" required value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>Documento (DNI/CUIT)</label>
                                        <input type="text" value={formData.documento} onChange={e => setFormData({ ...formData, documento: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>Teléfono</label>
                                        <input type="text" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Email</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Dirección</label>
                                    <input type="text" value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Condición frente al IVA</label>
                                    <select value={formData.condicionIva} onChange={e => setFormData({ ...formData, condicionIva: Number(e.target.value) as CondicionIva })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}>
                                        <option value={CondicionIva.ConsumidorFinal}>Consumidor Final</option>
                                        <option value={CondicionIva.ResponsableInscripto}>Responsable Inscripto</option>
                                        <option value={CondicionIva.Monotributista}>Monotributista</option>
                                        <option value={CondicionIva.Exento}>Exento</option>
                                        <option value={CondicionIva.NoCategorizado}>No Categorizado</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button type="button" onClick={closeModal} style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #d1d5db', borderRadius: '0.25rem', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Crear Cliente</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
