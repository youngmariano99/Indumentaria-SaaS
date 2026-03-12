import { useState, useEffect } from "react";
import { reportsApi, type AgingReportDto } from "../../../features/reports/api/reportsApi";
import { Warning, Clock, User } from "@phosphor-icons/react";
import styles from "./AgingReport.module.css";

const AgingReport = () => {
    const [data, setData] = useState<AgingReportDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        reportsApi.getAgingReport()
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Cargando aging report...</div>;
    if (data.length === 0) return <div>No hay deudas activas.</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Warning size={24} color="#dc2626" weight="bold" />
                <h3>Aging Report (Morosidad)</h3>
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Deuda Total</th>
                            <th>Días de Antigüedad</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.clienteId}>
                                <td className={styles.clientCell}>
                                    <User size={16} />
                                    {item.nombre}
                                </td>
                                <td className={styles.debtCell}>
                                    ${item.deudaTotal.toLocaleString("es-AR")}
                                </td>
                                <td>
                                    <div className={styles.daysCell}>
                                        <Clock size={16} />
                                        {item.diasDeuda} días
                                    </div>
                                </td>
                                <td>
                                    <span className={item.diasDeuda > 30 ? styles.badgeCritical : (item.diasDeuda > 15 ? styles.badgeWarning : styles.badgeNormal)}>
                                        {item.diasDeuda > 30 ? "Crítico" : (item.diasDeuda > 15 ? "Alerta" : "Vigente")}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AgingReport;
