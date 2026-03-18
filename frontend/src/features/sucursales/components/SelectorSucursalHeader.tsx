import { useState, useEffect } from 'react';
import { MapPin, CaretDown, Check } from "@phosphor-icons/react";
import { useSucursales } from '../hooks/useSucursales';
import { useSucursalStore } from '../../../store/sucursalStore';

export function SelectorSucursalHeader() {
    const { sucursales } = useSucursales();
    const { sucursalId, sucursalNombre, setSucursal } = useSucursalStore();
    const [isOpen, setIsOpen] = useState(false);

    // Seleccionar automáticamente la primera si no hay ninguna seleccionada
    useEffect(() => {
        if (!sucursalId && sucursales.length > 0) {
            setSucursal(sucursales[0].id, sucursales[0].nombre);
        }
    }, [sucursalId, sucursales, setSucursal]);

    if (sucursales.length <= 1) return null;

    return (
        <div style={{ position: 'relative' }}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'var(--color-gray-100)',
                    border: '1px solid var(--color-gray-200)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-gray-700)',
                    transition: 'all 0.2s'
                }}
            >
                <MapPin size={18} weight="bold" color="var(--color-primary)" />
                <span>{sucursalNombre || 'Seleccionar Sucursal'}</span>
                <CaretDown size={14} weight="bold" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {isOpen && (
                <>
                    <div 
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
                        onClick={() => setIsOpen(false)} 
                    />
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: '220px',
                        background: 'white',
                        border: '1px solid var(--color-gray-200)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        zIndex: 999,
                        padding: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                    }}>
                        <p style={{ fontSize: '11px', color: 'var(--color-gray-400)', padding: '4px 8px', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>
                            Cambiar Ubicación
                        </p>
                        {sucursales.map(s => (
                            <button
                                key={s.id}
                                onClick={() => {
                                    setSucursal(s.id, s.nombre);
                                    setIsOpen(false);
                                    // Recargar página para asegurar que todo el estado use la nueva sucursal si fuera necesario
                                    // window.location.reload(); 
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: s.id === sucursalId ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ 
                                        fontSize: '14px', 
                                        fontWeight: s.id === sucursalId ? 700 : 500,
                                        color: s.id === sucursalId ? 'var(--color-primary)' : 'var(--color-gray-700)'
                                    }}>
                                        {s.nombre}
                                    </span>
                                    <span style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>{s.direccion}</span>
                                </div>
                                {s.id === sucursalId && <Check size={16} weight="bold" color="var(--color-primary)" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
