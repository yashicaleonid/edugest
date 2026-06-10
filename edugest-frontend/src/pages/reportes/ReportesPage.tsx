import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button,
  CircularProgress, Alert, Divider, Grid,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import PaymentsIcon from '@mui/icons-material/Payments';
import EventNoteIcon from '@mui/icons-material/EventNote';
import api from '../../api/axios';
import {
  exportarPagosPDF,
  exportarPagosExcel,
  exportarAsistenciaPDF,
  exportarAsistenciaExcel,
} from '../../utils/reportes';

export default function ReportesPage() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pagosRes, inscripcionesRes] = await Promise.all([
          api.get('/pagos'),
          api.get('/inscripciones'),
        ]);

        setPagos(pagosRes.data);

        // Cargar asistencia de todas las inscripciones
        const asistenciasPromises = inscripcionesRes.data.map((i: any) =>
          api.get(`/asistencia/inscripcion/${i.id}`).catch(() => ({ data: [] }))
        );
        const asistenciasRes = await Promise.all(asistenciasPromises);
        const todasAsistencias = asistenciasRes.flatMap((r: any) => r.data);
        setAsistencias(todasAsistencias);
      } catch {
        setError('Error al cargar datos para reportes.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        Reportes
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>

        {/* Reporte de Pagos */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <PaymentsIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Reporte de Pagos
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {pagos.length} registros disponibles
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={() => exportarPagosPDF(pagos)}
                  disabled={pagos.length === 0}
                  sx={{ borderRadius: 2, flex: 1 }}
                >
                  Exportar PDF
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<TableChartIcon />}
                  onClick={() => exportarPagosExcel(pagos)}
                  disabled={pagos.length === 0}
                  sx={{ borderRadius: 2, flex: 1 }}
                >
                  Exportar Excel
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Reporte de Asistencia */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <EventNoteIcon color="success" />
                <Typography variant="h6" fontWeight="bold">
                  Reporte de Asistencia
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {asistencias.length} registros disponibles
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={() => exportarAsistenciaPDF(asistencias)}
                  disabled={asistencias.length === 0}
                  sx={{ borderRadius: 2, flex: 1 }}
                >
                  Exportar PDF
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<TableChartIcon />}
                  onClick={() => exportarAsistenciaExcel(asistencias)}
                  disabled={asistencias.length === 0}
                  sx={{ borderRadius: 2, flex: 1 }}
                >
                  Exportar Excel
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}