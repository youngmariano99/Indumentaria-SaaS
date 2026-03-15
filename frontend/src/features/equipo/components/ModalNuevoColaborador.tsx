import { useState } from 'react';
import type { FormEvent } from 'react';
import { X, FloppyDisk } from "@phosphor-icons/react";
import styles from './ModalNuevoColaborador.module.css';
import { useEquipo } from '../hooks/useEquipo';
import { Button } from '../../../shared/components/Button';

interface ModalNuevoColaboradorProps {
    onClose: () => void;
}

export function ModalNuevoColaborador({ onClose }: ModalNuevoColaboradorProps) {
    const { crearColaborador, isCreating } = useEquipo();
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 4 // Por defecto Cajero
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await crearColaborador(formData);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.mensaje || "Ocurrió un error al crear el colaborador.");
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <header className={styles.header}>
                    <h2>Agregar Nuevo Colaborador</h2>
                    <button className={styles.btnClose} onClick={onClose}>
                        <X size={20} />
                    </button>
                </header>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {error && <div className={styles.errorAlert}>{error}</div>}

                    <div className={styles.field}>
                        <label>Nombre Completo</label>
                        <input 
                            className={styles.input}
                            required
                            type="text" 
                            placeholder="Ej: Juan Pérez"
                            value={formData.nombre}
                            onChange={e => setFormData({...formData, nombre: e.target.value})}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Email de Acceso</label>
                        <input 
                            className={styles.input}
                            required
                            type="email" 
                            placeholder="empleado@negocio.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Contraseña Inicial</label>
                        <input 
                            className={styles.input}
                            required
                            type="password" 
                            placeholder="Mínimo 6 caracteres"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Rol Asignado</label>
                        <select 
                            className={styles.input}
                            value={formData.rol}
                            onChange={e => setFormData({...formData, rol: Number(e.target.value)})}
                        >
                            <option value={4}>Cajero (Operario)</option>
                            <option value={3}>Gerente (Administrador)</option>
                            <option value={5}>Auditor (Solo Lectura)</option>
                        </select>
                    </div>

                    <footer className={styles.footer}>
                        <Button variant="outline" type="button" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button 
                            variant="primary" 
                            type="submit" 
                            loading={isCreating}
                            icon={<FloppyDisk size={18} weight="bold" />}
                        >
                            Crear Acceso
                        </Button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
