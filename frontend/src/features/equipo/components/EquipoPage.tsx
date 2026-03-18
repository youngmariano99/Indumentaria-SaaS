import { useState } from 'react';
import { Users, UserPlus, Key, Info, Clock, ShieldCheck, ListChecks } from "@phosphor-icons/react";
import { useEquipo } from '../hooks/useEquipo';
import styles from './EquipoPage.module.css';
import { Button } from '../../../shared/components/Button';
import { ModalNuevoColaborador } from './ModalNuevoColaborador';
import { PanelPermisos } from './PanelPermisos';
import { ModalCambioPIN } from './ModalCambioPIN';
import layoutStyles from "../../dashboard/DashboardPage.module.css";

export function EquipoPage() {
    const { colaboradores, logsAuditoria, isLoading, isLoadingAuditoria } = useEquipo();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [pinUser, setPinUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'miembros' | 'actividad'>('miembros');

    const getRoleLabel = (role: string | number) => {
        const r = role.toString();
        switch (r) {
            case '2':
            case 'Owner': return { label: 'Dueño', class: styles.roleOwner };
            case '3':
            case 'Manager': return { label: 'Gerente', class: styles.roleManager };
            case '4':
            case 'Cashier': return { label: 'Cajero', class: styles.roleCashier };
            case '5':
            case 'Auditor': return { label: 'Auditor', class: styles.roleAuditor };
            default: return { label: 'Empleado', class: '' };
        }
    };

    return (
        <div className={styles.page}>
             <header className={layoutStyles.topbar}>
                <div className={layoutStyles.topbarRow}>
                    <div className={layoutStyles.topbarTitle}>
                         <h1>Mi Equipo</h1>
                         <p>Gestioná los accesos y permisos de tus empleados.</p>
                    </div>
                    <Button 
                        icon={<UserPlus weight="bold" />} 
                        onClick={() => setIsModalOpen(true)}
                    >
                        Agregar Colaborador
                    </Button>
                </div>
            </header>

            <div className={styles.container}>
                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tab} ${activeTab === 'miembros' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('miembros')}
                    >
                        <Users size={20} weight={activeTab === 'miembros' ? 'fill' : 'bold'} />
                        Miembros del Equipo
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'actividad' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('actividad')}
                    >
                        <Clock size={20} weight={activeTab === 'actividad' ? 'fill' : 'bold'} />
                        Actividad Reciente
                    </button>
                </div>

                <div className={styles.card}>
                    {activeTab === 'miembros' ? (
                        isLoading ? (
                            <div className={styles.empty}>Cargando equipo...</div>
                        ) : colaboradores.length === 0 ? (
                            <div className={styles.empty}>
                                <Users size={48} weight="thin" />
                                <p>No tenés colaboradores registrados aún.</p>
                            </div>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Nombre / Email</th>
                                        <th>Rol</th>
                                        <th>Permisos</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {colaboradores.map(c => {
                                        const role = getRoleLabel(c.rol);
                                        return (
                                            <tr key={c.id}>
                                                <td>
                                                    <span className={styles.userName}>{c.nombre}</span>
                                                    <span className={styles.userEmail}>{c.email}</span>
                                                </td>
                                                <td>
                                                    <span className={`${styles.roleBadge} ${role.class}`}>
                                                        {role.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                        {Object.entries(c.permisos)
                                                            .filter(([_, enabled]) => enabled)
                                                            .map(([key]) => (
                                                                <span key={key} style={{ fontSize: '10px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                                                                    {key}
                                                                </span>
                                                            ))
                                                        }
                                                        {Object.keys(c.permisos).filter(k => c.permisos[k]).length === 0 && (
                                                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>Sin restricciones</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.actions}>
                                                        <button 
                                                            className={styles.actionBtn}
                                                            onClick={() => setSelectedUser(c)}
                                                            disabled={c.rol.toString() === '2' || c.rol === 'Owner'} // No se editan permisos del dueño
                                                        >
                                                            <Key size={14} weight="bold" />
                                                            Permisos
                                                        </button>
                                                        <button 
                                                            className={styles.actionBtn}
                                                            onClick={() => setPinUser(c)}
                                                            title={c.tienePin ? "Cambiar PIN" : "Asignar PIN"}
                                                        >
                                                            <Key size={14} weight={c.tienePin ? "fill" : "bold"} color={c.tienePin ? "#eab308" : "inherit"} />
                                                            PIN
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )
                    ) : (
                        <div className={styles.auditList}>
                            {isLoadingAuditoria ? (
                                <div className={styles.empty}>Cargando registros...</div>
                            ) : logsAuditoria.length === 0 ? (
                                <div className={styles.empty}>
                                    <ListChecks size={48} weight="thin" />
                                    <p>No hay actividad registrada recientemente.</p>
                                </div>
                            ) : (
                                <div className={styles.auditContainer}>
                                    {logsAuditoria.map((log: any) => (
                                        <div key={log.id} className={styles.auditItem}>
                                            <div className={styles.auditIcon}>
                                                <ShieldCheck size={18} weight="fill" color="var(--color-primary)" />
                                            </div>
                                            <div className={styles.auditInfo}>
                                                <div className={styles.auditHeader}>
                                                    <span className={styles.auditUser}>{log.usuarioNombre}</span>
                                                    <span className={styles.auditAction}>{log.action === 'Added' ? 'Creó' : log.action === 'Modified' ? 'Editó' : 'Eliminó'}</span>
                                                    <span className={styles.auditTable}>{log.tableName}</span>
                                                </div>
                                                <div className={styles.auditTime}>
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#eff6ff', padding: '12px', borderRadius: '8px', color: '#1e40af', fontSize: '13px' }}>
                    <Info size={20} weight="fill" />
                    <span>Tu plan actual incluye <b>1 colaborador gratuito</b>. Se cobrará un adicional por cada usuario extra.</span>
                </div>
            </div>

            {isModalOpen && (
                <ModalNuevoColaborador onClose={() => setIsModalOpen(false)} />
            )}

            {selectedUser && (
                <PanelPermisos 
                    user={selectedUser} 
                    onClose={() => setSelectedUser(null)} 
                />
            )}

            {pinUser && (
                <ModalCambioPIN 
                    user={pinUser} 
                    onClose={() => setPinUser(null)} 
                />
            )}
        </div>
    );
}
