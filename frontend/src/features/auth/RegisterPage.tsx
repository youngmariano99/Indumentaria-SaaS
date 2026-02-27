import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EnvelopeSimple, Lock, User, UserPlus, Tag } from "@phosphor-icons/react";
import { Button, Input } from "../../components/ui";
import { authApi } from "./api/authApi";
import styles from "./AuthPages.module.css";

/**
 * Pantalla de registro. Mismo estilo que login; panel derecho muestra ilustración estadísticas.
 * Conectada al endpoint POST /api/auth/register-admin-temp
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const [nombreComercial, setNombreComercial] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones locales (sin llamar a la API)
    if (!nombreComercial.trim()) {
      setError("Ingresá el nombre de tu negocio.");
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
    try {
      // El subdominio se genera automáticamente del nombre del negocio
      // (sin espacios, en minúsculas). Ej: "Mi Tienda" → "mi-tienda"
      const subdominio = nombreComercial.trim().toLowerCase().replace(/\s+/g, "-");

      await authApi.register({ subdominio, email, password });

      // Registro exitoso → redirigir al login para que inicie sesión
      navigate("/login", { replace: true, state: { mensaje: "¡Cuenta creada! Podés ingresar ahora." } });
    } catch (err: unknown) {
      const mensaje =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { mensaje?: string } } }).response?.data?.mensaje
          : null;
      setError(mensaje || "No pudimos crear la cuenta. Intentá con otro nombre de negocio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.brand}>
        <h1 className={styles.logo}>POS Indumentaria</h1>
        <p className={styles.logoDesc}>
          Punto de venta para locales de ropa. Empezá en minutos.
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
          label="Nombre del negocio"
          type="text"
          autoComplete="organization"
          placeholder="Ej: Mi Tienda"
          value={nombreComercial}
          onChange={(e) => setNombreComercial(e.target.value)}
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

        {/* Indicador del subdominio generado — solo informativo */}
        {nombreComercial.trim() && (
          <p className={styles.subtitle} style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
            <Tag size={13} />
            Tu negocio usará el código: <strong>{nombreComercial.trim().toLowerCase().replace(/\s+/g, "-")}</strong>
          </p>
        )}

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
