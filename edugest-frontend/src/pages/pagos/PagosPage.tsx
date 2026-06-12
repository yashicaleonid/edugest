import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert, MenuItem, Tabs, Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptIcon from '@mui/icons-material/Receipt';
import api from '../../api/axios';

type Pago = {
  id: string; monto: number; metodoPago: string; mes: string; gestion: number; createdAt: string;
  inscripcion?: { estudiante?: { nombre: string; apellido: string; ci: string; padre?: { nombre: string; apellido: string; email?: string; telefono?: string } }; curso?: { nombre: string; nivel: string; paralelo: string } };
  cajero?: { nombre: string; apellido: string; email?: string };
  factura?: { estado: string; cuf?: string };
};
type Inscripcion = { id: string; gestion: number; estudiante?: { nombre: string; apellido: string }; curso?: { nombre: string; paralelo: string } };
type PagoForm = { inscripcionId: string; cajeroId: string; monto: string; metodoPago: string; mes: string; gestion: string };

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const METODOS = ['EFECTIVO','QR','TRANSFERENCIA'];

type Deuda = {
  inscripcionId: string;
  estudiante: string;
  curso: string;
  padre?: string;
  mesesPendientes: string[];
};

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [gestionDeudas, setGestionDeudas] = useState(new Date().getFullYear().toString());
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<Pago | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const userId = JSON.parse(localStorage.getItem('user') || '{}').id || '';
  const [form, setForm] = useState<PagoForm>({ inscripcionId: '', cajeroId: userId, monto: '1200', metodoPago: 'EFECTIVO', mes: '', gestion: new Date().getFullYear().toString() });

  const fetchData = async () => {
    try {
      const gestion = parseInt(gestionDeudas);
      const [pagosRes, inscripcionesRes, deudasRes] = await Promise.all([
        api.get('/pagos'),
        api.get('/inscripciones'),
        api.get(`/pagos/deudas/${gestion}`),
      ]);
      setPagos(pagosRes.data);
      setInscripciones(inscripcionesRes.data);
      setDeudas(deudasRes.data);
    } catch { setError('Error al cargar datos.'); }
    finally { setLoading(false); }
  };

  const emitirFactura = async (pagoId: string) => {
    try { await api.post(`/facturas/emitir/${pagoId}`); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || 'Error al emitir factura.'); }
  };

  const handleVerDetalle = async (id: string) => {
    setDetailLoading(true); setDetailOpen(true);
    try { const { data } = await api.get(`/pagos/${id}`); setDetailData(data); }
    catch { setDetailData(null); }
    finally { setDetailLoading(false); }
  };

  useEffect(() => { fetchData(); }, [gestionDeudas]);

  const handleSubmit = async () => {
    setError(''); setSaving(true);
    try {
      await api.post('/pagos', { ...form, monto: parseFloat(form.monto), gestion: parseInt(form.gestion) });
      setOpen(false);
      setForm({ inscripcionId: '', cajeroId: userId, monto: '1200', metodoPago: 'EFECTIVO', mes: '', gestion: new Date().getFullYear().toString() });
      fetchData();
    } catch (err: any) { setError(err.response?.data?.message || 'Error al registrar pago.'); }
    finally { setSaving(false); }
  };

  const getMetodoColor = (m: string) => m === 'EFECTIVO' ? 'success' : m === 'QR' ? 'info' : 'warning';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Pagos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>Registrar Pago</Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Historial de Pagos" />
        <Tab label={`Deudas (${deudas.length})`} />
      </Tabs>

      <Alert severity="info" sx={{ mb: 2 }}>
        Al registrar un pago se emite la factura electrónica automáticamente (CUCU) y se envía por correo al padre de familia.
      </Alert>

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box> : tab === 0 ? (
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
                    <TableCell>{p.inscripcion?.estudiante ? `${p.inscripcion.estudiante.apellido}, ${p.inscripcion.estudiante.nombre}` : '—'}</TableCell>
                    <TableCell>{p.inscripcion?.curso ? `${p.inscripcion.curso.nombre} ${p.inscripcion.curso.paralelo}` : '—'}</TableCell>
                    <TableCell>{p.mes} {p.gestion}</TableCell>
                    <TableCell><Typography sx={{ fontWeight: 'bold' }} color="success.main">Bs {Number(p.monto).toLocaleString('es-BO')}</Typography></TableCell>
                    <TableCell><Chip label={p.metodoPago} color={getMetodoColor(p.metodoPago) as any} size="small" /></TableCell>
                    <TableCell>{p.cajero ? `${p.cajero.nombre} ${p.cajero.apellido}` : '—'}</TableCell>
                    <TableCell><Chip label={p.factura ? p.factura.estado : 'Sin factura'} color={p.factura ? 'success' : 'default'} size="small" /></TableCell>
                    <TableCell>{new Date(p.createdAt).toLocaleDateString('es-BO')}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" color="primary" title="Ver detalle" onClick={() => handleVerDetalle(p.id)}><VisibilityIcon fontSize="small" /></IconButton>
                        {!p.factura && <IconButton size="small" color="success" title="Emitir Factura" onClick={() => emitirFactura(p.id)}><ReceiptIcon fontSize="small" /></IconButton>}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {pagos.length === 0 && <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay pagos registrados.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField label="Gestión" size="small" value={gestionDeudas}
              onChange={(e) => setGestionDeudas(e.target.value)} sx={{ width: 120 }} />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell><strong>Estudiante</strong></TableCell>
                  <TableCell><strong>Curso</strong></TableCell>
                  <TableCell><strong>Meses pendientes</strong></TableCell>
                  <TableCell><strong>Email padre</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deudas.map((d) => (
                  <TableRow key={d.inscripcionId} hover>
                    <TableCell>{d.estudiante}</TableCell>
                    <TableCell>{d.curso}</TableCell>
                    <TableCell>{d.mesesPendientes.join(', ')}</TableCell>
                    <TableCell>{d.padre || '—'}</TableCell>
                  </TableRow>
                ))}
                {deudas.length === 0 && (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay deudas pendientes.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Modal nuevo pago */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Registrar Pago</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField select fullWidth label="Inscripción (Estudiante)" size="small" sx={{ mt: 2 }}
            value={form.inscripcionId} onChange={(e) => setForm({ ...form, inscripcionId: e.target.value })}>
            {inscripciones.map((i) => <MenuItem key={i.id} value={i.id}>{i.estudiante?.apellido}, {i.estudiante?.nombre} — {i.curso?.nombre} {i.curso?.paralelo} ({i.gestion})</MenuItem>)}
          </TextField>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField select fullWidth label="Mes" size="small" value={form.mes} onChange={(e) => setForm({ ...form, mes: e.target.value })}>
              {MESES.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Gestión" size="small" value={form.gestion} onChange={(e) => setForm({ ...form, gestion: e.target.value })} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField fullWidth label="Monto (Bs)" size="small" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} />
            <TextField select fullWidth label="Método de Pago" size="small" value={form.metodoPago} onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}>
              {METODOS.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField>
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>Se enviará un correo de confirmación al padre/madre si tiene email registrado.</Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving} sx={{ borderRadius: 2 }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Registrar Pago'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal detalle pago */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Detalle de Pago</DialogTitle>
        <DialogContent>
          {detailLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box> : detailData ? (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>Estudiante</Typography>
              <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2, mb: 2 }}>
                <Typography><b>Nombre:</b> {detailData.inscripcion?.estudiante?.apellido}, {detailData.inscripcion?.estudiante?.nombre}</Typography>
                <Typography><b>CI:</b> {detailData.inscripcion?.estudiante?.ci || '—'}</Typography>
                <Typography><b>Padre/Madre:</b> {detailData.inscripcion?.estudiante?.padre ? `${detailData.inscripcion.estudiante.padre.nombre} ${detailData.inscripcion.estudiante.padre.apellido}` : '—'}</Typography>
                <Typography><b>Email padre:</b> {detailData.inscripcion?.estudiante?.padre?.email || '—'}</Typography>
              </Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Pago</Typography>
              <Box sx={{ bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2, p: 2, mb: 2 }}>
                <Typography><b>Monto:</b> <span style={{ color: '#15803d', fontWeight: 'bold', fontSize: 18 }}>Bs {Number(detailData.monto).toLocaleString('es-BO')}</span></Typography>
                <Typography><b>Mes:</b> {detailData.mes} {detailData.gestion}</Typography>
                <Typography><b>Método:</b> {detailData.metodoPago}</Typography>
                <Typography><b>Cajero:</b> {detailData.cajero ? `${detailData.cajero.nombre} ${detailData.cajero.apellido}` : '—'}</Typography>
                <Typography><b>Fecha:</b> {new Date(detailData.createdAt).toLocaleDateString('es-BO')}</Typography>
              </Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Factura</Typography>
              <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2 }}>
                <Chip label={detailData.factura ? `Estado: ${detailData.factura.estado}` : 'Sin factura emitida'} color={detailData.factura ? 'success' : 'default'} />
                {detailData.factura?.cuf && <Typography sx={{ mt: 1, fontSize: 12 }}><b>CUF:</b> {detailData.factura.cuf}</Typography>}
              </Box>
            </Box>
          ) : <Alert severity="error">No se pudo cargar el detalle.</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDetailOpen(false)} variant="contained" sx={{ borderRadius: 2 }}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}