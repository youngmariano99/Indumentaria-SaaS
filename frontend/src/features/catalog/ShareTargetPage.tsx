import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ShareNetwork, ArrowRight, X } from "@phosphor-icons/react";
import styles from "./ShareTargetPage.module.css";

export function ShareTargetPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [url, setUrl] = useState("");

    useEffect(() => {
        // La API Web Share Target inyecta lo recibido por params (GET)
        setTitle(searchParams.get("name") || searchParams.get("title") || "");
        setText(searchParams.get("description") || searchParams.get("text") || "");
        setUrl(searchParams.get("link") || searchParams.get("url") || "");
    }, [searchParams]);

    const handleCreateProduct = () => {
        // Redirige al borrador del producto, precargando el nombre sugerido y las notas
        navigate(`/catalogo/nuevo?nombre_sugerido=${encodeURIComponent(title || text)}&notas=${encodeURIComponent(url || text)}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <ShareNetwork size={32} weight="duotone" color="var(--color-primary)" />
                    <h2>Contenido Recibido</h2>
                    <p>Has enviado contenido desde otra App hacia tu Punto de Venta.</p>
                </div>

                <div className={styles.previewBox}>
                    {title && <h3 className={styles.previewTitle}>{title}</h3>}
                    {text && <p className={styles.previewText}>{text}</p>}
                    {url && (
                        <a href={url} target="_blank" rel="noreferrer" className={styles.previewUrl}>
                            {url}
                        </a>
                    )}
                    {!title && !text && !url && (
                        <span className={styles.emptyWarning}>No se detectó texto o enlace útil en el recurso compartido.</span>
                    )}
                </div>

                <div className={styles.actions}>
                    <button onClick={() => navigate(-1)} className={styles.btnCancel}>
                        <X size={20} /> Cancelar
                    </button>
                    <button onClick={handleCreateProduct} className={styles.btnPrimary}>
                        Crear Producto Borrador <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
