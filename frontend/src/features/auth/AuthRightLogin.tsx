import {
  Package,
  CurrencyDollar,
  ChartBar,
  FileText,
  ShoppingCart,
  Storefront,
} from "@phosphor-icons/react";
import styles from "./AuthRightPanels.module.css";

const FUNCIONALIDADES = [
  { icon: Package, label: "Gestión de stock", desc: "Matriz talles y colores" },
  { icon: CurrencyDollar, label: "Cuentas corrientes", desc: "Clientes y saldos" },
  { icon: ChartBar, label: "Reportes", desc: "Ventas y métricas" },
  { icon: FileText, label: "ARCA / Fiscal", desc: "Facturación electrónica" },
  { icon: ShoppingCart, label: "Punto de venta", desc: "POS offline-first" },
  { icon: Storefront, label: "Multi-sucursal", desc: "Varios locales" },
] as const;

/**
 * Panel derecho en login: nombre del sistema, agencia y iconos de funcionalidades.
 */
export function AuthRightLogin() {
  return (
    <div className={styles.panel}>
      <p className={styles.trusted}>Incluye</p>
      <h2 className={styles.panelTitle}>Todo lo que tu negocio necesita</h2>
      <p className={styles.panelDesc}>
        Gestión de stock, punto de venta, facturación y reportes en un solo lugar.
      </p>
      <div className={styles.iconGrid}>
        {FUNCIONALIDADES.map(({ icon: Icon, label, desc }) => (
          <div key={label} className={styles.iconCard}>
            <div className={styles.iconWrap}>
              <Icon size={24} weight="duotone" />
            </div>
            <span className={styles.iconLabel}>{label}</span>
            <span className={styles.iconDesc}>{desc}</span>
          </div>
        ))}
      </div>
      <p className={styles.agency}>Desarrollado por tu agencia</p>
    </div>
  );
}
