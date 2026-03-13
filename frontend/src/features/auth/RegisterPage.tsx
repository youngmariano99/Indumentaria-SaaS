import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EnvelopeSimple, Lock, User, UserPlus, Tag } from "@phosphor-icons/react";
import { Button, Input } from "../../components/ui";
import { authApi } from "./api/authApi";
import styles from "./AuthPages.module.css";

/**
 * Pantalla de registro SaaS 2.0.
 * Permite elegir el nombre del negocio y el rubro para inicializar el motor dinámico.
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const [nombreComercial, setNombreComercial] = useState("");
  const [rubroId, setRubroId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [rubros, setRubros] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authApi.obtenerRubros().then(setRubros).catch(() => {
      // Fallback estático si el endpoint falla
      setRubros([
        { id: "d1e0f6a2-1234-5678-90ab-cdef01234567", nombre: "Indumentaria / Ropa" }
      ]);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones locales
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
      const subdominio = nombreComercial.trim().toLowerCase().replace(/\s+/g, "-");

      await authApi.register({
        nombreComercial: nombreComercial.trim(),
        subdominio,
        email,
        password,
        rubroId: rubroId || undefined
      });

      // Registro exitoso → redirigir al login
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
        <p className={styles.logo}>POS Indumentaria</p>
        <p className={styles.logoDesc}>
          Punto de venta para locales de ropa. Empezá en minutos.
        </p>
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>Crear cuenta</h1>
        <p className={styles.subtitle}>
          Registrá tu negocio para empezar a usar el SaaS.
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

        {/* Selector de Rubro - SaaS 2.0 */}
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Tipo de Negocio (Rubro)</label>
          <div className={styles.selectContainer}>
            <select
              className={styles.select}
              value={rubroId}
              onChange={(e) => setRubroId(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                backgroundColor: 'white',
                marginTop: '4px',
                outline: 'none'
              }}
            >
              <option value="">Seleccionar rubro...</option>
              {rubros.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </div>
        </div>

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

        {nombreComercial.trim() && (
          <p className={styles.subtitle} style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
            <Tag size={13} />
            Tu url será: <strong>{nombreComercial.trim().toLowerCase().replace(/\s+/g, "-")}.dominio.com</strong>
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

