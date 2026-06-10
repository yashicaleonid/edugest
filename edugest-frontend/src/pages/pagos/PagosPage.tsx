import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../api/axios';
import ReceiptIcon from '@mui/icons-material/Receipt';

type Pago = {
  id: string;
  monto: number;
  metodoPago: string;
  mes: string;
  gestion: number;
  createdAt: string;
  inscripcion?: {
    estudiante?: { nombre: string; apellido: string; ci: string };
    curso?: { nombre: string; nivel: string; paralelo: string };
  };
  cajero?: { nombre: string; apellido: string };
  factura?: { estado: string };
};

type Inscripcion = {
  id: string;
  gestion: number;
  estudiante?: { nombre: string; apellido: string };
  curso?: { nombre: string; paralelo: string };
};

type PagoForm = {
  inscripcionId: string;
  cajeroId: string;
  monto: string;
  metodoPago: string;
  mes: string;
  gestion: string;
};

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const METODOS = ['EFECTIVO', 'QR', 'TRANSFERENCIA'];

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const userId = JSON.parse(localStorage.getItem('user') || '{}').id || '';

  const [form, setForm] = useState<PagoForm>({
    inscripcionId: '',
    cajeroId: userId,
    monto: '1200',
    metodoPago: 'EFECTIVO',
    mes: '',
    gestion: new Date().getFullYear().toString(),
  });

  const fetchData = async () => {
    try {
      const [pagosRes, inscripcionesRes] = await Promise.all([
        api.get('/pagos'),
        api.get('/inscripciones'),
      ]);
      setPagos(pagosRes.data);
      setInscripciones(inscripcionesRes.data);
    } catch {
      setError('Error al cargar datos.');
    } finally {
      setLoading(false);
    }
  };
const emitirFactura = async (pagoId: string) => {
  try {
    await api.post(`/facturas/emitir/${pagoId}`);
    fetchData();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Error al emitir factura.');
  }
};
  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    setError('');
    setSaving(true);
    try {
      await api.post('/pagos', {
        ...form,
        monto: parseFloat(form.monto),
        gestion: parseInt(form.gestion),
      });
      setOpen(false);
      setForm({
        inscripcionId: '',
        cajeroId: userId,
        monto: '1200',
        metodoPago: 'EFECTIVO',
        mes: '',
        gestion: new Date().getFullYear().toString(),
      });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar pago.');
    } finally {
      setSaving(false);
    }
  };

  const getMetodoColor = (metodo: string) => {
    if (metodo === 'EFECTIVO') return 'success';
    if (metodo === 'QR') return 'info';
    return 'warning';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Pagos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Registrar Pago
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell><strong>Estudiante</strong></TableCell>
                  <TableCell><strong>Curso</strong></TableCell>
                  <TableCell><strong>Mes</strong></TableCell>
                  <TableCell><strong>Monto</strong></TableCell>
                  <TableCell><strong>Método</strong></TableCell>
                  <TableCell><strong>Cajero</strong></TableCell>
                  <TableCell><strong>Factura</strong></TableCell>
                  <TableCell><strong>Fecha</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagos.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      {p.inscripcion?.estudiante
                        ? `${p.inscripcion.estudiante.apellido}, ${p.inscripcion.estudiante.nombre}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {p.inscripcion?.curso
                        ? `${p.inscripcion.curso.nombre} ${p.inscripcion.curso.paralelo}`
                        : '—'}
                    </TableCell>
                    <TableCell>{p.mes} {p.gestion}</TableCell>
                    <TableCell>
                      <Typography fontWeight="bold" color="success.main">
                        Bs {Number(p.monto).toLocaleString('es-BO')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={p.metodoPago}
                        color={getMetodoColor(p.metodoPago) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {p.cajero ? `${p.cajero.nombre} ${p.cajero.apellido}` : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={p.factura ? p.factura.estado : 'Sin factura'}
                        color={p.factura ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(p.createdAt).toLocaleDateString('es-BO')}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell>
  <Box display="flex" gap={0.5}>
    <IconButton size="small" color="primary">
      <VisibilityIcon fontSize="small" />
    </IconButton>
    {!p.factura && (
      <IconButton
        size="small"
        color="success"
        title="Emitir Factura"
        onClick={() => emitirFactura(p.id)}
      >
        <ReceiptIcon fontSize="small" />
      </IconButton>
    )}
  </Box>
</TableCell>
                  </TableRow>
                  
                ))}
                {pagos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay pagos registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Dialog para registrar pago */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">Registrar Pago</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            select fullWidth label="Inscripción (Estudiante)" size="small" sx={{ mt: 2 }}
            value={form.inscripcionId}
            onChange={(e) => setForm({ ...form, inscripcionId: e.target.value })}
          >
            {inscripciones.map((i) => (
              <MenuItem key={i.id} value={i.id}>
                {i.estudiante?.apellido}, {i.estudiante?.nombre} — {i.curso?.nombre} {i.curso?.paralelo} ({i.gestion})
              </MenuItem>
            ))}
          </TextField>

          <Box display="flex" gap={2} mt={2}>
            <TextField
              select fullWidth label="Mes" size="small"
              value={form.mes}
              onChange={(e) => setForm({ ...form, mes: e.target.value })}
            >
              {MESES.map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth label="Gestión" size="small"
              value={form.gestion}
              onChange={(e) => setForm({ ...form, gestion: e.target.value })}
            />
          </Box>

          <Box display="flex" gap={2} mt={2}>
            <TextField
              fullWidth label="Monto (Bs)" size="small"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
            />
            <TextField
              select fullWidth label="Método de Pago" size="small"
              value={form.metodoPago}
              onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}
            >
              {METODOS.map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            sx={{ borderRadius: 2 }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Registrar Pago'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}