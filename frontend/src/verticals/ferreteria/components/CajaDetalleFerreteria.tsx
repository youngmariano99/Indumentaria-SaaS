import { useState, useEffect } from "react";
import { reportsApi, type CajaDetalleFerreteriaDto } from "../../../features/reports/api/reportsApi";
import { CurrencyDollar, Receipt, HandCoins, ArrowCircleUp } from "@phosphor-icons/react";
import styles from "./CajaDetalle.module.css";

const CajaDetalleFerreteria = () => {
    const [data, setData] = useState<CajaDetalleFerreteriaDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        reportsApi.getCajaFerreteria()
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Cargando caja...</div>;
    if (!data) return null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <CurrencyDollar size={24} weight="bold" />
                <h3>Caja del Día - Desglose</h3>
            </div>

            <div className={styles.grid}>
                <div className={`${styles.card} ${styles.sales}`}>
                    <div className={styles.icon}>
                        <Receipt size={32} />
                    </div>
                    <div className={styles.info}>
                        <span className={styles.label}>Ventas Directas (Efectivo)</span>
                        <span className={styles.value}>${data.ventasDirectasEfectivo.toLocaleString("es-AR")}</span>
                    </div>
                </div>

                <div className={`${styles.card} ${styles.collections}`}>
                    <div className={styles.icon}>
                        <HandCoins size={32} />
                    </div>
                    <div className={styles.info}>
                        <span className={styles.label}>Cobranza Cuentas Corrientes</span>
                        <span className={styles.value}>${data.cobranzasCuentasCorrientes.toLocaleString("es-AR")}</span>
                    </div>
                </div>

                <div className={`${styles.card} ${styles.others}`}>
                    <div className={styles.icon}>
                        <ArrowCircleUp size={32} />
                    </div>
                    <div className={styles.info}>
                        <span className={styles.label}>Otros Métodos (Tarjetas/QR)</span>
                        <span className={styles.value}>${data.cobranzasOtrosMetodos.toLocaleString("es-AR")}</span>
                    </div>
                </div>
            </div>

            <div className={styles.footer}>
                <span className={styles.totalLabel}>TOTAL CAJA HOY</span>
                <span className={styles.totalValue}>${data.totalCajaHoy.toLocaleString("es-AR")}</span>
            </div>
            
            <p className={styles.note}>
                * La separación diferencia ventas puras del día de ingresos por pagos de deudas anteriores.
            </p>
        </div>
    );
};

export default CajaDetalleFerreteria;
