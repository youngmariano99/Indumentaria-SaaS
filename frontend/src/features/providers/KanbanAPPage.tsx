import { useState } from 'react';
import { Calendar, Warning, Clock, CheckCircle } from "@phosphor-icons/react";
import styles from './KanbanAPPage.module.css';

interface DebtItem {
    id: string;
    proveedor: string;
    monto: number;
    vencimiento: string;
    diasAtraso: number;
}

export function KanbanAPPage() {
    const [columns] = useState({
        corriente: [
            { id: '1', proveedor: 'Distribuidora X', monto: 12500, vencimiento: '2026-03-20', diasAtraso: -5 },
            { id: '2', proveedor: 'Textil Sur', monto: 45000, vencimiento: '2026-03-25', diasAtraso: -10 },
        ],
        vencido30: [
            { id: '3', proveedor: 'Ferretería Central', monto: 8900, vencimiento: '2026-02-15', diasAtraso: 20 },
        ],
        vencido60: [
            { id: '4', proveedor: 'Importadora Global', monto: 150000, vencimiento: '2025-12-01', diasAtraso: 100 },
        ]
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Cuentas por Pagar (Kanban)</h1>
                    <p className={styles.subtitle}>Seguimiento visual de deudas y vencimientos.</p>
                </div>
            </header>

            <div className={styles.kanbanBoard}>
                <div className={styles.column}>
                    <div className={styles.columnHeader}>
                        <CheckCircle size={20} color="#16a34a" weight="fill" />
                        <h3>Corriente</h3>
                        <span className={styles.badge}>{columns.corriente.length}</span>
                    </div>
                    <div className={styles.cards}>
                        {columns.corriente.map(debt => <DebtCard key={debt.id} debt={debt} />)}
                    </div>
                </div>

                <div className={styles.column}>
                    <div className={styles.columnHeader}>
                        <Clock size={20} color="#d97706" weight="fill" />
                        <h3>Vencido 0-30 días</h3>
                        <span className={styles.badge}>{columns.vencido30.length}</span>
                    </div>
                    <div className={styles.cards}>
                        {columns.vencido30.map(debt => <DebtCard key={debt.id} debt={debt} />)}
                    </div>
                </div>

                <div className={styles.column}>
                    <div className={styles.columnHeader}>
                        <Warning size={20} color="#dc2626" weight="fill" />
                        <h3>Vencido +60 días</h3>
                        <span className={styles.badge}>{columns.vencido60.length}</span>
                    </div>
                    <div className={styles.cards}>
                        {columns.vencido60.map(debt => <DebtCard key={debt.id} debt={debt} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DebtCard({ debt }: { debt: DebtItem }) {
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <span className={styles.providerName}>{debt.proveedor}</span>
                <span className={styles.amount}>${debt.monto.toLocaleString('es-AR')}</span>
            </div>
            <div className={styles.cardFooter}>
                <div className={styles.infoRow}>
                    <Calendar size={14} />
                    <span>Vence: {debt.vencimiento}</span>
                </div>
                {debt.diasAtraso > 0 && (
                    <span className={styles.atrasoTag}>
                        {debt.diasAtraso} días de atraso
                    </span>
                )}
            </div>
        </div>
    );
}
