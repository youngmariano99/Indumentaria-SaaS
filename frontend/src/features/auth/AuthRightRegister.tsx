import styles from "./AuthRightPanels.module.css";

/**
 * Panel derecho en registro: ilustración abstracta con cuadros/estadísticas.
 * Identidad visual: geométrico, monocromático, primario + grises.
 */
export function AuthRightRegister() {
  return (
    <div className={styles.panel}>
      <p className={styles.trusted}>Tu negocio, en números</p>
      <h2 className={styles.panelTitle}>Empezá a vender con datos claros</h2>
      <p className={styles.panelDesc}>
        Dashboard, reportes y métricas desde el primer día.
      </p>
      <div className={styles.statsIllustration} aria-hidden>
        <div className={styles.chartBars}>
          {[40, 65, 45, 80, 55, 70].map((h, i) => (
            <div
              key={i}
              className={styles.bar}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className={styles.chartLine} />
        <div className={styles.chartBoxes}>
          <div className={styles.miniBox} />
          <div className={styles.miniBox} />
          <div className={styles.miniBox} />
        </div>
      </div>
      <p className={styles.agency}>Desarrollado por tu agencia</p>
    </div>
  );
}
