import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../api/axios';

type Inscripcion = {
  id: string;
  gestion: number;
  estado: string;
  createdAt: string;
  estudiante?: { id: string; nombre: string; apellido: string; ci: string; fechaNac?: string; padre?: { nombre: string; apellido: string; telefono?: string; email?: string } };
  curso?: { nombre: string; nivel: string; paralelo: string; turno: string; gestion: number };
  pagos?: any[];
  asistencias?: any[];
};

type Estudiante = { id: string; nombre: string; apellido: string; ci: string };
type Curso = { id: string; nombre: string; nivel: string; paralelo: string; turno: string; gestion: number };
type InscripcionForm = { estudianteId: string; cursoId: string; gestion: string };

const ESTADO_COLORS: Record<string, 'success' | 'error' | 'warning'> = {
  ACTIVO: 'success', RETIRADO: 'error', SUSPENDIDO: 'warning',
};

export default function InscripcionesPage() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<Inscripcion | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<InscripcionForm>({
    estudianteId: '', cursoId: '', gestion: new Date().getFullYear().toString(),
  });

  const fetchData = async () => {
    try {
      const [inscripcionesRes, estudiantesRes, cursosRes] = await Promise.all([
        api.get('/inscripciones'), api.get('/estudiantes'), api.get('/cursos'),
      ]);
      setInscripciones(inscripcionesRes.data);
      setEstudiantes(estudiantesRes.data);
      setCursos(cursosRes.data);
    } catch { setError('Error al cargar datos.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleVerDetalle = async (id: string) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const { data } = await api.get(`/inscripciones/${id}`);
      setDetailData(data);
    } catch { setDetailData(null); }
    finally { setDetailLoading(false); }
  };

  const handleSubmit = async () => {
    setError(''); setSaving(true);
    try {
      await api.post('/inscripciones', { ...form, gestion: parseInt(form.gestion) });
      setOpen(false);
      setForm({ estudianteId: '', cursoId: '', gestion: new Date().getFullYear().toString() });
      fetchData();
    } catch (err: any) { setError(err.response?.data?.message || 'Error al inscribir.'); }
    finally { setSaving(false); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Inscripciones</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
          Nueva Inscripción
        </Button>
      </Box>

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box> : (
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell><strong>Estudiante</strong></TableCell>
                  <TableCell><strong>CI</strong></TableCell>
                  <TableCell><strong>Curso</strong></TableCell>
                  <TableCell><strong>Nivel</strong></TableCell>
                  <TableCell><strong>Turno</strong></TableCell>
                  <TableCell><strong>Gestión</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inscripciones.map((i) => (
                  <TableRow key={i.id} hover>
                    <TableCell>{i.estudiante ? `${i.estudiante.apellido}, ${i.estudiante.nombre}` : '—'}</TableCell>
                    <TableCell>{i.estudiante?.ci || '—'}</TableCell>
                    <TableCell>{i.curso ? `${i.curso.nombre} ${i.curso.paralelo}` : '—'}</TableCell>
                    <TableCell>{i.curso && <Chip label={i.curso.nivel} color={i.curso.nivel === 'Primaria' ? 'info' : 'secondary'} size="small" />}</TableCell>
                    <TableCell>{i.curso?.turno || '—'}</TableCell>
                    <TableCell>{i.gestion}</TableCell>
                    <TableCell><Chip label={i.estado} color={ESTADO_COLORS[i.estado] || 'default'} size="small" /></TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary" title="Ver detalle" onClick={() => handleVerDetalle(i.id)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {inscripciones.length === 0 && (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay inscripciones registradas.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Modal nueva inscripción */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Nueva Inscripción</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField select fullWidth label="Estudiante" size="small" sx={{ mt: 2 }}
            value={form.estudianteId} onChange={(e) => setForm({ ...form, estudianteId: e.target.value })}>
            {estudiantes.map((e) => <MenuItem key={e.id} value={e.id}>{e.apellido}, {e.nombre} — CI: {e.ci}</MenuItem>)}
          </TextField>
          <TextField select fullWidth label="Curso" size="small" sx={{ mt: 2 }}
            value={form.cursoId} onChange={(e) => setForm({ ...form, cursoId: e.target.value })}>
            {cursos.map((c) => <MenuItem key={c.id} value={c.id}>{c.nombre} {c.paralelo} — {c.nivel} | {c.turno} ({c.gestion})</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Gestión" size="small" sx={{ mt: 2 }}
            value={form.gestion} onChange={(e) => setForm({ ...form, gestion: e.target.value })} />
          <Alert severity="info" sx={{ mt: 2 }}>Se enviará un correo de confirmación al padre/madre si tiene email registrado.</Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving} sx={{ borderRadius: 2 }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Inscribir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal detalle inscripción */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Detalle de Inscripción</DialogTitle>
        <DialogContent>
          {detailLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box> : detailData ? (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>Estudiante</Typography>
              <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2, mb: 2 }}>
                <Typography><b>Nombre:</b> {detailData.estudiante?.apellido}, {detailData.estudiante?.nombre}</Typography>
                <Typography><b>CI:</b> {detailData.estudiante?.ci}</Typography>
              </Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Padre/Madre</Typography>
              <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2, mb: 2 }}>
                <Typography><b>Nombre:</b> {detailData.estudiante?.padre ? `${detailData.estudiante.padre.nombre} ${detailData.estudiante.padre.apellido}` : '—'}</Typography>
                <Typography><b>Teléfono:</b> {detailData.estudiante?.padre?.telefono || '—'}</Typography>
                <Typography><b>Email:</b> {detailData.estudiante?.padre?.email || '—'}</Typography>
              </Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Curso</Typography>
              <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2, mb: 2 }}>
                <Typography><b>Curso:</b> {detailData.curso?.nombre} {detailData.curso?.paralelo}</Typography>
                <Typography><b>Nivel:</b> {detailData.curso?.nivel}</Typography>
                <Typography><b>Turno:</b> {detailData.curso?.turno}</Typography>
                <Typography><b>Gestión:</b> {detailData.gestion}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip label={`Estado: ${detailData.estado}`} color={ESTADO_COLORS[detailData.estado] || 'default'} />
                <Chip label={`${detailData.pagos?.length || 0} pagos`} color="success" variant="outlined" />
                <Chip label={`${detailData.asistencias?.length || 0} asistencias`} color="info" variant="outlined" />
              </Box>
            </Box>
          ) : <Alert severity="error">No se pudo cargar el detalle.</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDetailOpen(false)} variant="contained" sx={{ borderRadius: 2 }}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}