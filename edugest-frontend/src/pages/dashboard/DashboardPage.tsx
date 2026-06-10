import { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import PaymentsIcon from '@mui/icons-material/Payments';
import EventNoteIcon from '@mui/icons-material/EventNote';
import api from '../../api/axios';

type Stats = {
  estudiantes: number;
  docentes: number;
  pagosHoy: number;
  asistenciaHoy: number;
};

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
};

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" mb={0.5}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: color,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    estudiantes: 0,
    docentes: 0,
    pagosHoy: 0,
    asistenciaHoy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [estudiantesRes, docentesRes, pagosRes, asistenciaRes] = await Promise.all([
          api.get('/estudiantes'),
          api.get('/docentes'),
          api.get('/pagos'),
          api.get('/asistencia/curso/all').catch(() => ({ data: [] })),
        ]);

        const hoy = new Date().toISOString().split('T')[0];
        const pagosHoy = pagosRes.data.filter((p: any) =>
          p.createdAt?.startsWith(hoy)
        ).length;

        setStats({
          estudiantes: estudiantesRes.data.length,
          docentes: docentesRes.data.length,
          pagosHoy,
          asistenciaHoy: asistenciaRes.data.length,
        });
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Panel Principal
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Estudiantes"
            value={stats.estudiantes}
            icon={<SchoolIcon sx={{ color: 'white', fontSize: 28 }} />}
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Docentes"
            value={stats.docentes}
            icon={<PersonIcon sx={{ color: 'white', fontSize: 28 }} />}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pagos Hoy"
            value={stats.pagosHoy}
            icon={<PaymentsIcon sx={{ color: 'white', fontSize: 28 }} />}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Asistencias Hoy"
            value={stats.asistenciaHoy}
            icon={<EventNoteIcon sx={{ color: 'white', fontSize: 28 }} />}
            color="#8b5cf6"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Accesos Rápidos
              </Typography>
              {[
                { label: '+ Registrar estudiante', path: '/estudiantes' },
                { label: '+ Registrar pago', path: '/pagos' },
                { label: '+ Registrar asistencia', path: '/asistencia' },
                { label: '+ Agregar docente', path: '/docentes' },
              ].map((item) => (
                <Box
                  key={item.path}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#e2e8f0' },
                  }}
                  onClick={() => window.location.href = item.path}
                >
                  <Typography variant="body2" color="primary" fontWeight="medium">
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Información del Sistema
              </Typography>
              {[
                { label: 'Sistema', value: 'EduGest v1.0' },
                { label: 'Institución', value: 'Colegio Privado' },
                { label: 'Gestión', value: new Date().getFullYear().toString() },
                { label: 'Estado', value: '✅ Operativo' },
              ].map((item) => (
                <Box
                  key={item.label}
                  display="flex"
                  justifyContent="space-between"
                  sx={{ py: 1, borderBottom: '1px solid #f1f5f9' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}