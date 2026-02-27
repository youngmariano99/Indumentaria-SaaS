import styles from "./AuthRightPanels.module.css";

/**
 * Panel registro: mensaje de gracias y refuerzo de que somos los indicados. Fondo blanco.
 */
export function AuthRightRegister() {
  return (
    <div className={styles.panel}>
      <p className={styles.trusted}>Bienvenido</p>
      <h2 className={styles.thankYouTitle}>Gracias por unirte a nosotros</h2>
      <p className={styles.thankYouDesc}>
        Elegiste el Saas pensado para tu negocio!
        <br />
        Vas a poder vender, gestionar
        y facturar sin complicarte.
      </p>
      <div className={styles.panelLine} aria-hidden />
      <p className={styles.thankYouCta}>
        Estás en buenas manos. Completá el formulario y empezá cuando quieras.
      </p>
      <p className={styles.agency}>Desarrollado por Appy Studios</p>
    </div>
  );
}
