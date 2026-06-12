import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import api from '../../api/axios';
 
type Asistencia = {
  id: string;
  fecha: string;
  estado: string;
  inscripcion?: {
    estudiante?: { nombre: string; apellido: string };
    curso?: { nombre: string; paralelo: string };
  };
};
 
type Inscripcion = {
  id: string;
  gestion: number;
  estudiante?: { nombre: string; apellido: string };
  curso?: { nombre: string; paralelo: string };
};
 
type Curso = {
  id: string;
  nombre: string;
  paralelo: string;
  gestion: number;
};
 
const ESTADOS = ['PRESENTE', 'AUSENTE', 'RETRASO', 'PERMISO'];
 
export default function AsistenciaPage() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
 
  const hoy = new Date().toISOString().split('T')[0];
  const [registros, setRegistros] = useState<{ inscripcionId: string; estado: string }[]>([]);
  const [fecha, setFecha] = useState(hoy);
 
  const fetchData = async () => {
    try {
      const [inscripcionesRes, cursosRes] = await Promise.all([
        api.get('/inscripciones'),
        api.get('/cursos'),
      ]);
      setInscripciones(inscripcionesRes.data);
      setCursos(cursosRes.data);
    } catch {
      setError('Error al cargar datos.');
    } finally {
      setLoading(false);
    }
  };
 
  const fetchAsistenciasCurso = async (cursoId: string) => {
    try {
      const { data } = await api.get(`/asistencia/curso/${cursoId}`);
      setAsistencias(data);
    } catch {
      setAsistencias([]);
    }
  };
 
  useEffect(() => { fetchData(); }, []);
 
  const handleCursoChange = (cursoId: string) => {
    setCursoSeleccionado(cursoId);
    fetchAsistenciasCurso(cursoId);
    const inscripcionesCurso = inscripciones.filter(
      (i) => i.curso && cursos.find((c) => c.id === cursoId)
        ? i.curso.nombre === cursos.find((c) => c.id === cursoId)?.nombre
        : false
    );
    setRegistros(inscripcionesCurso.map((i) => ({ inscripcionId: i.id, estado: 'PRESENTE' })));
  };
 
  const handleOpenDialog = () => {
    setRegistros(inscripciones.map((i) => ({ inscripcionId: i.id, estado: 'PRESENTE' })));
    setOpen(true);
  };
 
  const handleEstadoChange = (inscripcionId: string, estado: string) => {
    setRegistros((prev) =>
      prev.map((r) => r.inscripcionId === inscripcionId ? { ...r, estado } : r)
    );
  };
 
  const handleSubmit = async () => {
    setError('');
    setSaving(true);
    try {
      await api.post('/asistencia/masiva', { fecha, registros });
      setOpen(false);
      if (cursoSeleccionado) fetchAsistenciasCurso(cursoSeleccionado);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar asistencia.');
    } finally {
      setSaving(false);
    }
  };
 
  const getEstadoColor = (estado: string) => {
    if (estado === 'PRESENTE') return 'success';
    if (estado === 'AUSENTE') return 'error';
    return 'warning';
  };
 
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Asistencia</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog} sx={{ borderRadius: 2 }}>
          Registrar Asistencia
        </Button>
      </Box>
 
      <Card sx={{ borderRadius: 3, boxShadow: 2, p: 2, mb: 3 }}>
        <TextField
          select label="Filtrar por Curso" size="small" sx={{ minWidth: 300 }}
          value={cursoSeleccionado}
          onChange={(e) => handleCursoChange(e.target.value)}
        >
          {cursos.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.nombre} {c.paralelo} ({c.gestion})
            </MenuItem>
          ))}
        </TextField>
      </Card>
 
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell><strong>Estudiante</strong></TableCell>
                  <TableCell><strong>Curso</strong></TableCell>
                  <TableCell><strong>Fecha</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {asistencias.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      {a.inscripcion?.estudiante
                        ? `${a.inscripcion.estudiante.apellido}, ${a.inscripcion.estudiante.nombre}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {a.inscripcion?.curso
                        ? `${a.inscripcion.curso.nombre} ${a.inscripcion.curso.paralelo}`
                        : '—'}
                    </TableCell>
                    <TableCell>{new Date(a.fecha).toLocaleDateString('es-BO')}</TableCell>
                    <TableCell>
                      <Chip label={a.estado} color={getEstadoColor(a.estado) as any} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
                {asistencias.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      {cursoSeleccionado
                        ? 'No hay registros de asistencia para este curso.'
                        : 'Selecciona un curso para ver la asistencia.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
 
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Registrar Asistencia</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth label="Fecha" type="date" size="small" sx={{ mt: 2, mb: 3 }}
            slotProps={{ inputLabel: { shrink: true } }}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Marcar estado por estudiante
          </Typography>
          {inscripciones.map((i) => (
            <Box
              key={i.id}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f1f5f9' }}
            >
              <Typography variant="body2">
                {i.estudiante?.apellido}, {i.estudiante?.nombre}
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  {i.curso?.nombre} {i.curso?.paralelo}
                </Typography>
              </Typography>
              <TextField
                select size="small" sx={{ minWidth: 130 }}
                value={registros.find((r) => r.inscripcionId === i.id)?.estado || 'PRESENTE'}
                onChange={(e) => handleEstadoChange(i.id, e.target.value)}
              >
                {ESTADOS.map((estado) => (
                  <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                ))}
              </TextField>
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving} sx={{ borderRadius: 2 }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Guardar Asistencia'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
 