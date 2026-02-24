import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { LoginPage } from "../features/auth/LoginPage";
import { RegisterPage } from "../features/auth/RegisterPage";
import { HomePlaceholder } from "../features/auth/HomePlaceholder";

/**
 * Rutas públicas por ahora (auth no conectado al backend).
 * Más adelante se añadirá protección de rutas y redirección según sesión.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePlaceholder />,
  },
  {
    path: "/login",
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: "/registro",
    element: <AuthLayout />,
    children: [{ index: true, element: <RegisterPage /> }],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
