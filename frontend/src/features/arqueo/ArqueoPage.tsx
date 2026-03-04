import { useEffect, useState } from "react";
import { CashRegister, CheckCircle, Warning, Lock, Wallet, ArrowCircleRight, ListMagnifyingGlass, X, Money } from "@phosphor-icons/react";
import { arqueoApi, type ArqueoDto, type CerrarCajaDto } from "./api/arqueoApi";
import { posApi, type MetodoPagoDto } from "../pos/api/posApi";
import styles from "./ArqueoPage.module.css";

export function ArqueoPage() {
    const [arqueo, setArqueo] = useState<ArqueoDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [saldoInicial, setSaldoInicial] = useState<number>(0);
    const [closingData, setClosingData] = useState<CerrarCajaDto>({
        observaciones: "",
        detallesReales: []
    });

    const [activeTab, setActiveTab] = useState<"actual" | "historial">("actual");
    const [historial, setHistorial] = useState<ArqueoDto[]>([]);
    const [loadingHistorial, setLoadingHistorial] = useState(false);
    const [selectedArqueo, setSelectedArqueo] = useState<ArqueoDto | null>(null);
    const [metodosPago, setMetodosPago] = useState<MetodoPagoDto[]>([]);


    // Simulamos la sucursal activa (esto debería venir de un contexto de sucursal/usuario)
    const STORE_ID = "00000000-0000-0000-0000-000000000000";

    useEffect(() => {
        loadSession();
        loadHistorial();
    }, []);
    const loadHistorial = async () => {
        setLoadingHistorial(true);
        try {
            const data = await arqueoApi.getHistorial(STORE_ID);
            setHistorial(data);
        } catch (error) {
            console.error("Error al cargar historial", error);
        } finally {
            setLoadingHistorial(false);
        }
    };

    const handleCerrar = async () => {
        if (!arqueo) return;
        try {
            await arqueoApi.cerrar(arqueo.id, closingData);
            alert("Caja cerrada exitosamente.");
            loadSession();
            loadHistorial();
            setActiveTab("historial");
        } catch (error) {
            alert("Error al cerrar la caja.");
        }
    };

    // (El resto de las funciones se mantienen...)
    const loadSession = async () => {
        setLoading(true);
        try {
            const [data, mh] = await Promise.all([
                arqueoApi.getActual(STORE_ID),
                posApi.obtenerMetodosPago()
            ]);
            setArqueo(data);
            setMetodosPago(mh);
            if (mh) {
                setClosingData({
                    observaciones: "",
                    detallesReales: mh.map(m => ({
                        metodoPagoId: m.id,
                        montoReal: 0
                    }))
                });
            }
        } catch (error) {
            console.error("Error al cargar la sesion:", error);
            setArqueo(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAbrir = async () => {
        try {
            await arqueoApi.abrir({ storeId: STORE_ID, saldoInicial });
            loadSession();
        } catch (error) {
            alert("No se pudo abrir la caja.");
        }
    };

    const handleMontoRealChange = (metodoPagoId: string, value: string) => {
        const val = parseFloat(value) || 0;
        setClosingData(prev => ({
            ...prev,
            detallesReales: prev.detallesReales.map(d =>
                d.metodoPagoId === metodoPagoId ? { ...d, montoReal: val } : d
            )
        }));
    };

    if (loading) return <div className={styles.loading}>Sincronizando caja...</div>;

    const renderActual = () => {
        if (!arqueo) {
            return (
                <div className={styles.setupCard}>
                    <div className={styles.setupIcon}>
                        <CashRegister size={32} weight="duotone" />
                    </div>
                    <h1 className={styles.title}>Apertura de Jornada</h1>
                    <p className={styles.subtitle}>Ingresá el saldo inicial para comenzar a operar.</p>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Efectivo en Caja Inicial</label>
                        <input
                            type="number"
                            className={styles.inputLarge}
                            value={saldoInicial}
                            onChange={(e) => setSaldoInicial(parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                        />
                    </div>
                    <div className={styles.actionArea}>
                        <button className={styles.btnPrimaryLarge} onClick={handleAbrir}>
                            Comenzar Turno <ArrowCircleRight size={20} weight="bold" />
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <>
                <header style={{ marginBottom: '2rem' }}>
                    <h1 className={styles.title}>Caja en Curso</h1>
                    <p className={styles.subtitle}>
                        Responsable: <strong>{arqueo.usuarioNombre}</strong> | Sucursal: <strong>{arqueo.storeNombre}</strong>
                    </p>
                </header>
                <div className={styles.sessionGrid}>
                    <div className={styles.infoCard}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Inicio</span>
                            <span className={styles.infoValue}>{new Date(arqueo.fechaApertura).toLocaleTimeString()}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Saldo Inicial</span>
                            <span className={styles.infoValue}>${arqueo.saldoInicial.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className={styles.reconcileCard}>
                        <div className={styles.reconcileHeader}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                <Lock size={20} weight="fill" color="#6366f1" />
                                Conteo de Cierre (Ciego)
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                                Ingresá el total de dinero físico por cada método.
                            </p>
                        </div>
                        <div className={styles.reconcileBody}>
                            <div className={styles.paymentList}>
                                {metodosPago.map(m => (
                                    <div key={m.id} className={styles.paymentItem}>
                                        <div className={styles.paymentName}>
                                            {m.nombre.toLowerCase().includes("efectivo") ? <Wallet size={16} /> : <CheckCircle size={16} />}
                                            <span style={{ marginLeft: '8px' }}>{m.nombre}</span>
                                        </div>
                                        <input
                                            type="number"
                                            className={styles.inputSmall}
                                            placeholder="0.00"
                                            value={closingData.detallesReales.find(d => d.metodoPagoId === m.id)?.montoReal || ""}
                                            onChange={(e) => handleMontoRealChange(m.id, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '1.5rem' }}>
                                <label className={styles.label}>Observaciones / Notas</label>
                                <textarea
                                    className={styles.inputSmall}
                                    style={{ width: '100%', minHeight: '80px', textAlign: 'left' }}
                                    placeholder="Ej: Se retiraron $200 para limpieza..."
                                    value={closingData.observaciones || ""}
                                    onChange={(e) => setClosingData({ ...closingData, observaciones: e.target.value })}
                                />

                            </div>
                        </div>
                    </div>

                    <div className={styles.actionArea}>
                        <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '12px', border: '1px solid #fde68a', marginBottom: '1rem', display: 'flex', gap: '12px' }}>
                            <Warning size={20} color="#d97706" weight="fill" />
                            <span style={{ fontSize: '0.85rem', color: '#92400e' }}>
                                Asegúrate de haber guardado todas las ventas locales antes de cerrar para evitar diferencias.
                            </span>
                        </div>
                        <button className={styles.btnPrimaryLarge} onClick={handleCerrar} style={{ background: '#111827' }}>
                            Finalizar Jornada <Lock size={20} weight="bold" />
                        </button>
                    </div>
                </div>
            </>
        );
    };

    const renderHistorial = () => {
        if (loadingHistorial) return <div className={styles.loading}>Cargando historial...</div>;
        if (historial.length === 0) return (
            <div className={styles.historialContainer} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <ListMagnifyingGlass size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>No hay arqueos anteriores</h3>
                <p style={{ color: '#64748b' }}>Las jornadas cerradas aparecerán aquí.</p>
            </div>
        );

        return (
            <div className={styles.historialContainer}>
                <h2>Historial de Cajas Cerradas</h2>
                <table className={styles.historyTable}>
                    <thead>
                        <tr>
                            <th>Apertura</th>
                            <th>Cierre</th>
                            <th>Responsable</th>
                            <th>Esperado</th>
                            <th>Real (Contado)</th>
                            <th>Diferencia</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historial.map(h => (
                            <tr key={h.id}>
                                <td>{new Date(h.fechaApertura).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                                <td>{h.fechaCierre ? new Date(h.fechaCierre).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}</td>
                                <td>{h.usuarioNombre}</td>
                                <td>${(h.totalVentasEsperado + h.totalManualEsperado + h.saldoInicial).toLocaleString()}</td>
                                <td>${h.totalRealContado.toLocaleString()}</td>
                                <td>
                                    <span style={{ color: h.diferencia < 0 ? '#dc2626' : (h.diferencia > 0 ? '#16a34a' : '#4b5563'), fontWeight: 'bold' }}>
                                        {h.diferencia === 0 ? '-' : (h.diferencia < 0 ? `-$${Math.abs(h.diferencia).toLocaleString()}` : `+$${h.diferencia.toLocaleString()}`)}
                                    </span>
                                </td>
                                <td>
                                    <span className={`${styles.badge} ${h.diferencia === 0 ? styles.badgeSuccess : styles.badgeWarning}`}>
                                        {h.estado}
                                    </span>
                                </td>
                                <td>
                                    <button className={styles.btnAction} onClick={() => setSelectedArqueo(h)}>
                                        <ListMagnifyingGlass size={16} /> Detalles
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.tabsHeader}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'actual' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab("actual")}
                >
                    Sesión Actual
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'historial' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab("historial")}
                >
                    Historial de Cierres
                </button>
            </div>

            <div className={styles.tabContent}>
                {activeTab === "actual" ? renderActual() : renderHistorial()}
            </div>

            {selectedArqueo && (
                <div className={styles.modalOverlay} onClick={() => setSelectedArqueo(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={() => setSelectedArqueo(null)}>
                            <X size={24} weight="bold" />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ display: 'inline-flex', padding: '12px', background: '#f1f5f9', borderRadius: '50%', marginBottom: '1rem' }}>
                                <Money size={32} color="#475569" weight="duotone" />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Arqueo de Caja</h2>
                            <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
                                Cerrado el {new Date(selectedArqueo.fechaCierre!).toLocaleString()} por {selectedArqueo.usuarioNombre}
                            </p>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                Resumen General
                            </h3>
                            <div className={styles.detailRow}>
                                <span>Saldo Inicial (Apertura)</span>
                                <strong>${selectedArqueo.saldoInicial.toLocaleString()}</strong>
                            </div>
                            <div className={styles.detailRow}>
                                <span>Total Ventas (Sistema)</span>
                                <strong>${selectedArqueo.totalVentasEsperado.toLocaleString()}</strong>
                            </div>
                            <div className={styles.detailRow}>
                                <span>Total Movimientos Manuales</span>
                                <strong>${selectedArqueo.totalManualEsperado.toLocaleString()}</strong>
                            </div>
                            <div className={styles.detailRow} style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '2px dashed #cbd5e1' }}>
                                <span style={{ fontWeight: 600 }}>Total Real Contado (Cajero)</span>
                                <strong style={{ fontSize: '1.1rem' }}>${selectedArqueo.totalRealContado.toLocaleString()}</strong>
                            </div>
                            <div className={styles.detailRow} style={{ background: selectedArqueo.diferencia === 0 ? '#dcfce7' : (selectedArqueo.diferencia > 0 ? '#e0f2fe' : '#fef2f2'), padding: '0.5rem 1rem', margin: '0.5rem -1rem -0.5rem', borderRadius: '8px', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, color: selectedArqueo.diferencia === 0 ? '#166534' : (selectedArqueo.diferencia > 0 ? '#0369a1' : '#991b1b') }}>Diferencia Final</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <strong style={{ color: selectedArqueo.diferencia === 0 ? '#166534' : (selectedArqueo.diferencia > 0 ? '#0369a1' : '#991b1b'), fontSize: '1.2rem' }}>
                                        {selectedArqueo.diferencia === 0
                                            ? '$0'
                                            : (selectedArqueo.diferencia > 0
                                                ? `+$${selectedArqueo.diferencia.toLocaleString()}`
                                                : `-$${Math.abs(selectedArqueo.diferencia).toLocaleString()}`)
                                        }
                                    </strong>
                                    {selectedArqueo.diferencia !== 0 && (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            textTransform: 'uppercase',
                                            background: selectedArqueo.diferencia > 0 ? '#bae6fd' : '#fecaca',
                                            color: selectedArqueo.diferencia > 0 ? '#0369a1' : '#991b1b'
                                        }}>
                                            {selectedArqueo.diferencia > 0 ? 'Sobrante' : 'Faltante'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                Desglose por Método de Pago
                            </h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '8px 0', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Método</th>
                                        <th style={{ textAlign: 'right', padding: '8px 0', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Esperado</th>
                                        <th style={{ textAlign: 'right', padding: '8px 0', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Real</th>
                                        <th style={{ textAlign: 'right', padding: '8px 0', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Dif.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedArqueo.detalles.map(d => (
                                        <tr key={d.metodoPagoId}>
                                            <td style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>{d.metodoPagoNombre}</td>
                                            <td style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>${d.montoEsperado.toLocaleString()}</td>
                                            <td style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: 600 }}>${d.montoReal.toLocaleString()}</td>
                                            <td style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: d.diferencia === 0 ? '#64748b' : (d.diferencia > 0 ? '#16a34a' : '#dc2626') }}>
                                                {d.diferencia !== 0 ? (d.diferencia > 0 ? `+$${d.diferencia.toLocaleString()}` : `-$${Math.abs(d.diferencia).toLocaleString()}`) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {selectedArqueo.observaciones && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '4px' }}>
                                <strong style={{ display: 'block', color: '#b45309', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Observaciones del Cajero:</strong>
                                <p style={{ margin: 0, color: '#92400e', fontSize: '0.95rem', fontStyle: 'italic' }}>
                                    "{selectedArqueo.observaciones}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
