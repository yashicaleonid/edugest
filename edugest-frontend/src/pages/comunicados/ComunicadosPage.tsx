import { useState } from 'react';
import {
  Box, Button, Card, CardContent, TextField,
  Typography, Alert, CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import api from '../../api/axios';

export default function ComunicadosPage() {
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');

  const handleEnviar = async () => {
    if (!titulo.trim() || !mensaje.trim()) {
      setError('El título y el mensaje son obligatorios.');
      return;
    }

    setLoading(true);
    setExito('');
    setError('');

    try {
      const res = await api.post(
        `/reportes/comunicado?titulo=${encodeURIComponent(titulo)}&mensaje=${encodeURIComponent(mensaje)}`,
      );
      setExito(res.data.message || 'Comunicado enviado exitosamente.');
      setTitulo('');
      setMensaje('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar el comunicado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
        Comunicados Institucionales
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Envía un comunicado por correo electrónico a todos los padres de familia registrados.
        </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
          {exito && <Alert severity="success">{exito}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Título del comunicado"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            fullWidth
            disabled={loading}
          />

          <TextField
            label="Mensaje"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            fullWidth
            multiline
            rows={6}
            disabled={loading}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
              onClick={handleEnviar}
              disabled={loading}
              sx={{ borderRadius: 2, px: 4 }}
            >
              {loading ? 'Enviando...' : 'Enviar comunicado'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}