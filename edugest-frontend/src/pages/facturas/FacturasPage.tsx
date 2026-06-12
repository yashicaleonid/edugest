import { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Chip, Alert, CircularProgress,
  IconButton, Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmailIcon from '@mui/icons-material/Email';
import CancelIcon from '@mui/icons-material/Cancel';
import VerifiedIcon from '@mui/icons-material/Verified';
import api from '../../api/axios';
import type { Factura } from '../../types';

export default function FacturasPage() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchFacturas = async () => {
    try {
      const { data } = await api.get('/facturas');
      setFacturas(data);
    } catch {
      setError('Error al cargar facturas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFacturas(); }, []);

  const handleReenviar = async (id: string) => {
    try {
      const { data } = await api.post(`/facturas/${id}/reenviar`);
      setSuccess(data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reenviar factura.');
    }
  };

  const handleValidar = async (id: string) => {
    try {
      const { data } = await api.get(`/facturas/${id}/validar`);
      setSuccess(data.mensaje || 'Factura validada.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al validar factura.');
    }
  };

  const handleAnular = async (id: string) => {
    if (!confirm('¿Está seguro de anular esta factura?')) return;
    try {
      await api.patch(`/facturas/${id}/anular`);
      fetchFacturas();
      setSuccess('Factura anulada.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al anular factura.');
    }
  };

  const estadoColor = (estado: string) => {
    if (estado === 'EMITIDA') return 'success';
    if (estado === 'ANULADA') return 'error';
    return 'warning';
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Facturación Electrónica</Typography>
        <Button startIcon={<RefreshIcon />} onClick={fetchFacturas}>Actualizar</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell><strong>N° Factura</strong></TableCell>
              <TableCell><strong>CUF</strong></TableCell>
              <TableCell><strong>Estudiante</strong></TableCell>
              <TableCell><strong>Monto</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {facturas.map((f: any) => (
              <TableRow key={f.id} hover>
                <TableCell>{f.nroFactura}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{f.cuf}</TableCell>
                <TableCell>
                  {f.pago?.inscripcion?.estudiante?.nombre} {f.pago?.inscripcion?.estudiante?.apellido}
                </TableCell>
                <TableCell>Bs {Number(f.pago?.monto || 0).toLocaleString('es-BO')}</TableCell>
                <TableCell><Chip label={f.estado} color={estadoColor(f.estado) as any} size="small" /></TableCell>
                <TableCell>{new Date(f.fechaEmision).toLocaleDateString('es-BO')}</TableCell>
                <TableCell>
                  <Tooltip title="Reenviar por correo">
                    <IconButton size="small" onClick={() => handleReenviar(f.id)}><EmailIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Validar ante SIN">
                    <IconButton size="small" onClick={() => handleValidar(f.id)}><VerifiedIcon /></IconButton>
                  </Tooltip>
                  {f.pdfUrl && (
                    <Button size="small" href={f.pdfUrl} target="_blank">PDF</Button>
                  )}
                  {f.estado !== 'ANULADA' && (
                    <Tooltip title="Anular">
                      <IconButton size="small" color="error" onClick={() => handleAnular(f.id)}><CancelIcon /></IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
