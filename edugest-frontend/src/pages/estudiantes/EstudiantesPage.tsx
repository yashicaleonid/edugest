import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../api/axios';

type Padre = {
  id: string;
  nombre: string;
  apellido: string;
  telefono?: string;
};

type Estudiante = {
  id: string;
  nombre: string;
  apellido: string;
  ci: string;
  fechaNac: string;
  isActive: boolean;
  padre?: Padre;
};

type PadreForm = {
  nombre: string;
  apellido: string;
  ci: string;
  telefono: string;
  email: string;
};

type EstudianteForm = {
  nombre: string;
  apellido: string;
  ci: string;
  fechaNac: string;
};

export default function EstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);

  const [padreForm, setPadreForm] = useState<PadreForm>({
    nombre: '', apellido: '', ci: '', telefono: '', email: '',
  });

  const [estudianteForm, setEstudianteForm] = useState<EstudianteForm>({
    nombre: '', apellido: '', ci: '', fechaNac: '',
  });

  const [editForm, setEditForm] = useState<EstudianteForm>({
    nombre: '', apellido: '', ci: '', fechaNac: '',
  });

  const fetchEstudiantes = async () => {
    try {
      const { data } = await api.get('/estudiantes');
      setEstudiantes(data);
    } catch {
      setError('Error al cargar estudiantes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  const handleSubmit = async () => {
    setError('');
    setSaving(true);
    try {
      const { data: padre } = await api.post('/padres', padreForm);
      await api.post('/estudiantes', {
        ...estudianteForm,
        padreId: padre.id,
      });
      setOpen(false);
      setPadreForm({ nombre: '', apellido: '', ci: '', telefono: '', email: '' });
      setEstudianteForm({ nombre: '', apellido: '', ci: '', fechaNac: '' });
      fetchEstudiantes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditOpen = (estudiante: Estudiante) => {
    setSelectedEstudiante(estudiante);
    setEditForm({
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      ci: estudiante.ci,
      fechaNac: estudiante.fechaNac.split('T')[0],
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedEstudiante) return;
    setError('');
    setSaving(true);
    try {
      await api.patch(`/estudiantes/${selectedEstudiante.id}`, editForm);
      setEditOpen(false);
      fetchEstudiantes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Estudiantes</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
          Nuevo Estudiante
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell><strong>Nombre</strong></TableCell>
                  <TableCell><strong>CI</strong></TableCell>
                  <TableCell><strong>Fecha Nac.</strong></TableCell>
                  <TableCell><strong>Padre/Madre</strong></TableCell>
                  <TableCell><strong>Teléfono</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {estudiantes.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell>{e.apellido}, {e.nombre}</TableCell>
                    <TableCell>{e.ci}</TableCell>
                    <TableCell>{new Date(e.fechaNac).toLocaleDateString('es-BO')}</TableCell>
                    <TableCell>{e.padre ? `${e.padre.nombre} ${e.padre.apellido}` : '—'}</TableCell>
                    <TableCell>{e.padre?.telefono || '—'}</TableCell>
                    <TableCell>
                      <Chip label={e.isActive ? 'Activo' : 'Inactivo'} color={e.isActive ? 'success' : 'error'} size="small" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary" onClick={() => handleEditOpen(e)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {estudiantes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay estudiantes registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Dialog nuevo estudiante */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">Registrar Nuevo Estudiante</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="subtitle2" color="text.secondary" mt={1} mb={1}>
            Datos del Padre/Madre de Familia
          </Typography>
          <Box display="flex" gap={2}>
            <TextField label="Nombre" fullWidth size="small" value={padreForm.nombre}
              onChange={(e) => setPadreForm({ ...padreForm, nombre: e.target.value })} />
            <TextField label="Apellido" fullWidth size="small" value={padreForm.apellido}
              onChange={(e) => setPadreForm({ ...padreForm, apellido: e.target.value })} />
          </Box>
          <Box display="flex" gap={2} mt={2}>
            <TextField label="CI" fullWidth size="small" value={padreForm.ci}
              onChange={(e) => setPadreForm({ ...padreForm, ci: e.target.value })} />
            <TextField label="Teléfono" fullWidth size="small" value={padreForm.telefono}
              onChange={(e) => setPadreForm({ ...padreForm, telefono: e.target.value })} />
          </Box>
          <TextField label="Email" fullWidth size="small" sx={{ mt: 2 }} value={padreForm.email}
            onChange={(e) => setPadreForm({ ...padreForm, email: e.target.value })} />

          <Typography variant="subtitle2" color="text.secondary" mt={3} mb={1}>
            Datos del Estudiante
          </Typography>
          <Box display="flex" gap={2}>
            <TextField label="Nombre" fullWidth size="small" value={estudianteForm.nombre}
              onChange={(e) => setEstudianteForm({ ...estudianteForm, nombre: e.target.value })} />
            <TextField label="Apellido" fullWidth size="small" value={estudianteForm.apellido}
              onChange={(e) => setEstudianteForm({ ...estudianteForm, apellido: e.target.value })} />
          </Box>
          <Box display="flex" gap={2} mt={2}>
            <TextField label="CI" fullWidth size="small" value={estudianteForm.ci}
              onChange={(e) => setEstudianteForm({ ...estudianteForm, ci: e.target.value })} />
            <TextField label="Fecha de Nacimiento" fullWidth size="small" type="date"
              InputLabelProps={{ shrink: true }} value={estudianteForm.fechaNac}
              onChange={(e) => setEstudianteForm({ ...estudianteForm, fechaNac: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving} sx={{ borderRadius: 2 }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog editar estudiante */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">
          Editar Estudiante — {selectedEstudiante?.apellido}, {selectedEstudiante?.nombre}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box display="flex" gap={2} mt={1}>
            <TextField label="Nombre" fullWidth size="small" value={editForm.nombre}
              onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} />
            <TextField label="Apellido" fullWidth size="small" value={editForm.apellido}
              onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })} />
          </Box>
          <Box display="flex" gap={2} mt={2}>
            <TextField label="CI" fullWidth size="small" value={editForm.ci}
              onChange={(e) => setEditForm({ ...editForm, ci: e.target.value })} />
            <TextField label="Fecha de Nacimiento" fullWidth size="small" type="date"
              InputLabelProps={{ shrink: true }} value={editForm.fechaNac}
              onChange={(e) => setEditForm({ ...editForm, fechaNac: e.target.value })} />
          </Box>
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