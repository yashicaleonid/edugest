import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import UsuariosPage from '../pages/usuarios/UsuariosPage';
import EstudiantesPage from '../pages/estudiantes/EstudiantesPage';
import DocentesPage from '../pages/docentes/DocentesPage';
import CursosPage from '../pages/cursos/CursosPage';
import PagosPage from '../pages/pagos/PagosPage';
import AsistenciaPage from '../pages/asistencia/AsistenciaPage';
import Layout from '../components/layout/Layout';
import InscripcionesPage from '../pages/inscripciones/InscripcionesPage';
import ReportesPage from '../pages/reportes/ReportesPage';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="estudiantes" element={<EstudiantesPage />} />
          <Route path="docentes" element={<DocentesPage />} />
          <Route path="cursos" element={<CursosPage />} />
          <Route path="pagos" element={<PagosPage />} />
          <Route path="asistencia" element={<AsistenciaPage />} />
          <Route path="inscripciones" element={<InscripcionesPage />} />
          <Route path="reportes" element={<ReportesPage/>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}