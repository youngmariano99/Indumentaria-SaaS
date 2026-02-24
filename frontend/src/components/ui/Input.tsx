import type { InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

export interface PropsInput extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  error?: string;
  /** Opcional: icono a la izquierda (Phosphor) */
  iconLeft?: React.ReactNode;
  /** Tamaño visual: mismo height que botones sm/md/lg */
  inputSize?: "sm" | "md" | "lg";
}

export function Input({
  label,
  error,
  iconLeft,
  inputSize = "md",
  id,
  className = "",
  ...rest
}: PropsInput) {
  const inputId = id ?? `input-${label.replace(/\s/g, "-").toLowerCase()}`;
  const classes = [
    styles.wrapper,
    error ? styles.hasError : "",
    iconLeft ? styles.hasIcon : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={styles.inputWrap}>
        {iconLeft && <span className={styles.iconLeft} aria-hidden>{iconLeft}</span>}
        <input
          id={inputId}
          className={`${styles.input} ${styles[inputSize]}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
