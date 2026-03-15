import { useState } from 'react';
import { X, ShieldCheck, CheckSquare, Square } from "@phosphor-icons/react";
import styles from './ModalNuevoColaborador.module.css'; // Reutilizamos overlay/modal styles
import { useEquipo } from '../hooks/useEquipo';
import { Button } from '../../../shared/components/Button';

interface PanelPermisosProps {
    user: any;
    onClose: () => void;
}

const MODULOS_SISTEMA = [
    { key: 'Ventas', label: 'Caja y Ventas', desc: 'Permitir realizar cobros y cierres de caja.' },
    { key: 'Catalog', label: 'Catálogo de Productos', desc: 'Permitir ver y editar precios y stock.' },
    { key: 'Providers', label: 'Gestión de Proveedores', desc: 'Permitir cargar facturas y pagos a proveedores.' },
    { key: 'Reports', label: 'Reportes e Insights', desc: 'Acceso a estadísticas sensibles del negocio.' },
    { key: 'CRM', label: 'Cartera de Clientes', desc: 'Ver deudas y datos de contacto de clientes.' },
];

export function PanelPermisos({ user, onClose }: PanelPermisosProps) {
    const { actualizarPermisos, isUpdating } = useEquipo();
    const [permisos, setPermisos] = useState<Record<string, boolean>>(user.permisos || {});

    const togglePermiso = (key: string) => {
        setPermisos(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = async () => {
        await actualizarPermisos({ id: user.id, permisos });
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                <header className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={24} weight="bold" color="var(--color-primary)" />
                        <div>
                            <h2 style={{ lineHeight: 1 }}>Permisos Granulares</h2>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Editando accesos de <b>{user.nombre}</b></p>
                        </div>
                    </div>
                    <button className={styles.btnClose} onClick={onClose}>
                        <X size={20} />
                    </button>
                </header>

                <div className={styles.form}>
                    <p style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
                        Seleccioná qué módulos puede operar este colaborador. 
                        Si un módulo está deshabilitado, ni siquiera aparecerá en su menú lateral.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {MODULOS_SISTEMA.map(m => (
                            <div 
                                key={m.key} 
                                onClick={() => togglePermiso(m.key)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: permisos[m.key] ? 'var(--color-primary)' : '#e2e8f0',
                                    background: permisos[m.key] ? 'rgba(37, 99, 235, 0.03)' : '#fff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {permisos[m.key] ? (
                                    <CheckSquare size={24} weight="fill" color="var(--color-primary)" />
                                ) : (
                                    <Square size={24} weight="bold" color="#94a3b8" />
                                )}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: permisos[m.key] ? '#1e40af' : '#1e293b' }}>
                                        {m.label}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                        {m.desc}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <footer className={styles.footer}>
                        <Button variant="outline" type="button" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button 
                            variant="primary" 
                            type="button" 
                            onClick={handleSave}
                            loading={isUpdating}
                        >
                            Guardar Configuración
                        </Button>
                    </footer>
                </div>
            </div>
        </div>
    );
}
