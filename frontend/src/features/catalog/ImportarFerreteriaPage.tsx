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
    Table,
    FileCsv
} from '@phosphor-icons/react';
import styles from './ImportarCatalogoPage.module.css';

interface FerreteriaRow {
    index: number;
    nombre: string;
    categoria: string;
    costo: number;
    venta: number;
    stock: number;
    sku: string;
    metadatos: Record<string, string>;
    errors: string[];
}

export function ImportarFerreteriaPage() {
    const navigate = useNavigate();
    const [csvText, setCsvText] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [resultado, setResultado] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<1 | 2>(1);

    // Parsing reactivo para ferretería
    const parsedData = useMemo(() => {
        if (!csvText.trim()) return [];

        const lines = csvText.trim().split('\n');
        const headers = lines[0].split('\t').map(h => h.trim().toLowerCase());
        
        // Si la primera línea no parece tener headers conocidos, asumimos formato fijo
        const hasHeaders = headers.includes("nombre") || headers.includes("costo") || headers.includes("precio");

        const dataLines = hasHeaders ? lines.slice(1) : lines;
        const actualHeaders = hasHeaders ? headers : ["nombre", "categoria", "costo", "venta", "stock", "sku", "medida", "material"];

        return dataLines.map((line, idx) => {
            const parts = line.split('\t');
            const row: Record<string, string> = {};
            actualHeaders.forEach((h, i) => {
                row[h] = parts[i]?.trim() || "";
            });

            const metadatos: Record<string, string> = {};
            // Todo lo que no sea campo base va a metadatos
            const baseFields = ["nombre", "categoria", "costo", "venta", "precio", "stock", "sku", "ean13"];
            Object.entries(row).forEach(([k, v]) => {
                if (!baseFields.includes(k) && v) {
                    metadatos[k.charAt(0).toUpperCase() + k.slice(1)] = v;
                }
            });

            const errors: string[] = [];
            if (!row["nombre"]) errors.push("Nombre requerido");
            
            const costo = parseFloat(row["costo"]?.replace(',', '.') || "0");
            const venta = parseFloat(row["venta"]?.replace(',', '.') || row["precio"]?.replace(',', '.') || "0");
            const stock = parseFloat(row["stock"]?.replace(',', '.') || "0");

            if (isNaN(costo)) errors.push("Costo inválido");
            if (isNaN(venta) || venta <= 0) errors.push("Venta inválida");

            return {
                index: idx,
                nombre: row["nombre"],
                categoria: row["categoria"],
                costo,
                venta,
                stock,
                sku: row["sku"],
                metadatos,
                errors
            } as FerreteriaRow;
        });
    }, [csvText]);

    const hasErrors = parsedData.some(d => d.errors.length > 0);

    const handleImport = async () => {
        if (hasErrors || parsedData.length === 0) return;
        setProcesando(true);
        setError(null);
        try {
            const payload = parsedData.map(d => ({
                nombre: d.nombre,
                descripcion: "",
                categoriaNombre: d.categoria,
                precioCosto: d.costo,
                precioVenta: d.venta,
                stockInicial: d.stock,
                sku: d.sku,
                metadatos: d.metadatos
            }));

            const count = await catalogApi.importarFerreteria(payload);
            setResultado(count);
            setStep(1);
            setCsvText("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al importar el catálogo técnico");
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
                            Cerrar
                        </Button>
                        <h1>Carga Técnica (Ferretería)</h1>
                        <p>Importación optimizada para planillas con múltiples atributos técnicos.</p>
                    </div>

                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>Productos Detectados</span>
                            <span className={styles.statValue}>{parsedData.length}</span>
                        </div>
                    </div>
                </header>

                <div className={styles.steps}>
                    <div className={`${styles.step} ${step === 1 ? styles.stepActive : ''}`}>
                        <span className={styles.stepNumber}>1</span> Pegar Excel
                    </div>
                    <div className={`${styles.step} ${step === 2 ? styles.stepActive : ''}`}>
                        <span className={styles.stepNumber}>2</span> Validar Metadatos
                    </div>
                </div>

                {step === 1 ? (
                    <div className={styles.step1}>
                        <div className={styles.instructionBox} style={{ borderLeft: '4px solid #f59e0b' }}>
                            <h4><FileCsv size={20} color="#f59e0b" /> Formato Sugerido</h4>
                            <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Podés pegar columnas en cualquier orden si incluís la primera fila con encabezados:</p>
                            <code style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', display: 'block' }}>
                                Nombre | Categoría | Costo | Venta | Stock | Medida | Material | Marca...
                            </code>
                        </div>

                        <div className={styles.textAreaContainer}>
                            <textarea
                                className={styles.textArea}
                                placeholder="Pegá aquí tu planilla de Excel..."
                                value={csvText}
                                onChange={(e) => setCsvText(e.target.value)}
                            />
                        </div>

                        {resultado !== null && (
                            <div style={{ background: '#ecfdf5', color: '#065f46', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #a7f3d0' }}>
                                <CheckCircle size={24} weight="fill" />
                                <span>¡Listo! Se importaron {resultado} productos técnicos.</span>
                            </div>
                        )}

                        <div className={styles.footer}>
                            <Button variant="secundario" onClick={() => setCsvText("")} iconLeft={<Trash />}>
                                Limpiar
                            </Button>
                            <Button disabled={!csvText.trim()} onClick={() => setStep(2)}>
                                Validar Mapeo <Table size={18} style={{ marginLeft: 8 }} />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.step2}>
                        <div className={styles.previewTableWrap}>
                            <table className={styles.previewTable}>
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Producto</th>
                                        <th>Precios</th>
                                        <th>Metadatos Detectados</th>
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
                                                <div style={{ fontSize: '0.75rem', color: '#666' }}>{row.categoria || 'Genérico'}</div>
                                                {row.errors.map(e => <span key={e} className={styles.errorText}>{e}</span>)}
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>C: ${row.costo}</div>
                                                <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>V: ${row.venta}</div>
                                            </td>
                                            <td>
                                                <div className={styles.attrList} style={{ flexWrap: 'wrap', gap: '4px', display: 'flex' }}>
                                                    {Object.entries(row.metadatos).map(([k, v]) => (
                                                        <span key={k} style={{ fontSize: '0.7rem', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                                                            <strong>{k}:</strong> {v}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>{row.stock}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {error && (
                            <div className={styles.errorAlert} style={{ marginTop: '1rem' }}>
                                {error}
                            </div>
                        )}

                        <div className={styles.footer}>
                            <Button variant="secundario" onClick={() => setStep(1)}>
                                Volver
                            </Button>
                            <Button onClick={handleImport} disabled={procesando || hasErrors || parsedData.length === 0} iconLeft={<UploadSimple />}>
                                {procesando ? 'Procesando...' : `Importar ${parsedData.length} Productos Técnicos`}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
