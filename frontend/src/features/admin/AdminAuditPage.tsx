import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Binoculars, MagnifyingGlass, Funnel, ClockCounterClockwise } from '@phosphor-icons/react';
import { adminAuditApi } from './api/adminAuditApi';
import { TransactionDebuggerPanel } from './components/TransactionDebuggerPanel';
import styles from './AdminAuditPage.module.css';

export function AdminAuditPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

    // Debounce manual simple
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setDebouncedSearch(searchTerm);
    };

    const { data: logs, isLoading, isError } = useQuery({
        queryKey: ['adminAuditLogs', debouncedSearch],
        queryFn: () => adminAuditApi.search(debouncedSearch),
        refetchInterval: 30000, // Refetch cada 30 segundos
    });

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <Binoculars size={28} color="var(--color-primary)" weight="duotone" />
                    <div>
                        <h1 className={styles.title}>Auditoría Forense</h1>
                        <p className={styles.subtitle}>Supervisión global de transacciones y cambios (Todos los inquilinos)</p>
                    </div>
                </div>
            </header>

            <div className={styles.filtersCard}>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <div className={styles.searchWrapper}>
                        <MagnifyingGlass size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar por UUID de entidad, acción, o contenido JSON profundo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <button type="submit" className={styles.searchBtn}>
                        Buscar en JSONB
                    </button>
                    <button type="button" className={styles.filterBtn}>
                        <Funnel size={20} />
                        Filtros Avanzados
                    </button>
                </form>
            </div>

            <div className={styles.tableCard}>
                {isLoading ? (
                    <div className={styles.loading}>Cargando logs de auditoría...</div>
                ) : isError ? (
                    <div className={styles.error}>Error al cargar auditoría.</div>
                ) : (
                    <div className={styles.tableResponsive}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Fecha y Hora</th>
                                    <th>Tabla</th>
                                    <th>Acción</th>
                                    <th>Resumen / Valores</th>
                                    <th>Usuario VIP</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs?.map((log) => (
                                    <tr key={log.id}>
                                        <td className={styles.cellTime}>
                                            {new Date(log.timestamp).toLocaleString('es-AR')}
                                        </td>
                                        <td>
                                            <span className={styles.tagTable}>{log.tableName}</span>
                                        </td>
                                        <td>
                                            <span className={`${styles.tagAction} ${styles[log.action.toLowerCase()] || ''}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className={styles.cellJsonPreview}>
                                            {log.newValues ? (
                                                <div className={styles.jsonSnippet}>
                                                    {log.newValues.substring(0, 100)}...
                                                </div>
                                            ) : (
                                                <span className={styles.muted}>N/A</span>
                                            )}
                                        </td>
                                        <td className={styles.cellMuted}>
                                            <div title={log.userId} className={styles.truncate}>{log.userId.split('-')[0]}...</div>
                                        </td>
                                        <td>
                                            {log.primaryKey && (
                                                <button
                                                    className={styles.debugBtn}
                                                    onClick={() => setSelectedEntityId(log.primaryKey!)}
                                                    title="Abrir Time-Travel Debugger para esta entidad"
                                                >
                                                    <ClockCounterClockwise size={18} />
                                                    Analizar UUID
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {logs?.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                                            No se encontraron registros de auditoría.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Transaction Debugger Panel (Side drawer) */}
            {selectedEntityId && (
                <TransactionDebuggerPanel
                    entityId={selectedEntityId}
                    onClose={() => setSelectedEntityId(null)}
                />
            )}
        </div>
    );
}
