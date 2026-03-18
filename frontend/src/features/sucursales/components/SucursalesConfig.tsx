import { useState } from 'react';
import { MapPin, Plus, Phone, Trash, Storefront } from "@phosphor-icons/react";
import { useSucursales } from '../hooks/useSucursales';
import { SucursalModal } from './SucursalModal';
import styles from '../../ajustes/AjustesPage.module.css';

export function SucursalesConfig() {
    const { sucursales, isLoading, eliminarSucursal } = useSucursales();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sucursalEditar, setSucursalEditar] = useState<any>(null);

    const handleEdit = (sucursal: any) => {
        setSucursalEditar(sucursal);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta sucursal?')) {
            try {
                await eliminarSucursal(id);
            } catch (err: any) {
                alert(err.response?.data || 'Error al eliminar sucursal');
            }
        }
    };

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h2 className={styles.panelTitle}>Gestión de Sucursales</h2>
                    <p className={styles.panelDesc}>
                        Administra los puntos de venta y depósitos de tu negocio.
                    </p>
                </div>
                <button 
                    className={styles.saveBtn} 
                    style={{ padding: '8px 16px' }}
                    onClick={() => { setSucursalEditar(null); setIsModalOpen(true); }}
                >
                    <Plus size={18} weight="bold" />
                    Nueva Sucursal
                </button>
            </div>

            {isLoading ? (
                <p>Cargando sucursales...</p>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {sucursales.map(s => (
                        <div 
                            key={s.id} 
                            style={{ 
                                padding: '1.25rem', 
                                border: '1px solid var(--color-gray-200)', 
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: s.esDepositoCentral ? 'rgba(37, 99, 235, 0.02)' : 'white'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '8px', 
                                    background: 'var(--color-gray-100)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: 'var(--color-primary)'
                                }}>
                                    {s.esDepositoCentral ? <Storefront size={24} weight="fill" /> : <MapPin size={24} weight="bold" />}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{s.nombre}</h3>
                                        {s.esDepositoCentral && (
                                            <span style={{ 
                                                fontSize: '10px', 
                                                background: 'var(--color-primary)', 
                                                color: 'white', 
                                                padding: '2px 6px', 
                                                borderRadius: '4px',
                                                textTransform: 'uppercase',
                                                fontWeight: 700
                                            }}>
                                                Depósito Central
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MapPin size={14} /> {s.direccion}
                                        </span>
                                        {s.telefono && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Phone size={14} /> {s.telefono}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={() => handleEdit(s)}
                                    style={{ 
                                        padding: '6px 12px', 
                                        borderRadius: '6px', 
                                        border: '1px solid var(--color-gray-200)',
                                        background: 'white',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Editar
                                </button>
                                <button 
                                    onClick={() => handleDelete(s.id)}
                                    style={{ 
                                        padding: '6px 12px', 
                                        borderRadius: '6px', 
                                        border: '1px solid #fee2e2',
                                        background: '#fef2f2',
                                        color: '#dc2626',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Trash size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <SucursalModal 
                    onClose={() => setIsModalOpen(false)} 
                    editData={sucursalEditar}
                />
            )}
        </div>
    );
}
