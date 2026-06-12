import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button,
  CircularProgress, Alert, Divider, Grid, TextField,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import PaymentsIcon from '@mui/icons-material/Payments';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
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
  const [resumen, setResumen] = useState<any>(null);
  const [deudas, setDeudas] = useState<any>(null);
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gestion, setGestion] = useState(new Date().getFullYear());
  const [comunicado, setComunicado] = useState({ titulo: '', mensaje: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pagosRes, asistRes, resumenRes, deudasRes, inscripcionesRes] = await Promise.all([
          api.get('/pagos'),
          api.get(`/reportes/asistencia?gestion=${gestion}`),
          api.get(`/reportes/resumen?gestion=${gestion}`),
          api.get(`/reportes/deudas?gestion=${gestion}`),
          api.get(`/reportes/inscripciones?gestion=${gestion}`),
        ]);
        setPagos(pagosRes.data);
        setAsistencias(asistRes.data.registros || []);
        setResumen(resumenRes.data);
        setDeudas(deudasRes.data);
        setInscripciones(inscripcionesRes.data);
      } catch {
        setError('Error al cargar datos para reportes.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [gestion]);

  const enviarAvisosDeuda = async () => {
    try {
      const { data } = await api.post(`/reportes/enviar-avisos-deuda?gestion=${gestion}`);
      setSuccess(data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar avisos.');
    }
  };

  const enviarComunicado = async () => {
    try {
      const { data } = await api.post(
        `/reportes/comunicado?titulo=${encodeURIComponent(comunicado.titulo)}&mensaje=${encodeURIComponent(comunicado.mensaje)}`,
      );
      setSuccess(data.message);
      setComunicado({ titulo: '', mensaje: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar comunicado.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Reportes y Estadísticas</Typography>
        <TextField
          label="Gestión"
          type="number"
          size="small"
          value={gestion}
          onChange={(e) => setGestion(parseInt(e.target.value))}
          sx={{ width: 120 }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {resumen && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ borderRadius: 2 }}><CardContent>
              <Typography variant="caption" color="text.secondary">Estudiantes Activos</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{resumen.academicos.estudiantesActivos}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ borderRadius: 2 }}><CardContent>
              <Typography variant="caption" color="text.secondary">Inscripciones</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{resumen.academicos.inscripcionesActivas}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ borderRadius: 2 }}><CardContent>
              <Typography variant="caption" color="text.secondary">Ingresos Totales</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Bs {resumen.financieros.ingresosTotales.toLocaleString('es-BO')}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ borderRadius: 2 }}><CardContent>
              <Typography variant="caption" color="text.secondary">Deudores</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }} color="error">{deudas?.totalDeudores || 0}</Typography>
            </CardContent></Card>
          </Grid>
          {resumen.financieros.pagosPorMetodo?.map((m: any) => (
            <Grid size={{ xs: 6, md: 3 }} key={m.metodo}>
              <Card sx={{ borderRadius: 2 }}><CardContent>
                <Typography variant="caption" color="text.secondary">Pagos {m.metodo}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Bs {m.total.toLocaleString('es-BO')}</Typography>
                <Typography variant="caption">{m.cantidad} transacciones</Typography>
              </CardContent></Card>
            </Grid>
          ))}
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ borderRadius: 2 }}><CardContent>
              <Typography variant="caption" color="text.secondary">Usuarios activos</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{resumen.administrativos.usuariosActivos}</Typography>
            </CardContent></Card>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PaymentsIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Reporte de Pagos</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {pagos.length} registros disponibles
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" color="error" startIcon={<PictureAsPdfIcon />}
                  onClick={() => exportarPagosPDF(pagos)} disabled={pagos.length === 0}
                  sx={{ borderRadius: 2, flex: 1 }}>Exportar PDF</Button>
                <Button variant="contained" color="success" startIcon={<TableChartIcon />}
                  onClick={() => exportarPagosExcel(pagos)} disabled={pagos.length === 0}
                  sx={{ borderRadius: 2, flex: 1 }}>Exportar Excel</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EventNoteIcon color="success" />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Reporte de Asistencia</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {asistencias.length} registros disponibles
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" color="error" startIcon={<PictureAsPdfIcon />}
                  onClick={() => exportarAsistenciaPDF(asistencias)} disabled={asistencias.length === 0}
                  sx={{ borderRadius: 2, flex: 1 }}>Exportar PDF</Button>
                <Button variant="contained" color="success" startIcon={<TableChartIcon />}
                  onClick={() => exportarAsistenciaExcel(asistencias)} disabled={asistencias.length === 0}
                  sx={{ borderRadius: 2, flex: 1 }}>Exportar Excel</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EmailIcon color="warning" />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Avisos de Deuda</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {deudas?.totalDeudores || 0} estudiantes con pagos pendientes
              </Typography>
              <Button variant="contained" color="warning" startIcon={<EmailIcon />}
                onClick={enviarAvisosDeuda} disabled={!deudas?.totalDeudores}
                sx={{ borderRadius: 2 }}>
                Enviar avisos por correo
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SchoolIcon color="info" />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Reporte de Inscripciones</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {inscripciones.length} inscripciones en gestión {gestion}
              </Typography>
              <Typography variant="body2">
                Activas: {inscripciones.filter((i) => i.estado === 'ACTIVO').length} |
                Retiradas: {inscripciones.filter((i) => i.estado === 'RETIRADO').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SchoolIcon color="info" />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Comunicado Institucional</Typography>
              </Box>
              <TextField fullWidth label="Título" size="small" sx={{ mb: 1 }}
                value={comunicado.titulo} onChange={(e) => setComunicado({ ...comunicado, titulo: e.target.value })} />
              <TextField fullWidth label="Mensaje" multiline rows={3} size="small" sx={{ mb: 2 }}
                value={comunicado.mensaje} onChange={(e) => setComunicado({ ...comunicado, mensaje: e.target.value })} />
              <Button variant="contained" startIcon={<EmailIcon />}
                onClick={enviarComunicado}
                disabled={!comunicado.titulo || !comunicado.mensaje}
                sx={{ borderRadius: 2 }}>
                Enviar a padres de familia
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
