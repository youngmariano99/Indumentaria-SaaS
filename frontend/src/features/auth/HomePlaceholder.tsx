import { Link } from "react-router-dom";
import { SignOut } from "@phosphor-icons/react";
import styles from "./HomePlaceholder.module.css";

/**
 * Placeholder para la pantalla post-login.
 * Cuando el backend esté conectado, aquí irá el dashboard o redirección al POS/Admin.
 */
export function HomePlaceholder() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Bienvenido</h1>
        <p className={styles.text}>
          Estás dentro. Cuando conectemos el backend, aquí cargará tu panel o te
          redirigiremos al punto de venta.
        </p>
        <Link to="/login" className={styles.linkButton}>
          <SignOut size={20} />
          Ir a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
