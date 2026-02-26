import { Outlet, useLocation } from "react-router-dom";
import { AuthRightLogin } from "../../features/auth/AuthRightLogin";
import { AuthRightRegister } from "../../features/auth/AuthRightRegister";
import styles from "./AuthLayout.module.css";

/**
 * Layout tipo Clay: dos columnas.
 * Login: formulario IZQUIERDA, dibujos/esquemas DERECHA.
 * Registro: al hacer clic en "Registrarse", animación derecha→izquierda:
 *   dibujos/esquemas pasan a la IZQUIERDA, formulario de registro queda a la DERECHA.
 */
export function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname.includes("registro");

  return (
    <div className={styles.wrapper}>
      <div
        key={location.pathname}
        className={styles.animatedView}
        data-register={isRegister ? "true" : undefined}
      >
        {/* Columna 1: login = form (blanco) | registro = panel (oscuro) */}
        <div className={isRegister ? styles.panelCol : styles.formCol}>
          {isRegister ? (
            <AuthRightRegister />
          ) : (
            <div className={styles.formInner}>
              <Outlet />
            </div>
          )}
        </div>
        {/* Columna 2: login = panel (oscuro) | registro = form (blanco) */}
        <div className={isRegister ? styles.formCol : styles.panelCol}>
          {isRegister ? (
            <div className={styles.formInner}>
              <Outlet />
            </div>
          ) : (
            <AuthRightLogin />
          )}
        </div>
      </div>
    </div>
  );
}
