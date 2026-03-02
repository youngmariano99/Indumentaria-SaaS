import { useState, useEffect } from "react";
import { posApi, type ProductoLayerPosDto, type VarianteLayerPosDto } from "../pos/api/posApi";
import { clientesApi, type ClienteDto, type TransaccionHistoricoDto, type CompraRecienteDetalleDto } from "../catalog/api/clientesApi";
import { MagnifyingGlass, Swap, Plus, Minus, Trash, User, CheckCircle } from "@phosphor-icons/react";
import styles from "../pos/PosPage.module.css"; // Reutilizamos CSS del POS

interface DevLineItem {
    id: string; // único en la UI
    productId: string;
    varianteId: string;
    nombre: string;
    variante: string;
    precioUnitario: number;
    cantidad: number;
}

function getVarianteLabel(v: VarianteLayerPosDto): string {
    const talle = (v as any).talle || (v as any).Talle;
    const color = (v as any).color || (v as any).Color;
    const sc = (v as any).sizeColor || (v as any).SizeColor;
    if (talle || color) return `${talle ?? ""} / ${color ?? ""}`.trim();
    return typeof sc === "string" ? sc.trim() : "";
}

export function DevolucionesPage() {
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [productos, setProductos] = useState<ProductoLayerPosDto[]>([]);
    const [clientes, setClientes] = useState<ClienteDto[]>([]);

    // Búsqueda
    const [busqueda, setBusqueda] = useState("");

    // Modal de opciones de Variante (Talle/Color)
    const [productoModal, setProductoModal] = useState<{ prod: ProductoLayerPosDto, type: 'devuelve' | 'lleva' } | null>(null);
    const [modalVariantesPage, setModalVariantesPage] = useState(1);
    const LIMIT_VARIANTES_MODAL = 5;

    const PAGE_SIZE = 20;
    const [paginaActual, setPaginaActual] = useState(1);
    const [verTodasLasVentas, setVerTodasLasVentas] = useState(false);
    const [clienteInput, setClienteInput] = useState("");

    const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState<string>("");

    // Las dos listas
    const [prendasDevueltas, setPrendasDevueltas] = useState<DevLineItem[]>([]);
    const [prendasLlevadas, setPrendasLlevadas] = useState<DevLineItem[]>([]);

    const [procesando, setProcesando] = useState(false);
    const [exitoMsg, setExitoMsg] = useState<string | null>(null);

    const [comprasRecientesCliente, setComprasRecientesCliente] = useState<TransaccionHistoricoDto[]>([]);
    const [fetchingCliente, setFetchingCliente] = useState(false);

    useEffect(() => {
        if (!clienteSeleccionadoId) {
            setComprasRecientesCliente([]);
            return;
        }
        const fetchPerfil = async () => {
            setFetchingCliente(true);
            try {
                const perfil = await clientesApi.getPerfil360(clienteSeleccionadoId);
                setComprasRecientesCliente(perfil.historialTransacciones || []);
            } catch (e) {
                console.error(e);
            } finally {
                setFetchingCliente(false);
            }
        };
        fetchPerfil();
    }, [clienteSeleccionadoId]);

    const agregarDesdeHistorial = (detalle: CompraRecienteDetalleDto) => {
        const newItem: DevLineItem = {
            id: `dev-devuelve-${Date.now()}-${Math.random()}`,
            productId: "00000000-0000-0000-0000-000000000000",
            varianteId: detalle.varianteProductoId,
            nombre: detalle.productoNombre,
            variante: detalle.varianteNombre,
            precioUnitario: detalle.precioUnitario,
            cantidad: 1
        };

        const ex = prendasDevueltas.find(i => i.varianteId === detalle.varianteProductoId);
        if (ex) {
            setPrendasDevueltas(prev => prev.map(i => i.id === ex.id ? { ...i, cantidad: i.cantidad + 1 } : i));
        } else {
            setPrendasDevueltas(prev => [...prev, newItem]);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [catResult, clResult] = await Promise.allSettled([
                    posApi.obtenerCatalogoPos(),
                    clientesApi.getAll(),
                ]);
                if (catResult.status === "fulfilled") {
                    const list = Array.isArray(catResult.value) ? catResult.value : [];
                    setProductos(list); // Suponemos que ya viene flat en el back o usamos un adaptador interno igual que en PosPage.tsx
                }
                if (clResult.status === "fulfilled") {
                    setClientes(clResult.value);
                }
            } catch (e) {
                console.error("Error dev initial", e);
            } finally {
                setLoadingInitial(false);
            }
        };
        fetchInitialData();
    }, []);

    const productosFiltrados = productos.filter((p) => {
        const q = busqueda.trim().toLowerCase();
        if (!q) return true;
        if (p.nombre.toLowerCase().includes(q)) return true;
        return false; // se podria extender a sku/codigo barra
    });

    const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / PAGE_SIZE));
    const indiceInicio = (paginaActual - 1) * PAGE_SIZE;
    const productosPagina = productosFiltrados.slice(indiceInicio, indiceInicio + PAGE_SIZE);

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda]);

    const agregarLista = (prod: ProductoLayerPosDto, variante: VarianteLayerPosDto, tipo: 'devuelve' | 'lleva') => {
        const newItem: DevLineItem = {
            id: `dev-${tipo}-${Date.now()}-${Math.random()}`,
            productId: prod.id,
            varianteId: variante.varianteId,
            nombre: prod.nombre,
            variante: getVarianteLabel(variante),
            precioUnitario: prod.precioBase,
            cantidad: 1
        };

        if (tipo === 'devuelve') {
            const ex = prendasDevueltas.find(i => i.varianteId === variante.varianteId);
            if (ex) {
                setPrendasDevueltas(prev => prev.map(i => i.id === ex.id ? { ...i, cantidad: i.cantidad + 1 } : i));
            } else {
                setPrendasDevueltas(prev => [...prev, newItem]);
            }
        } else {
            const ex = prendasLlevadas.find(i => i.varianteId === variante.varianteId);
            if (ex) {
                setPrendasLlevadas(prev => prev.map(i => i.id === ex.id ? { ...i, cantidad: i.cantidad + 1 } : i));
            } else {
                setPrendasLlevadas(prev => [...prev, newItem]);
            }
        }
    };

    const seleccionarProducto = (prod: ProductoLayerPosDto, tipo: 'devuelve' | 'lleva') => {
        if (!prod.variantes || prod.variantes.length === 0) return;
        if (prod.variantes.length === 1) {
            agregarLista(prod, prod.variantes[0], tipo);
        } else {
            setProductoModal({ prod, type: tipo });
            setModalVariantesPage(1);
        }
    };

    const quitarLinea = (id: string, tipo: 'devuelve' | 'lleva') => {
        if (tipo === 'devuelve') setPrendasDevueltas(prev => prev.filter(i => i.id !== id));
        else setPrendasLlevadas(prev => prev.filter(i => i.id !== id));
    };

    const modificarCantidad = (id: string, delta: number, tipo: 'devuelve' | 'lleva') => {
        if (tipo === 'devuelve') {
            setPrendasDevueltas(prev => prev.map(i => i.id === id ? { ...i, cantidad: Math.max(0, i.cantidad + delta) } : i).filter(i => i.cantidad > 0));
        } else {
            setPrendasLlevadas(prev => prev.map(i => i.id === id ? { ...i, cantidad: Math.max(0, i.cantidad + delta) } : i).filter(i => i.cantidad > 0));
        }
    };

    const totalDevuelve = prendasDevueltas.reduce((acc, i) => acc + (i.precioUnitario * i.cantidad), 0);
    const totalLleva = prendasLlevadas.reduce((acc, i) => acc + (i.precioUnitario * i.cantidad), 0);
    const diferencia = totalDevuelve - totalLleva;

    const handleSubmit = async () => {
        if (!clienteSeleccionadoId) {
            alert("Es obligatorio seleccionar un cliente para asentar la devolución a cuenta corriente.");
            return;
        }
        if (prendasDevueltas.length === 0 && prendasLlevadas.length === 0) return;

        setProcesando(true);
        try {
            const payload = {
                clienteId: clienteSeleccionadoId,
                variantesDevueltas: prendasDevueltas.map(i => ({ varianteProductoId: i.varianteId, cantidad: i.cantidad })),
                variantesLlevadas: prendasLlevadas.map(i => ({ varianteProductoId: i.varianteId, cantidad: i.cantidad }))
            };

            const res = await posApi.procesarDevolucion(payload);
            setExitoMsg(res.mensaje);
            setPrendasDevueltas([]);
            setPrendasLlevadas([]);
            setBusqueda("");

            setTimeout(() => setExitoMsg(null), 5000);
        } catch (e: any) {
            alert(e.response?.data?.message || "Error al procesar la devolución.");
        } finally {
            setProcesando(false);
        }
    };

    if (loadingInitial) return <div style={{ padding: '2rem' }}>Cargando Catálogo de Devoluciones...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <header style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Swap size={28} /> Cambios y Devoluciones</h1>
                <p style={{ color: '#6b7280', margin: 0 }}>Registrá prendas que entran al local y, opcionalmente, prendas que salen por cambio directo.</p>
            </header>

            <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>

                {/* PANEL IZQUIERDO: Buscador General */}
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', gap: '0.5rem' }}>
                            <MagnifyingGlass size={20} color="#9ca3af" />
                            <input
                                type="search"
                                placeholder="Buscar prenda (catálogo general)..."
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* SECCIÓN DEL HISTORIAL DEL CLIENTE (Si hay cliente seleccionado y tiene compras) */}
                        {clienteSeleccionadoId && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Compras Recientes del Cliente {fetchingCliente && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>(Cargando...)</span>}</span>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={verTodasLasVentas} onChange={e => setVerTodasLasVentas(e.target.checked)} />
                                        Ver todas las ventas
                                    </label>
                                </h3>
                                {(() => {
                                    let historial = comprasRecientesCliente
                                        .filter(c => c.tipo === 'Venta' && c.detalles && c.detalles.length > 0)
                                        .flatMap(c => c.detalles!.map((d: any) => ({ ...d, fechaCompra: c.fecha })));
                                    const hayPosibles = historial.some(d => d.posibleDevolucion);
                                    if (!verTodasLasVentas && hayPosibles) {
                                        historial = historial.filter(d => d.posibleDevolucion);
                                    }

                                    if (historial.length === 0 && !fetchingCliente) {
                                        return <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>No hay historial reciente para este cliente o no hay prendas marcadas como posible devolución.</p>;
                                    }

                                    return (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                                            {historial.slice(0, 15).map((d, idx) => (
                                                <div key={`hist-${idx}`} style={{ border: '1px solid #dbeafe', backgroundColor: '#eff6ff', borderRadius: '0.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0.75rem' }}>
                                                    <div style={{ marginBottom: '0.5rem' }}>
                                                        <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: '#1e3a8a' }}>{d.productoNombre}</h4>
                                                        <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>Talle/Color: {d.varianteNombre || "Única"}</p>
                                                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#60a5fa' }}>Comprado el {new Date(d.fechaCompra).toLocaleDateString()}</p>
                                                        {d.posibleDevolucion && <span style={{ display: 'inline-block', backgroundColor: '#dcfce7', color: '#166534', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.65rem', marginBottom: '0.5rem', fontWeight: 600 }}>🌟 Posible Cambio</span>}
                                                    </div>
                                                    <button
                                                        onClick={() => agregarDesdeHistorial(d)}
                                                        style={{ marginTop: 'auto', padding: '0.35rem', fontSize: '0.75rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 600 }}
                                                    >
                                                        Devolver Prenda
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* SECCIÓN DEL CATÁLOGO GENERAL */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>Catálogo General</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', alignContent: 'start' }}>
                                {productosPagina.map(p => (
                                    <div key={p.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ backgroundColor: '#f3f4f6', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>
                                            Sin Imagen
                                        </div>
                                        <div style={{ padding: '0.75rem', flex: 1 }}>
                                            <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: '#111827' }}>{p.nombre}</h4>
                                            <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>${p.precioBase?.toLocaleString("es-AR")}</p>

                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => seleccionarProducto(p, 'devuelve')}
                                                    style={{ flex: 1, padding: '0.25rem', fontSize: '0.7rem', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 600 }}
                                                >
                                                    + Devuelve
                                                </button>
                                                <button
                                                    onClick={() => seleccionarProducto(p, 'lleva')}
                                                    style={{ flex: 1, padding: '0.25rem', fontSize: '0.7rem', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 600 }}
                                                >
                                                    + Se Lleva
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {totalPaginas > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                                    <button
                                        disabled={paginaActual <= 1}
                                        onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                                        style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white', cursor: paginaActual <= 1 ? 'not-allowed' : 'pointer', opacity: paginaActual <= 1 ? 0.5 : 1 }}
                                    >
                                        Anterior
                                    </button>
                                    <span style={{ alignSelf: 'center', fontSize: '0.875rem' }}>
                                        Página {paginaActual} de {totalPaginas}
                                    </span>
                                    <button
                                        disabled={paginaActual >= totalPaginas}
                                        onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                                        style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white', cursor: paginaActual >= totalPaginas ? 'not-allowed' : 'pointer', opacity: paginaActual >= totalPaginas ? 0.5 : 1 }}
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* PANEL DERECHO: Resumen de Transacción */}
                <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1.25rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                            <User size={18} /> Cliente (Obligatorio)
                        </label>
                        <input
                            type="text"
                            list="lista-clientes-dev"
                            placeholder="Buscar por nombre o doc..."
                            value={clienteInput}
                            onChange={e => {
                                setClienteInput(e.target.value);
                                const found = clientes.find(c => `${c.nombre} (${c.documento || 'SD'})` === e.target.value);
                                setClienteSeleccionadoId(found ? found.id : "");
                            }}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                        />
                        <datalist id="lista-clientes-dev">
                            {clientes.map(c => <option key={c.id} value={`${c.nombre} (${c.documento || 'SD'})`} />)}
                        </datalist>
                    </div>

                    <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#ecfdf5' }}>
                            <h3 style={{ margin: 0, color: '#065f46', fontSize: '1rem' }}>Lo que DEVUELVE (Entra Stock)</h3>
                        </div>
                        <div style={{ maxHeight: '150px', overflowY: 'auto', padding: '0.5rem' }}>
                            {prendasDevueltas.length === 0 ? <p style={{ fontSize: '0.85rem', color: '#9ca3af', padding: '0.5rem' }}>Ninguna prenda a devolver.</p> : (
                                <ul className={styles.cartList} style={{ margin: 0 }}>
                                    {prendasDevueltas.map(l => (
                                        <li key={l.id} className={styles.cartItem} style={{ padding: '0.5rem' }}>
                                            <div className={styles.cartItemTop}><span style={{ fontSize: '0.85rem' }}>{l.nombre} <span className={styles.cartItemVariante}>· {l.variante}</span></span></div>
                                            <div className={styles.cartItemBottom}>
                                                <div className={styles.cartItemActions}>
                                                    <button className={styles.qtyBtn} onClick={() => modificarCantidad(l.id, -1, 'devuelve')}><Minus size={12} /></button>
                                                    <span className={styles.qtyNum}>{l.cantidad}</span>
                                                    <button className={styles.qtyBtn} onClick={() => modificarCantidad(l.id, 1, 'devuelve')}><Plus size={12} /></button>
                                                    <button className={styles.removeBtn} onClick={() => quitarLinea(l.id, 'devuelve')}><Trash size={12} /></button>
                                                </div>
                                                <strong style={{ fontSize: '0.85rem' }}>${(l.precioUnitario * l.cantidad).toLocaleString('es-AR')}</strong>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', backgroundColor: '#eff6ff' }}>
                            <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '1rem' }}>Lo que SE LLEVA (Sale Stock)</h3>
                        </div>
                        <div style={{ maxHeight: '150px', overflowY: 'auto', padding: '0.5rem' }}>
                            {prendasLlevadas.length === 0 ? <p style={{ fontSize: '0.85rem', color: '#9ca3af', padding: '0.5rem' }}>Ninguna prenda nueva.</p> : (
                                <ul className={styles.cartList} style={{ margin: 0 }}>
                                    {prendasLlevadas.map(l => (
                                        <li key={l.id} className={styles.cartItem} style={{ padding: '0.5rem' }}>
                                            <div className={styles.cartItemTop}><span style={{ fontSize: '0.85rem' }}>{l.nombre} <span className={styles.cartItemVariante}>· {l.variante}</span></span></div>
                                            <div className={styles.cartItemBottom}>
                                                <div className={styles.cartItemActions}>
                                                    <button className={styles.qtyBtn} onClick={() => modificarCantidad(l.id, -1, 'lleva')}><Minus size={12} /></button>
                                                    <span className={styles.qtyNum}>{l.cantidad}</span>
                                                    <button className={styles.qtyBtn} onClick={() => modificarCantidad(l.id, 1, 'lleva')}><Plus size={12} /></button>
                                                    <button className={styles.removeBtn} onClick={() => quitarLinea(l.id, 'lleva')}><Trash size={12} /></button>
                                                </div>
                                                <strong style={{ fontSize: '0.85rem' }}>${(l.precioUnitario * l.cantidad).toLocaleString('es-AR')}</strong>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div style={{ padding: '1.25rem', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', marginTop: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
                                <span>Favor Generado:</span>
                                <span>+${totalDevuelve.toLocaleString('es-AR')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.875rem', color: '#4b5563' }}>
                                <span>Costo de Nueva Prenda:</span>
                                <span>-${totalLleva.toLocaleString('es-AR')}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px dashed #d1d5db' }}>
                                <span style={{ fontWeight: 600, color: '#111827' }}>Diferencia a Impactar:</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: diferencia === 0 ? '#111827' : (diferencia > 0 ? '#16a34a' : '#dc2626') }}>
                                    {diferencia > 0 ? '+' : ''}{diferencia === 0 ? '$0' : `$${diferencia.toLocaleString('es-AR')}`}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.5rem 0 1rem', textAlign: 'right' }}>
                                {diferencia > 0
                                    ? "Sobra dinero: Se sumará al Saldo a Favor del cliente."
                                    : (diferencia < 0 ? "Falta dinero: Se convertirá en Deuda a Favor de la Tienda." : "Cambio exacto, no altera saldos.")}
                            </p>

                            {exitoMsg && (
                                <div style={{ color: "var(--success-color)", textAlign: "center", marginBottom: "0.5rem", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                    <CheckCircle size={18} weight="fill" />
                                    {exitoMsg}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={procesando || (!clienteSeleccionadoId) || (prendasDevueltas.length === 0 && prendasLlevadas.length === 0)}
                                style={{ width: '100%', padding: '0.85rem', border: 'none', backgroundColor: '#111827', color: 'white', borderRadius: '0.375rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', opacity: (procesando || !clienteSeleccionadoId || (prendasDevueltas.length === 0 && prendasLlevadas.length === 0)) ? 0.5 : 1 }}
                            >
                                {procesando ? 'Contabilizando...' : 'Aprobar Cierre (Stock y Saldo)'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {productoModal && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.5rem", width: "100%", maxWidth: "400px" }}>
                        <h3 style={{ margin: "0 0 1rem" }}>{productoModal.type === 'devuelve' ? 'Devuelve:' : 'Lleva:'} {productoModal.prod.nombre}</h3>
                        <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "1rem" }}>Seleccioná la variante exacta (talle/color).</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "300px", overflowY: "auto" }}>
                            {productoModal.prod.variantes
                                .slice((modalVariantesPage - 1) * LIMIT_VARIANTES_MODAL, modalVariantesPage * LIMIT_VARIANTES_MODAL)
                                .map((v) => (
                                    <button
                                        key={v.varianteId}
                                        onClick={() => { agregarLista(productoModal.prod, v, productoModal.type); setProductoModal(null); }}
                                        style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "0.375rem", background: "#f9fafb", cursor: "pointer", textAlign: "left" }}
                                    >
                                        <span style={{ fontWeight: 500 }}>{getVarianteLabel(v)}</span>
                                        <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Stock: {((v as any).stockActual || (v as any).StockActual || 0)}</span>
                                    </button>
                                ))}
                        </div>

                        {/* Paginación de Variantes */}
                        {productoModal.prod.variantes.length > LIMIT_VARIANTES_MODAL && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                                <button
                                    onClick={() => setModalVariantesPage(p => Math.max(1, p - 1))}
                                    disabled={modalVariantesPage === 1}
                                    style={{ padding: "0.3rem 0.6rem", border: "1px solid #d1d5db", borderRadius: "0.25rem", background: "white", cursor: modalVariantesPage === 1 ? "not-allowed" : "pointer", opacity: modalVariantesPage === 1 ? 0.5 : 1 }}
                                >
                                    Anterior
                                </button>
                                <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>
                                    Pág {modalVariantesPage} de {Math.ceil(productoModal.prod.variantes.length / LIMIT_VARIANTES_MODAL)}
                                </span>
                                <button
                                    onClick={() => setModalVariantesPage(p => Math.min(Math.ceil(productoModal.prod.variantes.length / LIMIT_VARIANTES_MODAL), p + 1))}
                                    disabled={modalVariantesPage === Math.ceil(productoModal.prod.variantes.length / LIMIT_VARIANTES_MODAL)}
                                    style={{ padding: "0.3rem 0.6rem", border: "1px solid #d1d5db", borderRadius: "0.25rem", background: "white", cursor: modalVariantesPage === Math.ceil(productoModal.prod.variantes.length / LIMIT_VARIANTES_MODAL) ? "not-allowed" : "pointer", opacity: modalVariantesPage === Math.ceil(productoModal.prod.variantes.length / LIMIT_VARIANTES_MODAL) ? 0.5 : 1 }}
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}

                        <div style={{ marginTop: "1.5rem", textAlign: "right" }}>
                            <button
                                onClick={() => setProductoModal(null)}
                                style={{ padding: "0.5rem 1rem", background: "none", border: "1px solid #d1d5db", borderRadius: "0.25rem", cursor: "pointer" }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
