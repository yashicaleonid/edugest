import { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import PaymentsIcon from '@mui/icons-material/Payments';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

type DashboardData = {
  academicos: {
    totalEstudiantes: number;
    estudiantesActivos: number;
    totalDocentes: number;
    inscripcionesActivas: number;
  };
  financieros: {
    ingresosTotales: number;
    totalPagos: number;
  };
  operativos: {
    asistenciasHoy: number;
    pagosHoy: number;
  };
  gestion: number;
};

type StatCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
};

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ bgcolor: color, borderRadius: 2, p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const gestion = new Date().getFullYear();
        const { data: dashboard } = await api.get(`/reportes/dashboard?gestion=${gestion}`);
        setData(dashboard);
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const stats = data?.academicos;
  const operativos = data?.operativos;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Panel Principal
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Estudiantes Activos"
            value={stats?.estudiantesActivos ?? 0}
            icon={<SchoolIcon sx={{ color: 'white', fontSize: 28 }} />}
            color="#3b82f6"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Docentes"
            value={stats?.totalDocentes ?? 0}
            icon={<PersonIcon sx={{ color: 'white', fontSize: 28 }} />}
            color="#10b981"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pagos Hoy"
            value={operativos?.pagosHoy ?? 0}
            icon={<PaymentsIcon sx={{ color: 'white', fontSize: 28 }} />}
            color="#f59e0b"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Asistencias Hoy"
            value={operativos?.asistenciasHoy ?? 0}
            icon={<EventNoteIcon sx={{ color: 'white', fontSize: 28 }} />}
            color="#8b5cf6"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Accesos Rápidos
              </Typography>
              {[
                { label: '+ Registrar estudiante', path: '/estudiantes' },
                { label: '+ Registrar pago', path: '/pagos' },
                { label: '+ Registrar asistencia', path: '/asistencia' },
                { label: '+ Nueva inscripción', path: '/inscripciones' },
              ].map((item) => (
                <Box
                  key={item.path}
                  sx={{
                    p: 1.5, mb: 1, borderRadius: 2, bgcolor: '#f8fafc', cursor: 'pointer',
                    '&:hover': { bgcolor: '#e2e8f0' },
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium' }}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Resumen {data?.gestion}
              </Typography>
              {[
                { label: 'Inscripciones activas', value: stats?.inscripcionesActivas ?? 0 },
                { label: 'Total estudiantes', value: stats?.totalEstudiantes ?? 0 },
                { label: 'Pagos registrados', value: data?.financieros.totalPagos ?? 0 },
                { label: 'Ingresos totales', value: `Bs ${(data?.financieros.ingresosTotales ?? 0).toLocaleString('es-BO')}` },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f1f5f9' }}
                >
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{item.value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
