import { useState, useEffect } from 'react';
import { Plus, Trash, MagnifyingGlass, UserCircle, PencilLine } from '@phosphor-icons/react';
import { clientesApi } from './api/clientesApi';
import type { ClienteDto, CrearClienteDto } from './api/clientesApi';
import { CondicionIva } from './types';
import { Link } from 'react-router-dom';
import styles from './CategoriasPage.module.css'; // Reuso los estilos modales

export function ClientesPage() {
    // Mapa para mostrar la Condición de IVA legible
    const condicionIvaLabels: Record<number, string> = {
        0: 'Consumidor Final',
        1: 'Responsable Inscripto',
        2: 'Monotributista',
        3: 'Exento',
        4: 'No Categorizado'
    };
    const [clientes, setClientes] = useState<ClienteDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<CrearClienteDto>({
        documento: '',
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        condicionIva: CondicionIva.ConsumidorFinal,
        preferenciasJson: '{}'
    });

    useEffect(() => {
        loadClientes();
    }, []);

    const loadClientes = async () => {
        setLoading(true);
        try {
            const data = await clientesApi.getAll();
            setClientes(data);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await clientesApi.create(formData);
            closeModal();
            loadClientes();
        } catch (error) {
            console.error('Error al crear cliente:', error);
            alert("Error al crear cliente. Posible documento duplicado.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar este cliente?')) return;
        try {
            await clientesApi.delete(id);
            loadClientes();
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            alert("Ocurrió un error al eliminar.");
        }
    };

    const resetForm = () => {
        setFormData({
            documento: '',
            nombre: '',
            email: '',
            telefono: '',
            direccion: '',
            condicionIva: CondicionIva.ConsumidorFinal,
            preferenciasJson: '{}'
        });
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const filteredClientes = clientes.filter(c =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.documento.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
            {/* Cabecera */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Cartera de Clientes</h1>
                    <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Gestioná tus perfiles 360, contacto y datos fiscales.</p>
                </div>
                <button
                    onClick={openModal}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        backgroundColor: '#2563eb', color: 'white', padding: '0.625rem 1rem',
                        borderRadius: '0.5rem', fontWeight: '500', border: 'none', cursor: 'pointer'
                    }}
                >
                    <Plus size={20} />
                    Nuevo Cliente
                </button>
            </div>

            {/* Búsqueda */}
            <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
                <MagnifyingGlass size={20} color="#9ca3af" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, documento o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem',
                        border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none'
                    }}
                />
            </div>

            {/* Grid de clientes */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <div className="spinner">Cargando...</div>
                </div>
            ) : filteredClientes.length === 0 ? (
                <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                    No se encontraron clientes que coincidan con la búsqueda.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {filteredClientes.map((c) => (
                        <div key={c.id} style={{
                            backgroundColor: 'white', border: '1px solid #e5e7eb',
                            borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', flexDirection: 'column'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <UserCircle size={32} color="#9ca3af" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontWeight: '600', color: '#111827' }}>{c.nombre}</h3>
                                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>{c.documento || 'Sin doc.'}</p>
                                </div>
                            </div>

                            <div style={{ flex: 1, fontSize: '0.875rem', color: '#4b5563', marginBottom: '1.25rem' }}>
                                <div style={{ marginBottom: '0.25rem' }}><strong>Email:</strong> {c.email || '-'}</div>
                                <div style={{ marginBottom: '0.25rem' }}><strong>Tel:</strong> {c.telefono || '-'}</div>
                                <div><strong>Cond. IVA:</strong> {c.condicionIva != null ? condicionIvaLabels[c.condicionIva] : '-'}</div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                                <Link
                                    to={`/clientes/${c.id}`}
                                    style={{
                                        flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center',
                                        backgroundColor: '#eff6ff', color: '#1d4ed8', border: 'none',
                                        padding: '0.5rem', borderRadius: '0.25rem', fontWeight: '500',
                                        textDecoration: 'none', transition: 'background-color 0.2s'
                                    }}
                                >
                                    Ver Perfil 360
                                </Link>
                                <button className={styles.btnIcon} style={{ flex: 1 }} title="Editar (En perfil)">
                                    <PencilLine size={18} />
                                </button>
                                <button className={styles.btnIcon} style={{ flex: 1, color: '#dc2626' }} onClick={() => handleDelete(c.id)} title="Eliminar">
                                    <Trash size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Crear */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalHeader}>
                            <h2>Nuevo Cliente</h2>
                            <button onClick={closeModal} className={styles.closeBtn}>&times;</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>Nombre Completo / Razón Social <span style={{ color: 'red' }}>*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label>Documento (DNI/CUIT)</label>
                                        <input
                                            type="text"
                                            value={formData.documento}
                                            onChange={e => setFormData({ ...formData, documento: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label>Teléfono</label>
                                        <input
                                            type="text"
                                            value={formData.telefono}
                                            onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Dirección</label>
                                    <input
                                        type="text"
                                        value={formData.direccion}
                                        onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Condición frente al IVA</label>
                                    <select
                                        value={formData.condicionIva}
                                        onChange={e => setFormData({ ...formData, condicionIva: Number(e.target.value) as CondicionIva })}
                                    >
                                        <option value={CondicionIva.ConsumidorFinal}>Consumidor Final</option>
                                        <option value={CondicionIva.ResponsableInscripto}>Responsable Inscripto</option>
                                        <option value={CondicionIva.Monotributista}>Monotributista</option>
                                        <option value={CondicionIva.Exento}>Exento</option>
                                        <option value={CondicionIva.NoCategorizado}>No Categorizado</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.btnCancel} onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.btnSave}>
                                    Crear Cliente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
