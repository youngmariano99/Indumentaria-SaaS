import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CaretLeft, ShoppingBag, Money, CalendarBlank, UserGear } from '@phosphor-icons/react';
import { clientesApi } from './api/clientesApi';
import type { Cliente360Dto } from './api/clientesApi';

export function PerfilClientePage() {
    const { id } = useParams<{ id: string }>();
    const [cliente, setCliente] = useState<Cliente360Dto | null>(null);
    const [loading, setLoading] = useState(true);

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
        } catch (error) {
            console.error('Error al cargar perfil 360:', error);
            alert("No se pudo cargar el perfil del cliente.");
        } finally {
            setLoading(false);
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                            {cliente.nombre}
                        </h1>
                        <p style={{ margin: '0.25rem 0 0', color: '#4b5563' }}>Documento: {cliente.documento || 'No registrado'} • Email: {cliente.email || 'Sin Especificar'}</p>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
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
        </div>
    );
}
