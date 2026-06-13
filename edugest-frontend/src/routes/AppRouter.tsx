import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import UsuariosPage from '../pages/usuarios/UsuariosPage';
import EstudiantesPage from '../pages/estudiantes/EstudiantesPage';
import PadresPage from '../pages/padres/PadresPage';
import DocentesPage from '../pages/docentes/DocentesPage';
import CursosPage from '../pages/cursos/CursosPage';
import PagosPage from '../pages/pagos/PagosPage';
import FacturasPage from '../pages/facturas/FacturasPage';
import AsistenciaPage from '../pages/asistencia/AsistenciaPage';
import DocumentosPage from '../pages/documentos/DocumentosPage';
import NotificacionesPage from '../pages/notificaciones/NotificacionesPage';
import Layout from '../components/layout/Layout';
import InscripcionesPage from '../pages/inscripciones/InscripcionesPage';
import ReportesPage from '../pages/reportes/ReportesPage';
import { puedeAcceder, type Modulo } from '../utils/permissions';
import ComunicadosPage from '../pages/comunicados/ComunicadosPage';

const PrivateRoute = ({ children, modulo }: { children: ReactElement; modulo?: Modulo }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (modulo && user && !puedeAcceder(user.role, modulo)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<PrivateRoute modulo="dashboard"><DashboardPage /></PrivateRoute>} />
          <Route path="usuarios" element={<PrivateRoute modulo="usuarios"><UsuariosPage /></PrivateRoute>} />
          <Route path="estudiantes" element={<PrivateRoute modulo="estudiantes"><EstudiantesPage /></PrivateRoute>} />
          <Route path="padres" element={<PrivateRoute modulo="padres"><PadresPage /></PrivateRoute>} />
          <Route path="docentes" element={<PrivateRoute modulo="docentes"><DocentesPage /></PrivateRoute>} />
          <Route path="cursos" element={<PrivateRoute modulo="cursos"><CursosPage /></PrivateRoute>} />
          <Route path="pagos" element={<PrivateRoute modulo="pagos"><PagosPage /></PrivateRoute>} />
          <Route path="facturas" element={<PrivateRoute modulo="facturas"><FacturasPage /></PrivateRoute>} />
          <Route path="asistencia" element={<PrivateRoute modulo="asistencia"><AsistenciaPage /></PrivateRoute>} />
          <Route path="documentos" element={<PrivateRoute modulo="documentos"><DocumentosPage /></PrivateRoute>} />
          <Route path="inscripciones" element={<PrivateRoute modulo="inscripciones"><InscripcionesPage /></PrivateRoute>} />
          <Route path="reportes" element={<PrivateRoute modulo="reportes"><ReportesPage /></PrivateRoute>} />
          <Route path="notificaciones" element={<PrivateRoute modulo="notificaciones"><NotificacionesPage /></PrivateRoute>} />
          <Route path="comunicados" element={<PrivateRoute modulo="comunicados"><ComunicadosPage /></PrivateRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
