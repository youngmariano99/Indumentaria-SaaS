import { Outlet, useLocation } from "react-router-dom";
import { AuthRightLogin } from "../../features/auth/AuthRightLogin";
import { AuthRightRegister } from "../../features/auth/AuthRightRegister";
import styles from "./AuthLayout.module.css";

/**
 * Layout tipo Clay: dos columnas.
 * Izquierda: formulario (login o registro).
 * Derecha: iconos de funcionalidades (login) o ilustración estadísticas (registro).
 * Al ir a registro, el panel derecho anima entrada de derecha a izquierda.
 */
export function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname.includes("registro");

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <div className={styles.leftInner}>
          <Outlet />
        </div>
      </div>
      <div className={styles.right}>
        <div
          key={isRegister ? "register" : "login"}
          className={styles.rightAnimated}
        >
          {isRegister ? <AuthRightRegister /> : <AuthRightLogin />}
        </div>
      </div>
    </div>
  );
}
