import { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Chip, IconButton,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import api from '../../api/axios';

type Documento = {
  id: string;
  nombre: string;
  url: string;
  categoria: string;
  mimeType?: string;
  size?: number;
  createdAt: string;
  estudiante?: { nombre: string; apellido: string };
};

const CATEGORIAS = [
  { value: 'FOTO_ESTUDIANTE', label: 'Foto de Estudiante' },
  { value: 'COMPROBANTE_PAGO', label: 'Comprobante de Pago' },
  { value: 'DOCUMENTO_INSTITUCIONAL', label: 'Documento Institucional' },
  { value: 'OTRO', label: 'Otro' },
];

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categoria, setCategoria] = useState('OTRO');
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocumentos = async () => {
    try {
      const { data } = await api.get('/documentos');
      setDocumentos(data);
    } catch {
      setError('Error al cargar documentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocumentos(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/documentos/upload?categoria=${categoria}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Documento subido exitosamente.');
      fetchDocumentos();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al subir documento.');
    }

    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este documento?')) return;
    try {
      await api.delete(`/documentos/${id}`);
      fetchDocumentos();
      setSuccess('Documento eliminado.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar.');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>Gestión Documental</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Categoría</InputLabel>
          <Select value={categoria} label="Categoría" onChange={(e) => setCategoria(e.target.value)}>
            {CATEGORIAS.map((c) => (
              <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => fileRef.current?.click()}>
          Subir Archivo
        </Button>
        <input ref={fileRef} type="file" hidden onChange={handleUpload} />
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Categoría</strong></TableCell>
              <TableCell><strong>Estudiante</strong></TableCell>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documentos.map((d) => (
              <TableRow key={d.id} hover>
                <TableCell>{d.nombre}</TableCell>
                <TableCell><Chip label={d.categoria.replace(/_/g, ' ')} size="small" /></TableCell>
                <TableCell>
                  {d.estudiante ? `${d.estudiante.nombre} ${d.estudiante.apellido}` : '-'}
                </TableCell>
                <TableCell>{new Date(d.createdAt).toLocaleDateString('es-BO')}</TableCell>
                <TableCell>
                  <IconButton size="small" href={d.url} target="_blank"><OpenInNewIcon /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(d.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
