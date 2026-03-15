import { useState } from 'react';
import { X, User, IdentificationCard, Envelope, Phone, MapPin, FloppyDisk, Percent } from "@phosphor-icons/react";
import styles from './ProveedorFormModal.module.css';
import { providersApi } from '../api/providersApi';
import type { CreateProviderRequest } from '../api/providersApi';
import { Button } from '../../../shared/components/Button';
import { Disclosure } from '../../../shared/components/Disclosure';

interface ProveedorFormModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function ProveedorFormModal({ onClose, onSuccess }: ProveedorFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateProviderRequest>({
        razonSocial: '',
        documento: '',
        email: '',
        telefono: '',
        direccion: '',
        porcentajeRecargo: 0
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await providersApi.createProvider(formData);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error al crear proveedor", error);
            alert("Error al crear el proveedor. Verifique los datos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <header className={styles.header}>
                    <div className={styles.titleGroup}>
                        <User size={24} weight="bold" color="var(--color-primary)" />
                        <h2>Nuevo Proveedor</h2>
                    </div>
                    <button className={styles.btnClose} onClick={onClose}>
                        <X size={20} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label><IdentificationCard size={16} /> Razón Social / Nombre Comercial</label>
                        <input 
                            required
                            type="text" 
                            placeholder="Ej: Distribuidora Central S.A."
                            value={formData.razonSocial}
                            onChange={e => setFormData({...formData, razonSocial: e.target.value})}
                        />
                    </div>

                    <div className={styles.field}>
                        <label><IdentificationCard size={16} /> CUIT o DNI (para facturación)</label>
                        <input 
                            required
                            type="text" 
                            placeholder="30-XXXXXXXX-X"
                            value={formData.documento}
                            onChange={e => setFormData({...formData, documento: e.target.value})}
                        />
                    </div>

                    <div className={styles.educationalSection}>
                        <Disclosure 
                            title="Datos de Contacto y Logística" 
                            educationalHint="Opcional: Te servirá para agilizar los pedidos por WhatsApp o Email."
                        >
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label><Envelope size={16} /> Email</label>
                                    <input 
                                        type="email" 
                                        placeholder="ventas@proveedor.com"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label><Phone size={16} /> Teléfono</label>
                                    <input 
                                        type="text" 
                                        placeholder="011-XXXX-XXXX"
                                        value={formData.telefono}
                                        onChange={e => setFormData({...formData, telefono: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label><MapPin size={16} /> Dirección Comercial</label>
                                <input 
                                    type="text" 
                                    placeholder="Calle 123, Ciudad"
                                    value={formData.direccion}
                                    onChange={e => setFormData({...formData, direccion: e.target.value})}
                                />
                            </div>
                        </Disclosure>
                    </div>

                    <div className={styles.educationalSection}>
                        <Disclosure 
                            title="Configuración de Costos (Recargos)" 
                            educationalHint="Si el proveedor te aplica cargos fijos de envío o gestión, podés darlos de alta acá."
                        >
                            <div className={styles.field}>
                                <label><Percent size={16} /> % Recargo Global Prorrateado</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    placeholder="Ej: 5.5"
                                    value={formData.porcentajeRecargo}
                                    onChange={e => setFormData({...formData, porcentajeRecargo: Number(e.target.value)})}
                                />
                                <p className={styles.fieldHint}>Este % se sumará al costo unitario automáticamente al cargar facturas.</p>
                            </div>
                        </Disclosure>
                    </div>

                    <footer className={styles.footer}>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            loading={loading}
                            icon={<FloppyDisk size={18} weight="bold" />}
                            educational
                        >
                            {formData.razonSocial ? `Registrar ${formData.razonSocial}` : "Registrar Proveedor"}
                        </Button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
