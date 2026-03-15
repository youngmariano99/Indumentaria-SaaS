import { useState, useEffect } from 'react';
import { Plus, MagnifyingGlass, Funnel, DotsThreeVertical, UserPlus, AddressBook } from "@phosphor-icons/react";
import styles from './ProveedoresPage.module.css';
import { Link } from 'react-router-dom';
import { providersApi } from './api/providersApi';
import type { ProviderDto } from './api/providersApi';
import { ProveedorFormModal } from './components/ProveedorFormModal';
import { Button } from '../../shared/components/Button';
import { EmptyState } from '../../shared/components/EmptyState';

export function ProveedoresPage() {
    const [search, setSearch] = useState("");
    const [proveedores, setProveedores] = useState<ProviderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const loadProviders = async () => {
        setLoading(true);
        try {
            const data = await providersApi.getProviders(search);
            setProveedores(data);
        } catch (error) {
            console.error("Error cargando proveedores", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadProviders();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Módulo de Proveedores</h1>
                    <p className={styles.subtitle}>Gestión de abastecimiento y cuentas por pagar.</p>
                </div>
                <div className={styles.headerActions}>
                    <Button variant="outline" onClick={() => setShowModal(true)} icon={<UserPlus size={18} weight="bold" />}>
                        Nuevo Proveedor
                    </Button>
                    <Link to="/proveedores/carga-factura">
                        <Button variant="primary" icon={<Plus size={18} weight="bold" />} educational>
                            Cargar Factura
                        </Button>
                    </Link>
                </div>
            </header>

            {proveedores.length > 0 && (
                <section className={styles.stats}>
                    <div className={styles.cardStat}>
                        <span className={styles.cardStatLabel}>Deuda Total</span>
                        <span className={`${styles.cardStatValue} ${styles.textDanger}`}>
                            ${proveedores.filter(p => p.saldo < 0).reduce((acc, p) => acc + Math.abs(p.saldo), 0).toLocaleString('es-AR')}
                        </span>
                    </div>
                    <div className={styles.cardStat}>
                        <span className={styles.cardStatLabel}>Saldo a Favor</span>
                        <span className={`${styles.cardStatValue} ${styles.textSuccess}`}>
                            ${proveedores.filter(p => p.saldo > 0).reduce((acc, p) => acc + p.saldo, 0).toLocaleString('es-AR')}
                        </span>
                    </div>
                    <div className={styles.cardStat}>
                        <span className={styles.cardStatLabel}>Proveedores Activos</span>
                        <span className={styles.cardStatValue}>{proveedores.length}</span>
                    </div>
                </section>
            )}

            <div className={styles.content}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBar}>
                        <MagnifyingGlass size={20} />
                        <input 
                            type="text" 
                            placeholder="Buscar por razon social, CUIT..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="secondary" icon={<Funnel size={18} />}>
                        Filtros
                    </Button>
                </div>

                {loading ? (
                    <div className={styles.loading}>Cargando proveedores...</div>
                ) : (
                    <>
                        {proveedores.length > 0 ? (
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Proveedor</th>
                                            <th>CUIT</th>
                                            <th>Contacto</th>
                                            <th>Saldo</th>
                                            <th style={{ width: 50 }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {proveedores.map(p => (
                                            <tr key={p.id}>
                                                <td>
                                                    <div className={styles.providerInfo}>
                                                        <span className={styles.providerName}>{p.razonSocial}</span>
                                                        <span className={styles.muted}>{p.direccion}</span>
                                                    </div>
                                                </td>
                                                <td>{p.documento}</td>
                                                <td>
                                                    <div className={styles.contactInfo}>
                                                        <span>{p.email}</span>
                                                        <span className={styles.muted}>{p.telefono}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={p.saldo < 0 ? styles.textDanger : p.saldo > 0 ? styles.textSuccess : ""}>
                                                        {p.saldo < 0 ? `- $${Math.abs(p.saldo).toLocaleString('es-AR')}` : `$${p.saldo.toLocaleString('es-AR')}`}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className={styles.btnIcon}>
                                                        <DotsThreeVertical size={20} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState 
                                illustration={<AddressBook size={80} weight="thin" />}
                                title="No tenés proveedores registrados"
                                description="Registrar a tus proveedores te permite llevar un control de cuentas corrientes y actualizar stock automáticamente al cargar facturas."
                                educationalTip="Podés agrupar varios productos en una sola factura de proveedor para ahorrar tiempo."
                                actionLabel="Registrar mi primer Proveedor"
                                onAction={() => setShowModal(true)}
                            />
                        )}
                    </>
                )}
            </div>

            {showModal && (
                <ProveedorFormModal 
                    onClose={() => setShowModal(false)} 
                    onSuccess={loadProviders} 
                />
            )}
        </div>
    );
}
