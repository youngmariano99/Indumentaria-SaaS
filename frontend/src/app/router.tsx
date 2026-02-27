import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { LoginScreen } from "../features/auth/components/LoginScreen";
import { RegisterPage } from "../features/auth/RegisterPage";
import { CatalogoPage } from "../features/catalog/CatalogoPage";
import { NuevoProductoPage } from "../features/catalog/NuevoProductoPage";
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
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
