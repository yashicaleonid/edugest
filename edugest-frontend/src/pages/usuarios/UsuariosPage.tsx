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
 
type Usuario = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  ci: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};
 
type UsuarioForm = {
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
  password: string;
  role: string;
};
 
type EditUsuarioForm = {
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
  role: string;
  isActive: boolean;
};
 
const ROLES = ['ADMINISTRADOR', 'DIRECTOR', 'CAJERO', 'DOCENTE'];
 
const ROLE_COLORS: Record<string, 'error' | 'warning' | 'info' | 'secondary'> = {
  ADMINISTRADOR: 'error',
  DIRECTOR: 'warning',
  CAJERO: 'info',
  DOCENTE: 'secondary',
};
 
export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
 
  const [form, setForm] = useState<UsuarioForm>({
    nombre: '', apellido: '', ci: '', email: '', password: '', role: 'ADMINISTRADOR',
  });
 
  const [editForm, setEditForm] = useState<EditUsuarioForm>({
    nombre: '', apellido: '', ci: '', email: '', role: '', isActive: true,
  });
 
  const fetchUsuarios = async () => {
    try {
      const { data } = await api.get('/usuarios');
      setUsuarios(data);
    } catch {
      setError('Error al cargar usuarios.');
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { fetchUsuarios(); }, []);
 
  const handleSubmit = async () => {
    setError('');
    setSaving(true);
    try {
      await api.post('/auth/register', form);
      setOpen(false);
      setForm({ nombre: '', apellido: '', ci: '', email: '', password: '', role: 'ADMINISTRADOR' });
      fetchUsuarios();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear usuario.');
    } finally {
      setSaving(false);
    }
  };
 
  const handleEditOpen = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setEditForm({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      ci: usuario.ci,
      email: usuario.email,
      role: usuario.role,
      isActive: usuario.isActive,
    });
    setEditOpen(true);
  };
 
  const handleEditSubmit = async () => {
    if (!selectedUsuario) return;
    setError('');
    setSaving(true);
    try {
      await api.patch(`/usuarios/${selectedUsuario.id}`, editForm);
      setEditOpen(false);
      fetchUsuarios();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar usuario.');
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Usuarios del Sistema</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
          Nuevo Usuario
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
                  <TableCell><strong>Nombre</strong></TableCell>
                  <TableCell><strong>CI</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Rol</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Creado</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.apellido}, {u.nombre}</TableCell>
                    <TableCell>{u.ci}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip label={u.role} color={ROLE_COLORS[u.role] || 'default'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={u.isActive ? 'Activo' : 'Inactivo'}
                        color={u.isActive ? 'success' : 'error'} size="small" />
                    </TableCell>
                    <TableCell>{new Date(u.createdAt).toLocaleDateString('es-BO')}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary" onClick={() => handleEditOpen(u)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {usuarios.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay usuarios registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
 
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Crear Nuevo Usuario</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField label="Nombre" fullWidth size="small" value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <TextField label="Apellido" fullWidth size="small" value={form.apellido}
              onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField label="CI" fullWidth size="small" value={form.ci}
              onChange={(e) => setForm({ ...form, ci: e.target.value })} />
            <TextField select fullWidth label="Rol" size="small" value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
          </Box>
          <TextField label="Correo electrónico" fullWidth size="small" sx={{ mt: 2 }}
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Contraseña" fullWidth size="small" type="password" sx={{ mt: 2 }}
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving} sx={{ borderRadius: 2 }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Crear Usuario'}
          </Button>
        </DialogActions>
      </Dialog>
 
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Editar Usuario — {selectedUsuario?.apellido}, {selectedUsuario?.nombre}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField label="Nombre" fullWidth size="small" value={editForm.nombre}
              onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} />
            <TextField label="Apellido" fullWidth size="small" value={editForm.apellido}
              onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField label="CI" fullWidth size="small" value={editForm.ci}
              onChange={(e) => setEditForm({ ...editForm, ci: e.target.value })} />
            <TextField label="Email" fullWidth size="small" value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField select fullWidth label="Rol" size="small" value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
              {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Estado" size="small"
              value={editForm.isActive ? 'true' : 'false'}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}>
              <MenuItem value="true">Activo</MenuItem>
              <MenuItem value="false">Inactivo</MenuItem>
            </TextField>
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