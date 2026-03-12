import { useState, useEffect } from "react";
import { reportsApi, type BajoStockDto } from "../../../features/reports/api/reportsApi";
import { WarningCircle, Package } from "@phosphor-icons/react";
import styles from "./BajoStock.module.css";

const BajoStockFerreteria = () => {
    const [data, setData] = useState<BajoStockDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        reportsApi.getBajoStock()
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Cargando alertas de stock...</div>;
    if (data.length === 0) return null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <WarningCircle size={24} color="#f97316" weight="bold" />
                <h3>Reponer Stock (Quiebre inminente)</h3>
            </div>

            <div className={styles.list}>
                {data.map(item => (
                    <div key={item.varianteId} className={styles.item}>
                        <div className={styles.info}>
                            <span className={styles.name}>{item.productoNombre}</span>
                            <span className={styles.sub}>{item.categoria}</span>
                        </div>
                        <div className={styles.stockInfo}>
                            <span className={styles.current}>{item.stockActual}</span>
                            <span className={styles.separator}>/</span>
                            <span className={styles.min}>{item.stockMinimo} mín.</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <button className={styles.btnAction}>
                <Package size={18} />
                Generar Orden de Compra
            </button>
        </div>
    );
};

export default BajoStockFerreteria;
