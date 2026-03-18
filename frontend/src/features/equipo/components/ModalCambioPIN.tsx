import { useState } from 'react';
import { X, Key, Info } from "@phosphor-icons/react";
import styles from './ModalNuevoColaborador.module.css'; 
import { useEquipo } from '../hooks/useEquipo';
import { Button } from '../../../shared/components/Button';

interface ModalCambioPINProps {
    user: any;
    onClose: () => void;
}

export function ModalCambioPIN({ user, onClose }: ModalCambioPINProps) {
    const { actualizarPin, isUpdating } = useEquipo();
    const [pin, setPin] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 4) {
            setError("El PIN debe ser de 4 dígitos.");
            return;
        }

        try {
            await actualizarPin({ id: user.id, pin });
            onClose();
        } catch (err: any) {
            setError("Error al guardar el PIN.");
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                <header className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Key size={24} weight="bold" color="var(--color-primary)" />
                        <h2>Asignar PIN de Acceso</h2>
                    </div>
                    <button className={styles.btnClose} onClick={onClose}>
                        <X size={20} />
                    </button>
                </header>

                <form className={styles.form} onSubmit={handleSave}>
                    <p style={{ fontSize: '13px', color: '#475569' }}>
                        Establecé un código de 4 dígitos para que <b>{user.nombre}</b> pueda cambiar de turno rápidamente.
                    </p>

                    <div className={styles.field}>
                        <label>Nuevo PIN (4 dígitos)</label>
                        <input 
                            className={styles.input}
                            type="password"
                            maxLength={4}
                            pattern="\d{4}"
                            required
                            placeholder="Ej: 1234"
                            value={pin}
                            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                            style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                        />
                    </div>

                    {error && <div className={styles.errorAlert}>{error}</div>}

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff7ed', padding: '10px', borderRadius: '8px', color: '#9a3412', fontSize: '12px' }}>
                        <Info size={18} weight="fill" />
                        <span>Este PIN es personal. El empleado podrá usarlo en el punto de venta para identificarse.</span>
                    </div>

                    <footer className={styles.footer}>
                        <Button variant="outline" type="button" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button 
                            variant="primary" 
                            type="submit" 
                            loading={isUpdating}
                        >
                            Guardar PIN
                        </Button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
