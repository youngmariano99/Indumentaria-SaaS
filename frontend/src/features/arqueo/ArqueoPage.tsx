import { useEffect, useState } from "react";
import { CashRegister, CheckCircle, Warning, Lock, Wallet, ArrowCircleRight } from "@phosphor-icons/react";
import { arqueoApi, type ArqueoDto, type CerrarCajaDto } from "./api/arqueoApi";
import styles from "./ArqueoPage.module.css";

export function ArqueoPage() {
    const [arqueo, setArqueo] = useState<ArqueoDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [saldoInicial, setSaldoInicial] = useState<number>(0);
    const [closingData, setClosingData] = useState<CerrarCajaDto>({
        observaciones: "",
        detallesReales: []
    });

    // Simulamos la sucursal activa (esto debería venir de un contexto de sucursal/usuario)
    const STORE_ID = "00000000-0000-0000-0000-000000000000";

    useEffect(() => {
        loadSession();
    }, []);

    const loadSession = async () => {
        setLoading(true);
        try {
            const data = await arqueoApi.getActual(STORE_ID);
            setArqueo(data);
            // Inicializar detalles de cierre con los métodos de pago que vienen del servidor
            if (data?.detalles) {
                setClosingData({
                    observaciones: "",
                    detallesReales: data.detalles.map(d => ({
                        metodoPagoId: d.metodoPagoId,
                        montoReal: 0
                    }))
                });
            }
        } catch (error) {
            setArqueo(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAbrir = async () => {
        try {
            await arqueoApi.abrir({
                storeId: STORE_ID,
                saldoInicial: saldoInicial
            });
            loadSession();
        } catch (error) {
            alert("No se pudo abrir la caja.");
        }
    };

    const handleCerrar = async () => {
        if (!arqueo) return;
        try {
            await arqueoApi.cerrar(arqueo.id, closingData);
            alert("Caja cerrada exitosamente.");
            loadSession();
        } catch (error) {
            alert("Error al cerrar la caja.");
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

    // ESCENARIO 1: No hay caja abierta (Pantalla de Apertura)
    if (!arqueo) {
        return (
            <div className={styles.container}>
                <div className={styles.setupCard}>
                    <div className={styles.setupIcon}>
                        <CashRegister size={32} weight="duotone" />
                    </div>
                    <h1 className={styles.title}>Apertura de Jornada</h1>
                    <p className={styles.subtitle}>Ingresá el saldo inicial para comenzar a operar.</p>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Efectivo en Caja</label>
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
            </div>
        );
    }

    // ESCENARIO 2: Caja Abierta (Pantalla de Cierre Ciego)
    return (
        <div className={styles.container}>
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
                            {arqueo.detalles.map(d => (
                                <div key={d.metodoPagoId} className={styles.paymentItem}>
                                    <div className={styles.paymentName}>
                                        {d.metodoPagoNombre.toLowerCase().includes("efectivo") ? <Wallet size={16} /> : <CheckCircle size={16} />}
                                        <span style={{ marginLeft: '8px' }}>{d.metodoPagoNombre}</span>
                                    </div>
                                    <input
                                        type="number"
                                        className={styles.inputSmall}
                                        placeholder="0.00"
                                        onChange={(e) => handleMontoRealChange(d.metodoPagoId, e.target.value)}
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
        </div>
    );
}
