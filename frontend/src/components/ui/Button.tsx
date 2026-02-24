import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

export type VarianteBoton = "primario" | "secundario" | "terciario" | "danger";
export type TamanioBoton = "sm" | "md" | "lg";

export interface PropsBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: VarianteBoton;
  size?: TamanioBoton;
  fullWidth?: boolean;
  /** Para uso con Phosphor: pasar el componente del icono, ej. <SignIn /> */
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Button({
  variant = "primario",
  size = "md",
  fullWidth = false,
  iconLeft,
  iconRight,
  className = "",
  children,
  disabled,
  ...rest
}: PropsBoton) {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={classes} disabled={disabled} {...rest}>
      {iconLeft && <span className={styles.iconLeft} aria-hidden>{iconLeft}</span>}
      {children}
      {iconRight && <span className={styles.iconRight} aria-hidden>{iconRight}</span>}
    </button>
  );
}
