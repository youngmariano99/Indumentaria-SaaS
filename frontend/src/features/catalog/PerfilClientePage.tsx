import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CaretLeft, ShoppingBag, Money, CalendarBlank, UserGear, Wallet, WhatsappLogo, PlusCircle, MinusCircle } from '@phosphor-icons/react';
import { clientesApi } from './api/clientesApi';
import type { Cliente360Dto } from './api/clientesApi';
import { posApi, type MetodoPagoDto } from '../pos/api/posApi';

export function PerfilClientePage({ clientIdProp, onCloseModal }: { clientIdProp?: string, onCloseModal?: () => void }) {
    const { id } = useParams<{ id: string }>();
    const effectiveId = clientIdProp || id;
    const [cliente, setCliente] = useState<Cliente360Dto | null>(null);
    const [loading, setLoading] = useState(true);

    // Estado Saldo
    const [showSaldoModal, setShowSaldoModal] = useState(false);
    const [montoSaldo, setMontoSaldo] = useState<number | string>('');
    const [descripcionSaldo, setDescripcionSaldo] = useState('');
    const [operacionSaldo, setOperacionSaldo] = useState<'sumar' | 'restar'>('sumar');
    const [savingSaldo, setSavingSaldo] = useState(false);
    const [metodosPago, setMetodosPago] = useState<MetodoPagoDto[]>([]);
    const [metodoPagoId, setMetodoPagoId] = useState('');

    // Estado Detalles de Transacción y Paginación
    const [detalleTxSeleccionada, setDetalleTxSeleccionada] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const condicionIvaLabels: Record<number, string> = {
        0: 'Consumidor Final',
        1: 'Responsable Inscripto',
        2: 'Monotributista',
        3: 'Exento',
        4: 'No Categorizado'
    };

    useEffect(() => {
        if (effectiveId) {
            loadPerfil(effectiveId);
        }
        loadMetodosPago();
    }, [effectiveId]);

    const loadMetodosPago = async () => {
        try {
            const data = await posApi.obtenerMetodosPago();
            setMetodosPago(data);
            if (data.length > 0) setMetodoPagoId(data[0].id);
        } catch (error) {
            console.error('Error al cargar métodos de pago:', error);
        }
    };

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

    const historialFiltrado = (cliente?.historialTransacciones || []).filter(tx => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (tx.descripcion && tx.descripcion.toLowerCase().includes(term)) ||
            (tx.tipo && tx.tipo.toLowerCase().includes(term)) ||
            tx.montoTotal.toString().includes(term) ||
            new Date(tx.fecha).toLocaleDateString('es-AR').includes(term);
    });

    const totalPages = Math.ceil(historialFiltrado.length / itemsPerPage);
    const paginatedHistorial = historialFiltrado.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleProcesarSaldo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cliente || !montoSaldo || isNaN(Number(montoSaldo)) || Number(montoSaldo) <= 0 || !descripcionSaldo.trim()) {
            alert('Por favor ingrese un monto válido y un motivo.');
            return;
        }

        setSavingSaldo(true);
        try {
            if (operacionSaldo === 'sumar') {
                await clientesApi.agregarSaldo(cliente.id, Number(montoSaldo), descripcionSaldo, metodoPagoId);
            } else {
                await clientesApi.descontarSaldo(cliente.id, Number(montoSaldo), descripcionSaldo, metodoPagoId);
            }
            alert(`Saldo ${operacionSaldo === 'sumar' ? 'agregado' : 'descontado'} correctamente.`);
            setShowSaldoModal(false);
            setMontoSaldo('');
            setDescripcionSaldo('');
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
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: clientIdProp ? '0' : '1.5rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                {!clientIdProp && (
                    <Link to="/clientes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#6b7280', textDecoration: 'none', marginBottom: '1rem', fontWeight: 500 }}>
                        <CaretLeft size={16} weight="bold" /> Volver a Clientes
                    </Link>
                )}
                {clientIdProp && onCloseModal && (
                    <button onClick={onCloseModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1rem', fontWeight: 500, padding: 0 }}>
                        <CaretLeft size={16} weight="bold" /> Volver
                    </button>
                )}
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
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: cliente.saldoAFavor >= 0 ? '#f0fdf4' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Wallet size={24} color={cliente.saldoAFavor >= 0 ? "#16a34a" : "#dc2626"} />
                        </div>
                        <div>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>{cliente.saldoAFavor >= 0 ? 'Saldo a Favor' : 'Saldo Deudor / En Contra'}</p>
                            <h3 style={{ margin: 0, color: cliente.saldoAFavor >= 0 ? '#16a34a' : '#dc2626', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                ${Math.abs(cliente.saldoAFavor ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                        <button
                            onClick={() => { setOperacionSaldo('sumar'); setMontoSaldo(''); setDescripcionSaldo(''); setShowSaldoModal(true); }}
                            style={{ flex: 1, padding: '0.5rem', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}
                            title="Ingresar dinero a la cuenta del cliente"
                        >
                            <PlusCircle size={16} /> Sumar
                        </button>
                        <button
                            onClick={() => { setOperacionSaldo('restar'); setMontoSaldo(''); setDescripcionSaldo(''); setShowSaldoModal(true); }}
                            style={{ flex: 1, padding: '0.5rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}
                            title="Descontar o registrar un cobro no pagado (fiado)"
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

                {/* Historial Unificado de Transacciones (Ventas y Billetera) */}
                <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#111827' }}>Historial de Movimientos</h2>
                        <input
                            type="text"
                            placeholder="Buscar ticket, tipo o monto..."
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem', fontSize: '0.875rem', width: '250px' }}
                        />
                    </div>
                    {historialFiltrado.length === 0 ? (
                        <p style={{ color: '#6b7280' }}>
                            {searchTerm ? 'No hay resultados para la búsqueda.' : 'No existen movimientos registrados para este cliente aún.'}
                        </p>
                    ) : (
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflowX: 'auto', width: '100%' }}>
                            <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    <tr>
                                        <th style={{ padding: '0.75rem 1rem', color: '#374151', fontWeight: 500, fontSize: '0.875rem' }}>Fecha</th>
                                        <th style={{ padding: '0.75rem 1rem', color: '#374151', fontWeight: 500, fontSize: '0.875rem' }}>Tipo</th>
                                        <th style={{ padding: '0.75rem 1rem', color: '#374151', fontWeight: 500, fontSize: '0.875rem' }}>Descripción / Referencia</th>
                                        <th style={{ padding: '0.75rem 1rem', color: '#374151', fontWeight: 500, fontSize: '0.875rem', textAlign: 'right' }}>Total</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedHistorial.map((tx, idx) => (
                                        <tr key={tx.id} style={{ borderBottom: idx < paginatedHistorial.length - 1 ? '1px solid #e5e7eb' : 'none', backgroundColor: tx.tipo === 'Venta' ? '#ffffff' : '#f8fafc' }}>
                                            <td style={{ padding: '0.75rem 1rem', color: '#4b5563', fontSize: '0.875rem' }}>
                                                {new Date(tx.fecha).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', color: '#4b5563', fontSize: '0.875rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    backgroundColor: tx.tipo === 'Venta' ? '#eff6ff' : (tx.tipo === 'Ingreso de Saldo' ? '#dcfce7' : '#fee2e2'),
                                                    color: tx.tipo === 'Venta' ? '#1d4ed8' : (tx.tipo === 'Ingreso de Saldo' ? '#166534' : '#991b1b')
                                                }}>
                                                    {tx.tipo}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', color: '#4b5563', fontSize: '0.875rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {tx.descripcion || '-'}
                                                {tx.tipo === 'Venta' && tx.detalles && (
                                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                                        {tx.detalles.length} artículo(s)
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', color: '#111827', fontWeight: 500, fontSize: '0.875rem', textAlign: 'right' }}>
                                                <span style={{ color: tx.tipo === 'Egreso de Saldo' ? '#dc2626' : (tx.tipo === 'Ingreso de Saldo' ? '#16a34a' : '#111827') }}>
                                                    {tx.tipo === 'Ingreso de Saldo' ? '+' : (tx.tipo === 'Egreso de Saldo' ? '-' : '')}${tx.montoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                                {tx.tipo === 'Venta' && (
                                                    <button
                                                        onClick={() => setDetalleTxSeleccionada(tx)}
                                                        style={{
                                                            background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer',
                                                            fontSize: '0.75rem', fontWeight: 500, textDecoration: 'underline'
                                                        }}
                                                    >
                                                        Ver Detalles
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Control de Paginación */}
                            {totalPages > 1 && (
                                <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' }}>
                                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                        Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, historialFiltrado.length)} de {historialFiltrado.length} movimientos
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            style={{ padding: '0.25rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white', color: currentPage === 1 ? '#9ca3af' : '#374151', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            style={{ padding: '0.25rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white', color: currentPage === totalPages ? '#9ca3af' : '#374151', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </div>
                            )}
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
                                    value={montoSaldo}
                                    onChange={e => setMontoSaldo(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                    placeholder="Ej: 1500.00"
                                />
                                <label style={{ display: 'block', margin: '1rem 0 0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Motivo / Descripción</label>
                                <input
                                    type="text"
                                    required
                                    value={descripcionSaldo}
                                    onChange={e => setDescripcionSaldo(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                    placeholder="Ej: Ajuste manual, Devolución, etc."
                                />

                                <label style={{ display: 'block', margin: '1rem 0 0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Método de Pago</label>
                                <select
                                    value={metodoPagoId}
                                    onChange={e => setMetodoPagoId(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: 'white' }}
                                >
                                    <option value="">Seleccione un método...</option>
                                    {metodosPago.map(m => (
                                        <option key={m.id} value={m.id}>{m.nombre}</option>
                                    ))}
                                </select>

                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                                    {operacionSaldo === 'sumar'
                                        ? 'Se sumará al favor del cliente (Ingreso de caja).'
                                        : 'Se restará (Salida de caja / Pago realizado).'}
                                </p>
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

            {/* Modal Detalles de Venta */}
            {detalleTxSeleccionada && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '1rem' }}>
                    <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.75rem', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: '0.75rem 0.75rem 0 0' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: 0 }}>Ticket de Compra</h2>
                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                                    {detalleTxSeleccionada.descripcion} • {new Date(detalleTxSeleccionada.fecha).toLocaleString()}
                                </p>
                            </div>
                            <button onClick={() => setDetalleTxSeleccionada(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af', padding: 0, lineHeight: 1 }}>&times;</button>
                        </div>
                        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {detalleTxSeleccionada.detalles?.map((item: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: i < detalleTxSeleccionada.detalles.length - 1 ? '1px dashed #e5e7eb' : 'none' }}>
                                        <div>
                                            <p style={{ margin: '0 0 0.25rem', fontWeight: 500, color: '#111827', fontSize: '0.875rem' }}>{item.productoNombre}</p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
                                                Variante: <span style={{ color: '#4b5563', fontWeight: 500 }}>{item.varianteNombre}</span> • Cantidad: {item.cantidad}
                                            </p>
                                            {item.posibleDevolucion && (
                                                <span style={{ display: 'inline-block', marginTop: '0.35rem', padding: '0.15rem 0.4rem', backgroundColor: '#fef3c7', color: '#d97706', fontSize: '0.65rem', borderRadius: '0.25rem', fontWeight: 600 }}>Posible Devolución Marcada</span>
                                            )}
                                        </div>
                                        <div style={{ textAlign: 'right', fontWeight: 500, color: '#111827', fontSize: '0.875rem' }}>
                                            ${(item.precioUnitario * item.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', borderRadius: '0 0 0.75rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 500, color: '#4b5563' }}>Total Abonado</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1d4ed8' }}>
                                ${detalleTxSeleccionada.montoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
