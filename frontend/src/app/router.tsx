import { createBrowserRouter, Link, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { AuthLayout } from "../components/layout/AuthLayout";
import { LoginScreen } from "../features/auth/components/LoginScreen";
import { RegisterPage } from "../features/auth/RegisterPage";
import { CatalogoPage } from "../features/catalog/CatalogoPage";
import { NuevoProductoPage } from "../features/catalog/NuevoProductoPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { AjustesPage } from "../features/ajustes/AjustesPage";
import { PosPage } from "../features/pos/PosPage";
import { CategoriasPage } from "../features/catalog/CategoriasPage";
import { useAuthStore } from "../features/auth/store/authStore";

// Layout protegido: valida auth y renderiza AppLayout con Outlet
const ProtectedLayout = () => {
  const isValid = useAuthStore((state) => state.checkTokenValidity());
  if (!isValid) return <Navigate to="/login" replace />;
  return <AppLayout />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  // ── Auth (sin sidebar) ───────────────────────────────────────────────────
  {
    path: "/login",
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginScreen /> }],
  },
  {
    path: "/registro",
    element: <AuthLayout />,
    children: [{ index: true, element: <RegisterPage /> }],
  },
  // ── Rutas protegidas con AppLayout (sidebar compartido) ──────────────────
  {
    element: <ProtectedLayout />,
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/catalogo", element: <CatalogoPage /> },
      { path: "/catalogo/nuevo", element: <NuevoProductoPage /> },
      { path: "/catalogo/editar/:id", element: <NuevoProductoPage /> },
      { path: "/categorias", element: <CategoriasPage /> },
      { path: "/ajustes", element: <AjustesPage /> },
      { path: "/pos", element: <PosPage /> },
      {
        path: "/clientes/nuevo",
        element: (
          <div style={{ padding: "var(--space-6)", maxWidth: 480, margin: "0 auto" }}>
            <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-2)" }}>Alta de cliente</h1>
            <p style={{ color: "var(--color-gray-600)", marginBottom: "var(--space-4)" }}>
              Esta función está en desarrollo. Próximamente podrás cargar y gestionar clientes desde acá.
            </p>
            <Link to="/dashboard" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Volver al dashboard</Link>
          </div>
        ),
      },
      {
        path: "/modulos",
        element: (
          <div style={{ padding: "var(--space-6)", maxWidth: 480, margin: "0 auto" }}>
            <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-2)" }}>Módulos</h1>
            <p style={{ color: "var(--color-gray-600)", marginBottom: "var(--space-4)" }}>
              Acá podrás ver y contratar módulos adicionales. Próximamente.
            </p>
            <Link to="/dashboard" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Volver al dashboard</Link>
          </div>
        ),
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
