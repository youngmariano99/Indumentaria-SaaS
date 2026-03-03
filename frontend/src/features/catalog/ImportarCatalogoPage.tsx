import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { catalogApi } from './api/catalogApi';
import { Button } from '../../components/ui/Button';
import {
    ArrowLeft,
    UploadSimple,
    Trash,
    CheckCircle,
    Warning,
    ListMagnifyingGlass
} from '@phosphor-icons/react';
import styles from './ImportarCatalogoPage.module.css';

interface ParsedRow {
    index: number;
    nombre: string;
    categoria: string;
    precio: number;
    talle: string;
    color: string;
    stock: number;
    errors: string[];
}

export function ImportarCatalogoPage() {
    const navigate = useNavigate();
    const [csvText, setCsvText] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [resultado, setResultado] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<1 | 2>(1);

    const GuidEmpty = "00000000-0000-0000-0000-000000000000";

    // Parsing reactivo para la vista previa
    const parsedData = useMemo(() => {
        if (!csvText.trim()) return [];

        const lines = csvText.trim().split('\n');
        return lines.map((line, idx) => {
            const parts = line.split('\t'); // Soporte para Excel TAB
            const nombre = parts[0]?.trim() || "";
            const categoriaName = parts[1]?.trim() || "";
            const precio = parseFloat(parts[2]?.replace(',', '.') || "0");
            const talle = parts[3]?.trim() || "";
            const color = parts[4]?.trim() || "";
            const stock = parseInt(parts[5] || "0");

            const errors: string[] = [];
            if (!nombre) errors.push("Nombre requerido");
            if (!talle) errors.push("Talle requerido");
            if (!color) errors.push("Color requerido");
            if (isNaN(precio) || precio <= 0) errors.push("Precio inválido");

            return {
                index: idx,
                nombre,
                categoria: categoriaName,
                precio,
                talle,
                color,
                stock,
                errors
            } as ParsedRow;
        });
    }, [csvText]);

    const hasErrors = parsedData.some(d => d.errors.length > 0);

    const handleImport = async () => {
        if (hasErrors || parsedData.length === 0) return;
        setProcesando(true);
        setError(null);
        try {
            const batch = parsedData.map(d => ({
                nombre: d.nombre,
                categoriaId: GuidEmpty, // El backend deberá resolver por nombre o dejar nulo por ahora
                precioBase: d.precio,
                variantes: [{
                    talle: d.talle,
                    color: d.color,
                    stockInicial: d.stock
                }]
            }));

            const count = await catalogApi.importarBatch(batch);
            setResultado(count);
            setStep(1);
            setCsvText("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al importar los productos");
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className={styles.importPage}>
            <div className={styles.card}>
                <header className={styles.header}>
                    <div className={styles.titleSection}>
                        <Button variant="secundario" size="sm" onClick={() => navigate('/catalogo')} iconLeft={<ArrowLeft />}>
                            Volver
                        </Button>
                        <h1>Carga Masiva de Productos</h1>
                        <p>Importá cientos de productos pegando directamente desde un Excel.</p>
                    </div>

                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>Filas Detectadas</span>
                            <span className={styles.statValue}>{parsedData.length}</span>
                        </div>
                        {hasErrors && (
                            <div className={styles.stat}>
                                <span className={styles.statLabel} style={{ color: '#e53e3e' }}>Errores</span>
                                <span className={styles.statValue} style={{ color: '#e53e3e' }}>
                                    {parsedData.filter(p => p.errors.length > 0).length}
                                </span>
                            </div>
                        )}
                    </div>
                </header>

                <div className={styles.steps}>
                    <div className={`${styles.step} ${step === 1 ? styles.stepActive : ''}`}>
                        <span className={styles.stepNumber}>1</span> Pegar Datos
                    </div>
                    <div className={`${styles.step} ${step === 2 ? styles.stepActive : ''}`}>
                        <span className={styles.stepNumber}>2</span> Revisar y Confirmar
                    </div>
                </div>

                {step === 1 ? (
                    <div className={styles.step1}>
                        <div className={styles.instructionBox}>
                            <h4><ListMagnifyingGlass size={20} /> ¿Cómo funciona?</h4>
                            <ul>
                                <li>Copiá el contenido de tu Excel (6 columnas: Nombre, Categoría, Precio, Talle, Color, Stock).</li>
                                <li>Pegalo en el cuadro de abajo. Se procesará automáticamente.</li>
                                <li>Luego hacé clic en "Revisar" para verificar que todo esté correcto.</li>
                            </ul>
                        </div>

                        <div className={styles.textAreaContainer}>
                            <textarea
                                className={styles.textArea}
                                placeholder="Pega aquí (Nombre	Categoría	Precio	Talle	Color	Stock)..."
                                value={csvText}
                                onChange={(e) => setCsvText(e.target.value)}
                            />
                        </div>

                        {resultado !== null && (
                            <div style={{ background: '#f0fff4', color: '#22543d', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle size={24} weight="fill" />
                                <span>¡Éxito! Se crearon {resultado} productos correctamente.</span>
                            </div>
                        )}

                        <div className={styles.footer}>
                            <Button variant="secundario" onClick={() => setCsvText("")} iconLeft={<Trash />}>
                                Limpiar
                            </Button>
                            <Button disabled={!csvText.trim()} onClick={() => setStep(2)}>
                                Revisar Datos <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.step2}>
                        <div className={styles.previewTableWrap}>
                            <table className={styles.previewTable}>
                                <thead>
                                    <tr>
                                        <th>Estado</th>
                                        <th>Producto / Categoría</th>
                                        <th>Precio</th>
                                        <th>Talle / Color</th>
                                        <th>Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedData.map((row) => (
                                        <tr key={row.index} className={row.errors.length > 0 ? styles.rowInvalid : styles.rowValid}>
                                            <td>
                                                {row.errors.length > 0 ? (
                                                    <Warning size={20} color="#e53e3e" weight="fill" />
                                                ) : (
                                                    <CheckCircle size={20} color="#38a169" weight="fill" />
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{row.nombre}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#666' }}>{row.categoria || 'Sin categoría'}</div>
                                                {row.errors.map(e => <span key={e} className={styles.errorText}>{e}</span>)}
                                            </td>
                                            <td>${row.precio.toLocaleString()}</td>
                                            <td>{row.talle} / {row.color}</td>
                                            <td>{row.stock}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {error && (
                            <div style={{ color: '#e53e3e', padding: '1rem', background: '#fff5f5', borderRadius: '8px', marginTop: '1rem' }}>
                                {error}
                            </div>
                        )}

                        <div className={styles.footer}>
                            <Button variant="secundario" onClick={() => setStep(1)}>
                                Volver a Pegar
                            </Button>
                            <Button onClick={handleImport} disabled={procesando || hasErrors || parsedData.length === 0} iconLeft={<UploadSimple />}>
                                {procesando ? 'Procesando...' : `Importar ${parsedData.length} Filas`}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
