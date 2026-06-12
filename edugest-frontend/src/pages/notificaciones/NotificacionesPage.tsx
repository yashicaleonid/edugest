import { useEffect, useState } from 'react';
import {
  Box, Typography, List, ListItem, ListItemText, ListItemButton,
  Chip, Alert, CircularProgress, Button, Paper,
} from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import type { Notificacion } from '../../types';

export default function NotificacionesPage() {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotificaciones = async () => {
    if (!user) return;
    try {
      const { data } = await api.get(`/notificaciones/usuario/${user.id}`);
      setNotificaciones(data);
    } catch {
      setError('Error al cargar notificaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotificaciones(); }, [user]);

  const marcarLeida = async (id: string) => {
    await api.patch(`/notificaciones/${id}/leer`);
    fetchNotificaciones();
  };

  const marcarTodasLeidas = async () => {
    if (!user) return;
    await api.patch(`/notificaciones/usuario/${user.id}/leer-todas`);
    fetchNotificaciones();
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  const noLeidas = notificaciones.filter((n) => !n.leido).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Notificaciones</Typography>
          {noLeidas > 0 && (
            <Typography variant="body2" color="text.secondary">{noLeidas} sin leer</Typography>
          )}
        </Box>
        {noLeidas > 0 && (
          <Button startIcon={<MarkEmailReadIcon />} onClick={marcarTodasLeidas}>
            Marcar todas como leídas
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ borderRadius: 3 }}>
        <List>
          {notificaciones.length === 0 ? (
            <ListItem><ListItemText primary="No hay notificaciones." /></ListItem>
          ) : (
            notificaciones.map((n) => (
              <ListItemButton key={n.id} onClick={() => !n.leido && marcarLeida(n.id)}
                sx={{ bgcolor: n.leido ? 'transparent' : '#eff6ff', borderBottom: '1px solid #f1f5f9' }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {n.titulo}
                      {!n.leido && <Chip label="Nueva" size="small" color="primary" />}
                    </Box>
                  }
                  secondary={
                    <>
                      {n.mensaje}
                      <Typography variant="caption" sx={{ display: 'block' }} color="text.secondary">
                        {new Date(n.createdAt).toLocaleString('es-BO')}
                      </Typography>
                    </>
                  }
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
}
