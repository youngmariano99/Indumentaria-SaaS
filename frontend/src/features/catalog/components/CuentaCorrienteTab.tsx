import { useState, useEffect } from 'react';
import { clientesApi } from '../api/clientesApi';
import { posApi, type MetodoPagoDto } from '../../pos/api/posApi';
import { Wallet, PlusCircle, CalendarBlank, ArrowUpRight, ArrowDownRight } from '@phosphor-icons/react';

interface Props {
    clienteId: string;
    onUpdate?: () => void;
}

export function CuentaCorrienteTab({ clienteId, onUpdate }: Props) {
    const [movimientos, setMovimientos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPagoModal, setShowPagoModal] = useState(false);
    const [metodosPago, setMetodosPago] = useState<MetodoPagoDto[]>([]);
    
    // Form Pago
    const [monto, setMonto] = useState<string>('');
    const [metodoPagoId, setMetodoPagoId] = useState('');
    const [notas, setNotas] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, [clienteId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [movs, metodos] = await Promise.all([
                clientesApi.getMovimientosCC(clienteId),
                posApi.obtenerMetodosPago()
            ]);
            setMovimientos(movs);
            setMetodosPago(metodos);
            if (metodos.length > 0) setMetodoPagoId(metodos[0].id);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegistrarPago = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) return;
        
        setSaving(true);
        try {
            await clientesApi.registrarPagoCC({
                clienteId,
                monto: Number(monto),
                metodoPagoId,
                notas: notas.trim()
            });
            setShowPagoModal(false);
            setMonto('');
            setNotas('');
            loadData();
            if (onUpdate) onUpdate();
        } catch (error) {
            alert("Error al registrar el pago.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando cuenta corriente...</div>;

    const totalDeuda = movimientos.reduce((acc, m) => acc + (m.tipo === 'Egreso' ? m.monto : -m.monto), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: totalDeuda > 0 ? '#fef2f2' : '#f0fdf4', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid', borderColor: totalDeuda > 0 ? '#fca5a5' : '#bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <Wallet size={24} color={totalDeuda > 0 ? "#dc2626" : "#16a34a"} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Estado de Cuenta</p>
                        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold', color: totalDeuda > 0 ? "#dc2626" : "#16a34a" }}>
                            {totalDeuda > 0 ? `Deuda: $${totalDeuda.toLocaleString('es-AR')}` : `A Favor: $${Math.abs(totalDeuda).toLocaleString('es-AR')}`}
                        </h2>
                    </div>
                </div>
                <button 
                    onClick={() => setShowPagoModal(true)}
                    style={{ padding: '0.75rem 1.5rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                >
                    <PlusCircle size={20} weight="fill" /> Registrar Cobro / Pago
                </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>FECHA</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>DESCRIPCIÓN</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>MÉTODO</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>MONTO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movimientos.map((m, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#334155' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <CalendarBlank size={16} color="#94a3b8" />
                                        {new Date(m.fecha).toLocaleDateString('es-AR')}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#334155' }}>
                                    <div style={{ fontWeight: 500 }}>{m.descripcion}</div>
                                    {m.notas && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>{m.notas}</div>}
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                    <span style={{ padding: '0.25rem 0.5rem', backgroundColor: '#f1f5f9', borderRadius: '1rem', color: '#475569' }}>
                                        {m.metodoPagoNombre || '-'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontSize: '1rem', fontWeight: 600, color: m.tipo === 'Egreso' ? '#dc2626' : '#16a34a' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                        {m.tipo === 'Egreso' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                        ${m.monto.toLocaleString('es-AR')}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {movimientos.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        No hay movimientos registrados en la cuenta corriente.
                    </div>
                )}
            </div>

            {/* Modal Registro de Pago */}
            {showPagoModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>Registrar Cobro</h2>
                        <form onSubmit={handleRegistrarPago} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Monto a Cobrar ($)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    required 
                                    value={monto} 
                                    onChange={e => setMonto(e.target.value)} 
                                    autoFocus
                                    placeholder="0.00"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1.25rem', fontWeight: 'bold' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Método de Pago</label>
                                <select 
                                    value={metodoPagoId} 
                                    onChange={e => setMetodoPagoId(e.target.value)} 
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                                >
                                    {metodosPago.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Notas (opcional)</label>
                                <textarea 
                                    value={notas} 
                                    onChange={e => setNotas(e.target.value)} 
                                    placeholder="Ej: Transferencia Banco Nación, nro operacion..."
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', height: '80px', resize: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowPagoModal(false)} style={{ flex: 1, padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', backgroundColor: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" disabled={saving} style={{ flex: 2, padding: '0.75rem', border: 'none', borderRadius: '0.5rem', backgroundColor: '#16a34a', color: 'white', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                                    {saving ? 'Procesando...' : 'Confirmar Cobro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
