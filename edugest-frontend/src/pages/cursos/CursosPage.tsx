import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../api/axios';

type Curso = {
  id: string;
  nombre: string;
  nivel: string;
  paralelo: string;
  turno: string;
  gestion: number;
  cupo?: number;
  docente?: {
    id: string;
    usuario: { nombre: string; apellido: string };
  };
  _count?: { inscripciones: number };
};

type Docente = {
  id: string;
  usuario: { nombre: string; apellido: string };
};

type CursoForm = {
  nombre: string;
  nivel: string;
  paralelo: string;
  turno: string;
  gestion: string;
  cupo: string;
  docenteId: string;
};

const NIVELES = ['Primaria', 'Secundaria'];
const TURNOS = ['Mañana', 'Tarde', 'Noche'];
const PARALELOS = ['A', 'B', 'C', 'D'];

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);

  const [form, setForm] = useState<CursoForm>({
    nombre: '', nivel: '', paralelo: 'A', turno: 'Mañana',
    gestion: new Date().getFullYear().toString(), cupo: '30', docenteId: '',
  });

  const [editForm, setEditForm] = useState<CursoForm>({
    nombre: '', nivel: '', paralelo: 'A', turno: 'Mañana',
    gestion: new Date().getFullYear().toString(), cupo: '30', docenteId: '',
  });

  const fetchData = async () => {
    try {
      const [cursosRes, docentesRes] = await Promise.all([
        api.get('/cursos'),
        api.get('/docentes'),
      ]);
      setCursos(cursosRes.data);
      setDocentes(docentesRes.data);
    } catch {
      setError('Error al cargar datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    setError('');
    setSaving(true);
    try {
      await api.post('/cursos', {
        ...form,
        gestion: parseInt(form.gestion),
        cupo: parseInt(form.cupo),
        docenteId: form.docenteId || undefined,
      });
      setOpen(false);
      setForm({ nombre: '', nivel: '', paralelo: 'A', turno: 'Mañana',
        gestion: new Date().getFullYear().toString(), cupo: '30', docenteId: '' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear curso.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditOpen = (curso: Curso) => {
    setSelectedCurso(curso);
    setEditForm({
      nombre: curso.nombre,
      nivel: curso.nivel,
      paralelo: curso.paralelo,
      turno: curso.turno,
      gestion: curso.gestion.toString(),
      cupo: (curso.cupo ?? 30).toString(),
      docenteId: curso.docente?.id || '',
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedCurso) return;
    setError('');
    setSaving(true);
    try {
      await api.patch(`/cursos/${selectedCurso.id}`, {
        ...editForm,
        gestion: parseInt(editForm.gestion),
        cupo: parseInt(editForm.cupo),
        docenteId: editForm.docenteId || undefined,
      });
      setEditOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar curso.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Cursos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
          Nuevo Curso
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell><strong>Curso</strong></TableCell>
                  <TableCell><strong>Nivel</strong></TableCell>
                  <TableCell><strong>Paralelo</strong></TableCell>
                  <TableCell><strong>Turno</strong></TableCell>
                  <TableCell><strong>Gestión</strong></TableCell>
                  <TableCell><strong>Docente</strong></TableCell>
                  <TableCell><strong>Cupo</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cursos.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>{c.nombre}</TableCell>
                    <TableCell>
                      <Chip label={c.nivel} color={c.nivel === 'Primaria' ? 'info' : 'secondary'} size="small" />
                    </TableCell>
                    <TableCell>{c.paralelo}</TableCell>
                    <TableCell>{c.turno}</TableCell>
                    <TableCell>{c.gestion}</TableCell>
                    <TableCell>
                      {c.docente
                        ? `${c.docente.usuario.apellido}, ${c.docente.usuario.nombre}`
                        : <Chip label="Sin docente" size="small" />}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${c._count?.inscripciones || 0}/${c.cupo ?? 30}`}
                        size="small"
                        color={(c._count?.inscripciones || 0) >= (c.cupo ?? 30) ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary" onClick={() => handleEditOpen(c)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {cursos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay cursos registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Crear Nuevo Curso</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField label="Nombre del Curso" fullWidth size="small" sx={{ mt: 2 }}
            value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField select fullWidth label="Nivel" size="small" value={form.nivel}
              onChange={(e) => setForm({ ...form, nivel: e.target.value })}>
              {NIVELES.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Paralelo" size="small" value={form.paralelo}
              onChange={(e) => setForm({ ...form, paralelo: e.target.value })}>
              {PARALELOS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField select fullWidth label="Turno" size="small" value={form.turno}
              onChange={(e) => setForm({ ...form, turno: e.target.value })}>
              {TURNOS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Gestión" size="small" value={form.gestion}
              onChange={(e) => setForm({ ...form, gestion: e.target.value })} />
          </Box>
          <TextField fullWidth label="Cupo máximo" size="small" sx={{ mt: 2 }} type="number"
            value={form.cupo} onChange={(e) => setForm({ ...form, cupo: e.target.value })} />
          <TextField select fullWidth label="Docente Asignado" size="small" sx={{ mt: 2 }}
            value={form.docenteId} onChange={(e) => setForm({ ...form, docenteId: e.target.value })}>
            <MenuItem value="">Sin docente asignado</MenuItem>
            {docentes.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.usuario.apellido}, {d.usuario.nombre}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving} sx={{ borderRadius: 2 }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Crear Curso'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Editar Curso — {selectedCurso?.nombre}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField label="Nombre del Curso" fullWidth size="small" sx={{ mt: 2 }}
            value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField select fullWidth label="Nivel" size="small" value={editForm.nivel}
              onChange={(e) => setEditForm({ ...editForm, nivel: e.target.value })}>
              {NIVELES.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Paralelo" size="small" value={editForm.paralelo}
              onChange={(e) => setEditForm({ ...editForm, paralelo: e.target.value })}>
              {PARALELOS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField select fullWidth label="Turno" size="small" value={editForm.turno}
              onChange={(e) => setEditForm({ ...editForm, turno: e.target.value })}>
              {TURNOS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Gestión" size="small" value={editForm.gestion}
              onChange={(e) => setEditForm({ ...editForm, gestion: e.target.value })} />
          </Box>
          <TextField fullWidth label="Cupo máximo" size="small" sx={{ mt: 2 }} type="number"
            value={editForm.cupo} onChange={(e) => setEditForm({ ...editForm, cupo: e.target.value })} />
          <TextField select fullWidth label="Docente Asignado" size="small" sx={{ mt: 2 }}
            value={editForm.docenteId} onChange={(e) => setEditForm({ ...editForm, docenteId: e.target.value })}>
            <MenuItem value="">Sin docente asignado</MenuItem>
            {docentes.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.usuario.apellido}, {d.usuario.nombre}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleEditSubmit} disabled={saving} sx={{ borderRadius: 2 }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}