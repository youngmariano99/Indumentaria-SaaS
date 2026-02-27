import React from "react";
import { createBrowserRouter, Link, Navigate } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { LoginScreen } from "../features/auth/components/LoginScreen";
import { RegisterPage } from "../features/auth/RegisterPage";
import { CatalogoPage } from "../features/catalog/CatalogoPage";
import { NuevoProductoPage } from "../features/catalog/NuevoProductoPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { useAuthStore } from "../features/auth/store/authStore";

// Componente Wrapper para proteger rutas
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const isValid = useAuthStore((state) => state.checkTokenValidity());

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * Rutas con protección activada.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/pos", // "El Home" del sistema
    element: (
      <RequireAuth>
        <div className="p-8">
          <h1 className="text-3xl font-bold">Punto de Venta (Protegido)</h1>
          <button
            onClick={() => { useAuthStore.getState().logout(); window.location.href = '/login'; }}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
            Cerrar Sesión
          </button>
        </div>
      </RequireAuth>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <RequireAuth>
        <DashboardPage />
      </RequireAuth>
    ),
  },
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
  {
    path: "/catalogo",
    element: (
      <RequireAuth>
        <CatalogoPage />
      </RequireAuth>
    ),
  },
  {
    path: "/catalogo/nuevo",
    element: (
      <RequireAuth>
        <NuevoProductoPage />
      </RequireAuth>
    ),
  },
  {
    path: "/clientes/nuevo",
    element: (
      <RequireAuth>
        <div style={{ padding: "var(--space-6)", maxWidth: 480, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-2)" }}>Alta de cliente</h1>
          <p style={{ color: "var(--color-gray-600)", marginBottom: "var(--space-4)" }}>
            Esta función está en desarrollo. Próximamente podrás cargar y gestionar clientes desde acá.
          </p>
          <Link to="/dashboard" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Volver al dashboard</Link>
        </div>
      </RequireAuth>
    ),
  },
  {
    path: "/modulos",
    element: (
      <RequireAuth>
        <div style={{ padding: "var(--space-6)", maxWidth: 480, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-2)" }}>Módulos</h1>
          <p style={{ color: "var(--color-gray-600)", marginBottom: "var(--space-4)" }}>
            Acá podrás ver y contratar módulos adicionales. Próximamente.
          </p>
          <Link to="/dashboard" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Volver al dashboard</Link>
        </div>
      </RequireAuth>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
