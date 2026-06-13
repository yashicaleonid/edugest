import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

type Evento = {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha: string;
  lugar?: string;
  creadoPor?: { nombre: string; apellido: string };
};

export default function EventosPage() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ titulo: '', descripcion: '', fecha: '', lugar: '' });

  const fetchEventos = async () => {
    try {
      const { data } = await api.get('/eventos');
      setEventos(data);
    } catch { setError('Error al cargar eventos.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEventos(); }, []);

  const handleSubmit = async () => {
    if (!form.titulo || !form.fecha) { setError('El título y la fecha son obligatorios.'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/eventos', { ...form, creadoPorId: user?.id });
      setOpen(false);
      setForm({ titulo: '', descripcion: '', fecha: '', lugar: '' });
      fetchEventos();
    } catch (err: any) { setError(err.response?.data?.message || 'Error al crear evento.'); }
    finally { setSaving(false); }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este evento?')) return;
    try {
      await api.delete(`/eventos/${id}`);
      fetchEventos();
    } catch { setError('Error al eliminar evento.'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Eventos Académicos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
          Nuevo Evento
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box> : (
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell><strong>Título</strong></TableCell>
                  <TableCell><strong>Fecha</strong></TableCell>
                  <TableCell><strong>Lugar</strong></TableCell>
                  <TableCell><strong>Descripción</strong></TableCell>
                  <TableCell><strong>Creado por</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {eventos.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><EventIcon fontSize="small" color="primary" />{e.titulo}</Box></TableCell>
                    <TableCell>{new Date(e.fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}</TableCell>
                    <TableCell>{e.lugar || '—'}</TableCell>
                    <TableCell>{e.descripcion || '—'}</TableCell>
                    <TableCell>{e.creadoPor ? `${e.creadoPor.nombre} ${e.creadoPor.apellido}` : '—'}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" title="Eliminar" onClick={() => handleEliminar(e.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {eventos.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay eventos registrados.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Nuevo Evento</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Título" size="small" sx={{ mt: 2 }}
            value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          <TextField fullWidth label="Fecha" type="datetime-local" size="small" sx={{ mt: 2 }}
            value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }} />
          <TextField fullWidth label="Lugar (opcional)" size="small" sx={{ mt: 2 }}
            value={form.lugar} onChange={(e) => setForm({ ...form, lugar: e.target.value })} />
          <TextField fullWidth label="Descripción (opcional)" size="small" sx={{ mt: 2 }}
            multiline rows={3} value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          <Alert severity="info" sx={{ mt: 2 }}>Se notificará a todos los padres de familia por correo.</Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving} sx={{ borderRadius: 2 }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Crear evento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}