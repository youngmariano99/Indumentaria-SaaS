import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CaretLeft, ShoppingBag, Money, CalendarBlank, UserGear, Wallet, WhatsappLogo, PlusCircle, MinusCircle } from '@phosphor-icons/react';
import { clientesApi } from './api/clientesApi';
import type { Cliente360Dto } from './api/clientesApi';

export function PerfilClientePage() {
    const { id } = useParams<{ id: string }>();
    const [cliente, setCliente] = useState<Cliente360Dto | null>(null);
    const [loading, setLoading] = useState(true);

    // Estado Saldo
    const [showSaldoModal, setShowSaldoModal] = useState(false);
    const [montoSaldo, setMontoSaldo] = useState<number | string>('');
    const [operacionSaldo, setOperacionSaldo] = useState<'sumar' | 'restar'>('sumar');
    const [savingSaldo, setSavingSaldo] = useState(false);

    const condicionIvaLabels: Record<number, string> = {
        0: 'Consumidor Final',
        1: 'Responsable Inscripto',
        2: 'Monotributista',
        3: 'Exento',
        4: 'No Categorizado'
    };

    useEffect(() => {
        if (id) {
            loadPerfil(id);
        }
    }, [id]);

    const loadPerfil = async (clienteId: string) => {
        setLoading(true);
        try {
            const data = await clientesApi.getPerfil360(clienteId);
            setCliente(data);
        } catch (error: any) {
            console.error('Error al cargar perfil 360:', error);
            const errMsg = error.response?.data?.detalle || error.response?.data?.mensaje || error.message;
            alert(`No se pudo cargar el perfil del cliente.\n\nDetalle: ${errMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleProcesarSaldo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cliente || !montoSaldo || isNaN(Number(montoSaldo)) || Number(montoSaldo) <= 0) return;

        setSavingSaldo(true);
        try {
            if (operacionSaldo === 'sumar') {
                await clientesApi.agregarSaldo(cliente.id, Number(montoSaldo));
            } else {
                await clientesApi.descontarSaldo(cliente.id, Number(montoSaldo));
            }
            alert(`Saldo ${operacionSaldo === 'sumar' ? 'agregado' : 'descontado'} correctamente.`);
            setShowSaldoModal(false);
            setMontoSaldo('');
            loadPerfil(cliente.id); // Recargar
        } catch (error: any) {
            console.error('Error al procesar saldo:', error);
            const errMsg = error.response?.data || error.message;
            alert(`No se pudo procesar el saldo.\n\nDetalle: ${JSON.stringify(errMsg)}`);
        } finally {
            setSavingSaldo(false);
        }
    };

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Cargando Perfil 360...</div>;
    if (!cliente) return <div style={{ padding: '3rem', textAlign: 'center' }}>Cliente no encontrado.</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <Link to="/clientes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#6b7280', textDecoration: 'none', marginBottom: '1rem', fontWeight: 500 }}>
                    <CaretLeft size={16} weight="bold" /> Volver a Clientes
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {cliente.nombre}
                            {cliente.telefono && (
                                <a
                                    href={`https://wa.me/${cliente.telefono.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#25D366', color: 'white', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', textDecoration: 'none', gap: '0.35rem', fontWeight: 600 }}
                                    title="Contactar vía WhatsApp"
                                >
                                    <WhatsappLogo size={18} weight="fill" /> WhatsApp
                                </a>
                            )}
                        </h1>
                        <p style={{ margin: '0.25rem 0 0', color: '#4b5563' }}>Documento: {cliente.documento || 'No registrado'} • Email: {cliente.email || 'Sin Especificar'}</p>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Saldo a Favor / Billetera */}
                <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', gridColumn: 'span 1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Wallet size={24} color="#16a34a" />
                        </div>
                        <div>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Billetera Digital</p>
                            <h3 style={{ margin: 0, color: '#16a34a', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                ${cliente.saldoAFavor != null ? cliente.saldoAFavor.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '0,00'}
                            </h3>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                        <button
                            onClick={() => { setOperacionSaldo('sumar'); setMontoSaldo(''); setShowSaldoModal(true); }}
                            style={{ flex: 1, padding: '0.5rem', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}
                        >
                            <PlusCircle size={16} /> Cargar
                        </button>
                        <button
                            onClick={() => { setOperacionSaldo('restar'); setMontoSaldo(''); setShowSaldoModal(true); }}
                            disabled={!cliente.saldoAFavor || cliente.saldoAFavor <= 0}
                            style={{ flex: 1, padding: '0.5rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.375rem', cursor: (!cliente.saldoAFavor || cliente.saldoAFavor <= 0) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 500, opacity: (!cliente.saldoAFavor || cliente.saldoAFavor <= 0) ? 0.5 : 1 }}
                        >
                            <MinusCircle size={16} /> Restar
                        </button>
                    </div>
                </div>

                {/* Métricas Principales */}
                <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Money size={24} color="#059669" />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Total Gastado</p>
                        <h3 style={{ margin: 0, color: '#111827', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            ${cliente.totalGastadoHistorico.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                </div>

                <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={24} color="#2563eb" />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Compras Realizadas</p>
                        <h3 style={{ margin: 0, color: '#111827', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {cliente.cantidadComprasHistoricas} tickets
                        </h3>
                    </div>
                </div>

                <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CalendarBlank size={24} color="#dc2626" />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Última Visita</p>
                        <h3 style={{ margin: 0, color: '#111827', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {cliente.fechaUltimaCompra ? new Date(cliente.fechaUltimaCompra).toLocaleDateString() : 'Nunca'}
                        </h3>
                    </div>
                </div>

                <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserGear size={24} color="#d97706" />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Ticket Promedio</p>
                        <h3 style={{ margin: 0, color: '#111827', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            ${cliente.ticketPromedio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '1.5rem' }}>
                {/* Datos CRM Fijos */}
                <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 1rem', color: '#111827' }}>Información de Contacto</h2>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li><strong>Teléfono:</strong> {cliente.telefono || '-'}</li>
                        <li><strong>Dirección:</strong> {cliente.direccion || '-'}</li>
                        <li><strong>Condición IVA:</strong> {cliente.condicionIva != null ? condicionIvaLabels[cliente.condicionIva] : '-'}</li>
                        <li><strong>Alta Cliente:</strong> -</li>
                    </ul>
                </div>

                {/* Historial de Compras (Grid/List) */}
                <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 1rem', color: '#111827' }}>Historial de Transacciones (Últimas 10)</h2>
                    {cliente.comprasRecientes.length === 0 ? (
                        <p style={{ color: '#6b7280' }}>No hay ventas registradas para este cliente aún.</p>
                    ) : (
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    <tr>
                                        <th style={{ padding: '0.75rem 1rem', color: '#374151', fontWeight: 500, fontSize: '0.875rem' }}>Fecha</th>
                                        <th style={{ padding: '0.75rem 1rem', color: '#374151', fontWeight: 500, fontSize: '0.875rem' }}>Ticket</th>
                                        <th style={{ padding: '0.75rem 1rem', color: '#374151', fontWeight: 500, fontSize: '0.875rem', textAlign: 'right' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cliente.comprasRecientes.map((compra, idx) => (
                                        <tr key={compra.ventaId} style={{ borderBottom: idx < cliente.comprasRecientes.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                                            <td style={{ padding: '0.75rem 1rem', color: '#4b5563', fontSize: '0.875rem' }}>
                                                {new Date(compra.fecha).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', color: '#4b5563', fontSize: '0.875rem' }}>
                                                {compra.identificadorTicket || 'N/A'}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', color: '#111827', fontWeight: 500, fontSize: '0.875rem', textAlign: 'right' }}>
                                                ${compra.montoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Saldo */}
            {showSaldoModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', width: '100%', maxWidth: '400px' }}>
                        <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem' }}>
                            {operacionSaldo === 'sumar' ? 'Cargar Saldo a Favor' : 'Descontar Saldo'}
                        </h2>
                        <form onSubmit={handleProcesarSaldo}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Monto ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    min="0.01"
                                    max={operacionSaldo === 'restar' ? cliente?.saldoAFavor : undefined}
                                    value={montoSaldo}
                                    onChange={e => setMontoSaldo(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                    placeholder="Ej: 1500.00"
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowSaldoModal(false)}
                                    style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', backgroundColor: 'white', borderRadius: '0.375rem', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSaldo}
                                    style={{ padding: '0.5rem 1rem', border: 'none', backgroundColor: operacionSaldo === 'sumar' ? '#16a34a' : '#dc2626', color: 'white', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500 }}
                                >
                                    {savingSaldo ? 'Procesando...' : (operacionSaldo === 'sumar' ? 'Sumar Saldo' : 'Restar Saldo')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
