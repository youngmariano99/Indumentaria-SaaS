import { useState, useEffect } from 'react';
import { X, Storefront, MapPin, Phone } from "@phosphor-icons/react";
import { useSucursales } from '../hooks/useSucursales';
import modalStyles from '../../equipo/components/ModalNuevoColaborador.module.css';

interface SucursalModalProps {
    onClose: () => void;
    editData?: any;
}

export function SucursalModal({ onClose, editData }: SucursalModalProps) {
    const { crearSucursal, actualizarSucursal, isCreating, isUpdating } = useSucursales();
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        telefono: '',
        esDepositoCentral: false
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (editData) {
            setFormData({
                nombre: editData.nombre,
                direccion: editData.direccion,
                telefono: editData.telefono,
                esDepositoCentral: editData.esDepositoCentral
            });
        }
    }, [editData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            if (editData) {
                await actualizarSucursal({ id: editData.id, request: formData });
            } else {
                await crearSucursal(formData);
            }
            onClose();
        } catch (err: any) {
            const serverError = err.response?.data;
            if (serverError?.detalles && Array.isArray(serverError.detalles)) {
                setError(`${serverError.mensaje}: ${serverError.detalles.map((d: any) => d.Error).join(', ')}`);
            } else {
                setError(serverError?.mensaje || serverError?.detalle || "Ocurrió un error inesperado.");
            }
        }
    };

    const isPending = isCreating || isUpdating;

    return (
        <div className={modalStyles.overlay}>
            <div className={modalStyles.modal} style={{ maxWidth: '450px' }}>
                <header className={modalStyles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Storefront size={24} weight="bold" color="var(--color-primary)" />
                        <h2>{editData ? 'Editar Sucursal' : 'Nueva Sucursal'}</h2>
                    </div>
                    <button className={modalStyles.btnClose} onClick={onClose}>
                        <X size={20} />
                    </button>
                </header>

                <form className={modalStyles.form} onSubmit={handleSubmit}>
                    {error && <div className={modalStyles.errorAlert}>{error}</div>}

                    <div className={modalStyles.inputGroup}>
                        <label>Nombre del Local</label>
                        <div style={{ position: 'relative' }}>
                            <Storefront size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
                            <input 
                                className={modalStyles.input}
                                style={{ paddingLeft: '40px' }}
                                type="text"
                                placeholder="Ej: Sucursal Centro, Depósito Norte"
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                required
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    <div className={modalStyles.inputGroup}>
                        <label>Dirección Física</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
                            <input 
                                className={modalStyles.input}
                                style={{ paddingLeft: '40px' }}
                                type="text"
                                placeholder="Calle y número, Ciudad"
                                value={formData.direccion}
                                onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                required
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    <div className={modalStyles.inputGroup}>
                        <label>Teléfono de contacto (Opcional)</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
                            <input 
                                className={modalStyles.input}
                                style={{ paddingLeft: '40px' }}
                                type="tel"
                                placeholder="Ej: +54 9 11 ..."
                                value={formData.telefono}
                                onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        background: 'rgba(37, 99, 235, 0.05)', 
                        padding: '12px', 
                        borderRadius: '8px',
                        border: '1px solid rgba(37, 99, 235, 0.1)',
                        cursor: 'pointer'
                    }} onClick={() => setFormData({...formData, esDepositoCentral: !formData.esDepositoCentral})}>
                        <input 
                            type="checkbox" 
                            checked={formData.esDepositoCentral}
                            readOnly
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)' }}>¿Es el Depósito Central?</span>
                            <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>Marca esta opción si es donde recibes la mercadería principal.</span>
                        </div>
                    </div>

                    <div className={modalStyles.actions}>
                        <button type="button" className={modalStyles.btnCancel} onClick={onClose} disabled={isPending}>
                            Cancelar
                        </button>
                        <button type="submit" className={modalStyles.btnSave} disabled={isPending}>
                            {isPending ? 'Guardando...' : editData ? 'Actualizar' : 'Crear Sucursal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
