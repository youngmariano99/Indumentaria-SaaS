import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { EnvelopeSimple, Lock, SignIn, Tag } from "@phosphor-icons/react";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/authApi";
import { Button, Input } from "../../../components/ui";
import styles from "../AuthPages.module.css";

/**
 * Formulario de login dentro de AuthLayout.
 * Usa identidad visual (tipografía, colores, componentes) y lógica real (subdominio, API).
 */
export const LoginScreen = () => {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subdominio, setSubdominio] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginAuth = useAuthStore((state) => state.login);

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  useEffect(() => {
    const host = window.location.hostname;
    const parts = host.split(".");
    if (host === "localhost" || host === "127.0.0.1") {
      setSubdominio("");
    } else if (parts.length >= 3) {
      setSubdominio(parts[0]);
    }

    // Leer el mensaje de éxito si vino del registro
    const state = location.state as { mensaje?: string } | null;
    if (state?.mensaje) {
      setSuccessMsg(state.mensaje);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const resp = await authApi.login({ subdominio, email, password });
      loginAuth(resp);
      window.location.href = "/pos";
    } catch (err: unknown) {
      const mensaje =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { mensaje?: string } } }).response?.data
            ?.mensaje
          : null;
      setError(mensaje || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.brand}>
        <p className={styles.logo}>POS Indumentaria</p>
        <p className={styles.logoDesc}>
          Punto de venta para locales de ropa. Stock por talle y color,
          facturación y reportes.
        </p>
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>Bienvenido de nuevo</h1>
        <p className={styles.subtitle}>
          Ingresá a tu cuenta para gestionar tu punto de venta.
        </p>
      </header>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {isLocalhost && (
          <Input
            label="Subdominio (solo desarrollo)"
            type="text"
            value={subdominio}
            onChange={(e) => setSubdominio(e.target.value)}
            placeholder="ej: zara"
            iconLeft={<Tag size={20} />}
            disabled={isLoading}
          />
        )}

        {successMsg && (
          <p className={styles.subtitle} role="status" style={{ color: "#16a34a", fontWeight: 600 }}>
            ✓ {successMsg}
          </p>
        )}

        <Input
          label="Correo electrónico"
          type="email"
          required
          autoComplete="email"
          placeholder="Ingresá tu correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          iconLeft={<EnvelopeSimple size={20} />}
          disabled={isLoading}
        />

        <Input
          label="Contraseña"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Ingresá tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          iconLeft={<Lock size={20} />}
          disabled={isLoading}
        />

        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}

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
          disabled={isLoading}
        >
          {isLoading ? "Verificando…" : "Iniciar sesión"}
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
};
