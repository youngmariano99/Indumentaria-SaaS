import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EnvelopeSimple, Lock, SignIn } from "@phosphor-icons/react";
import { Button, Input } from "../../components/ui";
import styles from "./AuthPages.module.css";

/**
 * Pantalla de inicio de sesión.
 * Estilo referencia Clay: bienvenida, descripción, formulario, link registro.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Ingresá tu correo electrónico.");
      return;
    }
    if (!password) {
      setError("Ingresá tu contraseña.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/", { replace: true });
    }, 600);
  };

  return (
    <>
      <div className={styles.brand}>
        <h1 className={styles.logo}>POS Indumentaria</h1>
        <p className={styles.logoDesc}>
          Punto de venta para retail de indumentaria. Stock, facturación y reportes en un solo lugar.
        </p>
      </div>

      <header className={styles.header}>
        <h2 className={styles.title}>Bienvenido de nuevo</h2>
        <p className={styles.subtitle}>
          Ingresá a tu cuenta para gestionar tu punto de venta.
        </p>
      </header>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}

        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="Ingresá tu correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          iconLeft={<EnvelopeSimple size={20} />}
          disabled={loading}
        />

        <Input
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          placeholder="Ingresá tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          iconLeft={<Lock size={20} />}
          disabled={loading}
        />

        <div className={styles.forgotWrap}>
          <Link to="/login" className={styles.forgotLink}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primario"
          size="lg"
          fullWidth
          iconLeft={<SignIn size={22} weight="bold" />}
          disabled={loading}
        >
          {loading ? "Entrando…" : "Entrar"}
        </Button>

        <p className={styles.or}>o</p>
        <Button
          type="button"
          variant="secundario"
          size="lg"
          fullWidth
          disabled={loading}
        >
          Continuar con Google (próximamente)
        </Button>
      </form>

      <p className={styles.footer}>
        ¿No tenés cuenta?{" "}
        <Link to="/registro" className={styles.footerLink}>
          Registrarse
        </Link>
      </p>
    </>
  );
}
