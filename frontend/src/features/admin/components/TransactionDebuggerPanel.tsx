import { useQuery } from '@tanstack/react-query';
import { X, ClockCounterClockwise, ArrowRight } from '@phosphor-icons/react';
import { adminAuditApi } from '../api/adminAuditApi';
import styles from './TransactionDebuggerPanel.module.css';

interface Props {
    entityId: string;
    onClose: () => void;
}

export function TransactionDebuggerPanel({ entityId, onClose }: Props) {
    const { data: timeline, isLoading, isError } = useQuery({
        queryKey: ['auditTimeline', entityId],
        queryFn: () => adminAuditApi.getTimeline(entityId),
    });

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.panel} onClick={e => e.stopPropagation()}>
                <header className={styles.header}>
                    <div className={styles.headerInfo}>
                        <ClockCounterClockwise size={24} color="var(--color-primary)" />
                        <div>
                            <h2>Analizador Cronológico</h2>
                            <span className={styles.entityIdBadge}>{entityId}</span>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                <div className={styles.content}>
                    {isLoading && <div className={styles.loading}>Procesando reconstrucción temporal...</div>}
                    {isError && <div className={styles.error}>Error al obtener la línea de tiempo.</div>}

                    {timeline && timeline.length === 0 && (
                        <div className={styles.empty}>No hay historial para este UUID.</div>
                    )}

                    {timeline && timeline.length > 0 && (
                        <div className={styles.timelineContainer}>
                            {timeline.map((log) => (
                                <div key={log.id} className={styles.timelineItem}>
                                    <div className={styles.timelineDot}></div>
                                    <div className={styles.timelineContent}>
                                        <div className={styles.timelineMeta}>
                                            <span className={`${styles.actionBadge} ${styles[log.action.toLowerCase()] || ''}`}>
                                                {log.action}
                                            </span>
                                            <span className={styles.timeStr}>
                                                {new Date(log.timestamp).toLocaleString('es-AR', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                })}
                                            </span>
                                            <span className={styles.userIdStr} title={`User: ${log.userId} @ ${log.ipAddress}`}>
                                                Usuario: {log.userId.split('-')[0]}...
                                            </span>
                                        </div>

                                        {/* Comparador Visual Simple */}
                                        <div className={styles.diffBox}>
                                            {(log.action === 'Update' || log.action === 'Delete') && log.oldValues && (
                                                <div className={styles.jsonOld}>
                                                    <div className={styles.jsonLabel}>Estado Anterior</div>
                                                    <pre>{JSON.stringify(JSON.parse(log.oldValues), null, 2)}</pre>
                                                </div>
                                            )}

                                            {log.action === 'Update' && <div className={styles.diffArrow}><ArrowRight size={20} /></div>}

                                            {(log.action === 'Insert' || log.action === 'Update') && log.newValues && (
                                                <div className={styles.jsonNew}>
                                                    <div className={styles.jsonLabel}>Estado Aplicado</div>
                                                    <pre>{JSON.stringify(JSON.parse(log.newValues), null, 2)}</pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
