import { useEffect, useState } from "react";
import { ChatCircleDots } from "@phosphor-icons/react";
import { useAuthStore } from "../auth/store/authStore";
import { catalogoAsistidoApi } from "./api/catalogoAsistidoApi";
import styles from "./CatalogoAsistidoWidget.module.css";

type Autor = "bot" | "usuario";

type ChatMessage = {
  id: string;
  autor: Autor;
  texto: string;
};

type OpcionId = "stock-bajo" | "sin-stock" | "top-semana";

type ModoAsistente = "catalogo" | "faq" | "sobre-nosotros";

const OPCIONES: { id: OpcionId; label: string }[] = [
  { id: "stock-bajo", label: "Productos con stock bajo (menos de 7)" },
  { id: "sin-stock", label: "Productos sin stock" },
  { id: "top-semana", label: "Top 3 más vendidos (7 días)" },
];

const LAST_CHECK_KEY = "catalogoAsistido.ultimoChequeo";

export function CatalogoAsistidoWidget() {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingOpcion, setLoadingOpcion] = useState<OpcionId | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [modo, setModo] = useState<ModoAsistente>("catalogo");

  const nombre = user?.nombre || "usuario";

  useEffect(() => {
    if (!isOpen || modo !== "catalogo") return;
    const inicial: ChatMessage[] = [
      {
        id: "saludo-1",
        autor: "bot",
        texto: `Hola ${nombre}, soy tu asistente de catálogo.`,
      },
      {
        id: "saludo-2",
        autor: "bot",
        texto: "¿Querés consultar cómo estamos hoy? Elegí una opción abajo.",
      },
    ];
    setMessages(inicial);
  }, [nombre, isOpen, modo]);

  useEffect(() => {
    const raw = window.localStorage.getItem(LAST_CHECK_KEY);
    if (!raw) {
      return;
    }
    const last = Number(raw);
    if (!Number.isFinite(last)) return;
    const sieteDiasMs = 7 * 24 * 60 * 60 * 1000;
    const diff = Date.now() - last;
    if (diff < sieteDiasMs) {
      return;
    }
    // Si pasaron 7 días o más desde el último chequeo, lo haremos cuando el usuario
    // elija por primera vez una opción. El timestamp se actualiza al ejecutar una consulta.
  }, []);

  const pushMessage = (autor: Autor, texto: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        autor,
        texto,
      },
    ]);
  };

  const registrarChequeo = () => {
    window.localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
  };

  const handleOpcion = async (op: OpcionId) => {
    if (modo !== "catalogo") return;
    if (loadingOpcion) return;
    setLoadingOpcion(op);
    try {
      const label = OPCIONES.find((o) => o.id === op)?.label ?? "";
      if (label) {
        pushMessage("usuario", label);
      }

      if (op === "stock-bajo") {
        const data = await catalogoAsistidoApi.getStockBajo(7);
        if (data.length === 0) {
          pushMessage(
            "bot",
            "No encontré productos con stock total menor a 7 unidades en este momento.",
          );
        } else {
          const productosResumen = data.map((p) => {
            const variantesBajas = p.variantes.filter(
              (v) => v.stockActual > 0 && v.stockActual < 7,
            );
            return {
              nombre: p.nombre,
              variantesBajas,
              stockTotal: p.stockTotal,
            };
          });

          const primeros = productosResumen.slice(0, 5);
          const detalle = primeros
            .map((p) => {
              const cantVar = p.variantesBajas.length;
              const ejemplo = p.variantesBajas[0];
              const ejemploTexto = ejemplo
                ? ` (ej: ${ejemplo.sku || "sin SKU"} · ${
                    ejemplo.talle
                  } / ${ejemplo.color}, stock ${ejemplo.stockActual})`
                : "";
              return `• ${p.nombre} — ${cantVar} variante(s) con stock bajo (stock total producto: ${
                p.stockTotal
              })${ejemploTexto}`;
            })
            .join("\n");
          const totalVariantes = productosResumen.reduce(
            (acc, p) => acc + p.variantesBajas.length,
            0,
          );
          const resto =
            totalVariantes > 5
              ? `\n… y más productos con variantes en stock bajo.`
              : "";
          pushMessage(
            "bot",
            `Detecté ${totalVariantes} variante(s) con stock menor a 7 unidades, distribuidas en ${data.length} producto(s):\n${detalle}${resto}`,
          );
        }
      } else if (op === "sin-stock") {
        const data = await catalogoAsistidoApi.getSinStock();
        if (data.length === 0) {
          pushMessage(
            "bot",
            "No hay productos con stock total igual a 0. Todo el catálogo tiene al menos una unidad disponible.",
          );
        } else {
          const productosResumen = data.map((p) => ({
            nombre: p.nombre,
            variantesSinStock: p.variantes,
          }));

          const totalVariantes = productosResumen.reduce(
            (acc, p) => acc + p.variantesSinStock.length,
            0,
          );

          const primeros = productosResumen.slice(0, 5);
          const detalle = primeros
            .map((p) => {
              const cantVar = p.variantesSinStock.length;
              const ejemplo = p.variantesSinStock[0];
              const ejemploTexto = ejemplo
                ? ` (ej: ${ejemplo.sku || "sin SKU"} · ${
                    ejemplo.talle
                  } / ${ejemplo.color})`
                : "";
              return `• ${p.nombre} — ${cantVar} variante(s) sin stock${ejemploTexto}`;
            })
            .join("\n");
          const resto =
            totalVariantes > 5
              ? `\n… y más productos con variantes sin stock.`
              : "";
          pushMessage(
            "bot",
            `Encontré ${totalVariantes} variante(s) sin stock, pertenecientes a ${data.length} producto(s):\n${detalle}${resto}`,
          );
        }
      } else if (op === "top-semana") {
        const data = await catalogoAsistidoApi.getTopVendidosSemana(3);
        if (data.length === 0) {
          pushMessage(
            "bot",
            "Todavía no hay ventas registradas en la última semana para calcular un top 3.",
          );
        } else {
          const detalle = data
            .map(
              (p, idx) =>
                `${idx + 1}. ${p.nombre} — ${p.unidadesVendidas} unidades · $${p.importeTotal.toLocaleString(
                  "es-AR",
                )}`,
            )
            .join("\n");
          pushMessage(
            "bot",
            `Estos son los productos más vendidos de la semana:\n${detalle}`,
          );
        }
      }

      registrarChequeo();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      pushMessage(
        "bot",
        "Ocurrió un problema al consultar los datos. Probá de nuevo en unos minutos.",
      );
    } finally {
      setLoadingOpcion(null);
    }
  };

  return (
    <section aria-label="Chat asistente (catálogo, FAQs, sobre nosotros)">
      {/* Botón flotante tipo burbuja */}
      <button
        type="button"
        className={styles.chatToggle}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Cerrar asistente" : "Abrir asistente de ayuda"}
      >
        <ChatCircleDots size={24} weight="bold" />
      </button>

      {isOpen && (
        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div>
              <div className={styles.widgetTitle}>Asistente</div>
              <div className={styles.widgetSub}>
                Elegí el tipo de ayuda que necesitás.
              </div>
            </div>
          </div>

          {/* Tabs de modo de asistente */}
          <div className={styles.modeTabs} role="tablist">
            <button
              type="button"
              className={`${styles.modeTab} ${
                modo === "catalogo" ? styles.modeTabActive : ""
              }`}
              onClick={() => setModo("catalogo")}
              role="tab"
              aria-selected={modo === "catalogo"}
            >
              Catálogo
            </button>
            <button
              type="button"
              className={`${styles.modeTab} ${
                modo === "faq" ? styles.modeTabActive : ""
              }`}
              onClick={() => setModo("faq")}
              role="tab"
              aria-selected={modo === "faq"}
            >
              Preguntas frecuentes
            </button>
            <button
              type="button"
              className={`${styles.modeTab} ${
                modo === "sobre-nosotros" ? styles.modeTabActive : ""
              }`}
              onClick={() => setModo("sobre-nosotros")}
              role="tab"
              aria-selected={modo === "sobre-nosotros"}
            >
              Sobre nosotros
            </button>
          </div>

          <div className={styles.widgetBody}>
            {modo === "catalogo" && (
              <>
                <div className={styles.messages}>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`${styles.msgRow} ${
                        m.autor === "bot" ? styles.msgBot : styles.msgUser
                      }`}
                    >
                      <div
                        className={`${styles.msgBubble} ${
                          m.autor === "bot"
                            ? styles.msgBubbleBot
                            : styles.msgBubbleUser
                        }`}
                      >
                        {m.texto.split("\n").map((line, idx) => (
                          <span key={idx}>
                            {line}
                            {idx < m.texto.split("\n").length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.optionsRow}>
                  {OPCIONES.map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      className={styles.optionBtn}
                      onClick={() => handleOpcion(op.id)}
                      disabled={!!loadingOpcion}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
                <div className={styles.footerHint}>
                  El asistente usa datos reales de tu catálogo y ventas.
                </div>
              </>
            )}

            {modo === "faq" && (
              <div className={styles.messages}>
                <div className={`${styles.msgRow} ${styles.msgBot}`}>
                  <div className={`${styles.msgBubble} ${styles.msgBubbleBot}`}>
                    Próximamente vas a poder ver acá las preguntas frecuentes
                    sobre el sistema (catálogo, POS, clientes, etc.).
                  </div>
                </div>
              </div>
            )}

            {modo === "sobre-nosotros" && (
              <div className={styles.messages}>
                <div className={`${styles.msgRow} ${styles.msgBot}`}>
                  <div className={`${styles.msgBubble} ${styles.msgBubbleBot}`}>
                    Esta sección contará quiénes somos, cómo trabajamos y cómo
                    contactar al equipo de soporte.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

