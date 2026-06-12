import { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, CircularProgress, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../api/axios';

type Padre = {
  id: string;
  nombre: string;
  apellido: string;
  ci: string;
  telefono?: string;
  email?: string;
  estudiantes?: { id: string; nombre: string; apellido: string }[];
};

type PadreForm = { nombre: string; apellido: string; ci: string; telefono: string; email: string };

export default function PadresPage() {
  const [padres, setPadres] = useState<Padre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Padre | null>(null);
  const [form, setForm] = useState<PadreForm>({ nombre: '', apellido: '', ci: '', telefono: '', email: '' });

  const fetchPadres = async () => {
    try {
      const { data } = await api.get('/padres');
      setPadres(data);
    } catch {
      setError('Error al cargar padres de familia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPadres(); }, []);

  const handleCreate = async () => {
    try {
      await api.post('/padres', form);
      setOpen(false);
      setForm({ nombre: '', apellido: '', ci: '', telefono: '', email: '' });
      fetchPadres();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar padre.');
    }
  };

  const handleEdit = async () => {
    if (!selected) return;
    try {
      await api.patch(`/padres/${selected.id}`, form);
      setEditOpen(false);
      fetchPadres();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar padre.');
    }
  };

  const openEdit = (padre: Padre) => {
    setSelected(padre);
    setForm({
      nombre: padre.nombre,
      apellido: padre.apellido,
      ci: padre.ci,
      telefono: padre.telefono || '',
      email: padre.email || '',
    });
    setEditOpen(true);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Padres de Familia</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
          Nuevo Padre
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>CI</strong></TableCell>
              <TableCell><strong>Teléfono</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Estudiantes</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {padres.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.nombre} {p.apellido}</TableCell>
                <TableCell>{p.ci}</TableCell>
                <TableCell>{p.telefono || '-'}</TableCell>
                <TableCell>{p.email || '-'}</TableCell>
                <TableCell>{p.estudiantes?.length || 0}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Padre de Familia</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <TextField label="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
          <TextField label="CI" value={form.ci} onChange={(e) => setForm({ ...form, ci: e.target.value })} />
          <TextField label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Padre de Familia</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <TextField label="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
          <TextField label="CI" value={form.ci} onChange={(e) => setForm({ ...form, ci: e.target.value })} />
          <TextField label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleEdit}>Guardar cambios</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
