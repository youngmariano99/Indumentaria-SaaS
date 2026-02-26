import { useState, useEffect } from "react";
import styles from "./AuthRightPanels.module.css";

const SLIDES = [
  {
    trusted: "Para locales de ropa",
    title: "Stock por talle y color, caja y facturación en un solo lugar",
    desc: "Pensado para retail de indumentaria: cargá tu matriz, vendé en el mostrador y emití factura electrónica sin salir del sistema.",
    benefits: [
      "Matriz de talles y colores con stock por sucursal",
      "POS offline para vender aunque falle internet",
      "Integración ARCA para facturación electrónica",
    ],
  },
  {
    trusted: "Dashboard en tiempo real",
    title: "Ventas, métricas y reportes desde el primer día",
    desc: "Mirá qué vendiste, qué reponer y cómo va el local. Alertas de stock bajo y reportes por período listos para usar.",
    benefits: [
      "Ventas y métricas en tiempo real",
      "Alertas de stock bajo",
      "Reportes por día, semana o mes",
    ],
  },
  {
    trusted: "Multi-sucursal",
    title: "Un solo sistema para todos tus locales",
    desc: "Gestioná varios puntos de venta con stock y reportes centralizados. Cada sucursal con su caja y su matriz.",
    benefits: [
      "Stock y ventas por sucursal",
      "Vista consolidada cuando lo necesites",
      "Mismo flujo en todos los locales",
    ],
  },
];

const ROTATE_MS = 5500;

/**
 * Panel login: slider que rota mensajes. Fondo blanco. Marca: Appy Studios.
 */
export function AuthRightLogin() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={styles.panel}>
      <div className={styles.sliderWrap}>
        <div className={styles.sliderTrack}>
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`${styles.slide} ${i === index ? styles.slideActive : ""}`}
              aria-hidden={i !== index}
            >
              <p className={styles.trusted}>{slide.trusted}</p>
              <h2 className={styles.panelTitle}>{slide.title}</h2>
              <p className={styles.panelDesc}>{slide.desc}</p>
              <div className={styles.panelLine} aria-hidden />
              <ul className={styles.benefitList}>
                {slide.benefits.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={styles.sliderDots} role="tablist" aria-label="Slides">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}`}
              className={`${styles.sliderDot} ${i === index ? styles.sliderDotActive : ""}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
      <p className={styles.agency}>Desarrollado por Appy Studios</p>
    </div>
  );
}
