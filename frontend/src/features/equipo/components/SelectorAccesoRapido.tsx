import { useState } from 'react';
import { X, Swap } from "@phosphor-icons/react";
import styles from './ModalNuevoColaborador.module.css'; 
import { useEquipo } from '../hooks/useEquipo';
import { useAuthStore } from '../../auth/store/authStore';

interface SelectorAccesoRapidoProps {
    onClose: () => void;
}

export function SelectorAccesoRapido({ onClose }: SelectorAccesoRapidoProps) {
    const { autenticarPin, isAuthenticating } = useEquipo();
    const login = useAuthStore(s => s.login);
    const [pin, setPin] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handlePinClick = (num: string) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === 4) {
                handleAuth(newPin);
            }
        }
    };

    const handleAuth = async (finalPin: string) => {
        setError(null);
        try {
            const data = await autenticarPin(finalPin);
            login(data);
            onClose();
        } catch (err: any) {
            setError("PIN incorrecto.");
            setPin('');
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} style={{ maxWidth: '350px' }} onClick={e => e.stopPropagation()}>
                <header className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Swap size={24} weight="bold" color="var(--color-primary)" />
                        <h2>Cambio de Turno</h2>
                    </div>
                    <button className={styles.btnClose} onClick={onClose}>
                        <X size={20} />
                    </button>
                </header>

                <div className={styles.form} style={{ alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        {[0, 1, 2, 3].map(i => (
                            <div 
                                key={i}
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    border: '2px solid var(--color-primary)',
                                    background: pin.length > i ? 'var(--color-primary)' : 'transparent',
                                    transition: 'all 0.2s'
                                }}
                            />
                        ))}
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: '12px',
                        width: '100%'
                    }}>
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                            <button 
                                key={num}
                                onClick={() => handlePinClick(num)}
                                className={styles.input}
                                style={{ height: '60px', fontSize: '20px', fontWeight: 700 }}
                            >
                                {num}
                            </button>
                        ))}
                        <button onClick={() => setPin('')} className={styles.input} style={{ height: '60px', color: '#dc2626' }}>C</button>
                        <button onClick={() => handlePinClick('0')} className={styles.input} style={{ height: '60px', fontSize: '20px', fontWeight: 700 }}>0</button>
                        <button onClick={() => setPin(pin.slice(0, -1))} className={styles.input} style={{ height: '60px' }}>⌫</button>
                    </div>

                    {error && <div className={styles.errorAlert} style={{ marginTop: '12px', width: '100%', textAlign: 'center' }}>{error}</div>}
                    
                    {isAuthenticating && <p style={{ fontSize: '12px', color: 'var(--color-primary)', marginTop: '8px' }}>Validando...</p>}
                </div>
            </div>
        </div>
    );
}
