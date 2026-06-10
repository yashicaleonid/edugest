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

type Docente = {
  id: string;
  telefono?: string;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    ci: string;
    isActive: boolean;
  };
  cursos?: { id: string; nombre: string; paralelo: string }[];
};

type UsuarioForm = {
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
  password: string;
};

type EditDocenteForm = {
  telefono: string;
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
};

export default function DocentesPage() {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);

  const [usuarioForm, setUsuarioForm] = useState<UsuarioForm>({
    nombre: '', apellido: '', ci: '', email: '', password: '',
  });

  const [editForm, setEditForm] = useState<EditDocenteForm>({
    telefono: '', nombre: '', apellido: '', ci: '', email: '',
  });

  const fetchDocentes = async () => {
    try {
      const { data } = await api.get('/docentes');
      setDocentes(data);
    } catch {
      setError('Error al cargar docentes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocentes(); }, []);

  const handleSubmit = async () => {
    setError('');
    setSaving(true);
    try {
      const { data: usuario } = await api.post('/auth/register', {
        ...usuarioForm,
        role: 'DOCENTE',
      });
      await api.post('/docentes', { usuarioId: usuario.id });
      setOpen(false);
      setUsuarioForm({ nombre: '', apellido: '', ci: '', email: '', password: '' });
      fetchDocentes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar docente.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditOpen = (docente: Docente) => {
    setSelectedDocente(docente);
    setEditForm({
      telefono: docente.telefono || '',
      nombre: docente.usuario.nombre,
      apellido: docente.usuario.apellido,
      ci: docente.usuario.ci,
      email: docente.usuario.email,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedDocente) return;
    setError('');
    setSaving(true);
    try {
      // Actualizar perfil docente
      await api.patch(`/docentes/${selectedDocente.id}`, {
        telefono: editForm.telefono,
      });
      // Actualizar datos del usuario
      await api.patch(`/usuarios/${selectedDocente.usuario.id}`, {
        nombre: editForm.nombre,
        apellido: editForm.apellido,
        ci: editForm.ci,
        email: editForm.email,
      });
      setEditOpen(false);
      fetchDocentes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Docentes</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
          Nuevo Docente
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
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Teléfono</strong></TableCell>
                  <TableCell><strong>Cursos</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {docentes.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>{d.usuario.apellido}, {d.usuario.nombre}</TableCell>
                    <TableCell>{d.usuario.ci}</TableCell>
                    <TableCell>{d.usuario.email}</TableCell>
                    <TableCell>{d.telefono || '—'}</TableCell>
                    <TableCell>
                      <Chip label={`${d.cursos?.length || 0} curso(s)`} size="small" color="info" />
                    </TableCell>
                    <TableCell>
                      <Chip label={d.usuario.isActive ? 'Activo' : 'Inactivo'}
                        color={d.usuario.isActive ? 'success' : 'error'} size="small" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary" onClick={() => handleEditOpen(d)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {docentes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay docentes registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Dialog nuevo docente */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">Registrar Nuevo Docente</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="subtitle2" color="text.secondary" mt={1} mb={1}>Datos Personales</Typography>
          <Box display="flex" gap={2}>
            <TextField label="Nombre" fullWidth size="small" value={usuarioForm.nombre}
              onChange={(e) => setUsuarioForm({ ...usuarioForm, nombre: e.target.value })} />
            <TextField label="Apellido" fullWidth size="small" value={usuarioForm.apellido}
              onChange={(e) => setUsuarioForm({ ...usuarioForm, apellido: e.target.value })} />
          </Box>
          <TextField label="CI" fullWidth size="small" sx={{ mt: 2 }} value={usuarioForm.ci}
            onChange={(e) => setUsuarioForm({ ...usuarioForm, ci: e.target.value })} />
          <Typography variant="subtitle2" color="text.secondary" mt={3} mb={1}>Credenciales</Typography>
          <TextField label="Correo electrónico" fullWidth size="small" value={usuarioForm.email}
            onChange={(e) => setUsuarioForm({ ...usuarioForm, email: e.target.value })} />
          <TextField label="Contraseña" fullWidth size="small" type="password" sx={{ mt: 2 }}
            value={usuarioForm.password}
            onChange={(e) => setUsuarioForm({ ...usuarioForm, password: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving} sx={{ borderRadius: 2 }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog editar docente */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">
          Editar Docente — {selectedDocente?.usuario.apellido}, {selectedDocente?.usuario.nombre}
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
            <TextField label="Teléfono" fullWidth size="small" value={editForm.telefono}
              onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })} />
          </Box>
          <TextField label="Email" fullWidth size="small" sx={{ mt: 2 }} value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
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