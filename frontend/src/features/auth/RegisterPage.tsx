import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EnvelopeSimple, Lock, User, UserPlus } from "@phosphor-icons/react";
import { Button, Input } from "../../components/ui";
import styles from "./AuthPages.module.css";

/**
 * Pantalla de registro. Mismo estilo que login; panel derecho muestra ilustración estadísticas.
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      setError("Ingresá tu nombre o nombre comercial.");
      return;
    }
    if (!email.trim()) {
      setError("Ingresá tu correo electrónico.");
      return;
    }
    if (!password) {
      setError("Creá una contraseña.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/login", { replace: true });
    }, 600);
  };

  return (
    <>
      <div className={styles.brand}>
        <h1 className={styles.logo}>POS Indumentaria</h1>
        <p className={styles.logoDesc}>
          Punto de venta para retail de indumentaria.
        </p>
      </div>

      <header className={styles.header}>
        <h2 className={styles.title}>Crear cuenta</h2>
        <p className={styles.subtitle}>
          Registrá tu negocio para empezar a usar el POS.
        </p>
      </header>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}

        <Input
          label="Nombre o nombre comercial"
          type="text"
          autoComplete="name"
          placeholder="Mi Tienda"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          iconLeft={<User size={20} />}
          disabled={loading}
        />

        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          iconLeft={<EnvelopeSimple size={20} />}
          disabled={loading}
        />

        <Input
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          iconLeft={<Lock size={20} />}
          disabled={loading}
        />

        <Input
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="Repetí la contraseña"
          value={confirmarPassword}
          onChange={(e) => setConfirmarPassword(e.target.value)}
          iconLeft={<Lock size={20} />}
          disabled={loading}
        />

        <Button
          type="submit"
          variant="primario"
          size="lg"
          fullWidth
          iconLeft={<UserPlus size={22} weight="bold" />}
          disabled={loading}
        >
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>

      <p className={styles.footer}>
        ¿Ya tenés cuenta?{" "}
        <Link to="/login" className={styles.footerLink}>
          Iniciar sesión
        </Link>
      </p>
    </>
  );
}
