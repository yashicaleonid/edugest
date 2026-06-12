export type Usuario = {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  ci: string;
  role: 'ADMINISTRADOR' | 'DIRECTOR' | 'CAJERO' | 'DOCENTE';
  isActive: boolean;
  createdAt: string;
}

export type Estudiante = {
  id: string;
  nombre: string;
  apellido: string;
  ci: string;
  fechaNac: string;
  foto?: string;
  isActive: boolean;
  padreId: string;
  padre?: PadreFamilia;
}

export type PadreFamilia = {
  id: string;
  nombre: string;
  apellido: string;
  ci: string;
  telefono?: string;
  email?: string;
}

export type Docente = {
  id: string;
  telefono?: string;
  usuarioId: string;
  usuario: Usuario;
}

export type Curso = {
  id: string;
  nombre: string;
  nivel: string;
  paralelo: string;
  turno: string;
  gestion: number;
  cupo?: number;
  docenteId?: string;
  docente?: Docente;
}

export type Inscripcion = {
  id: string;
  gestion: number;
  estado: string;
  estudianteId: string;
  cursoId: string;
  estudiante?: Estudiante;
  curso?: Curso;
}

export type Pago = {
  id: string;
  monto: number;
  metodoPago: string;
  mes: string;
  gestion: number;
  createdAt: string;
  inscripcionId: string;
  cajeroId: string;
  inscripcion?: Inscripcion;
  cajero?: Usuario;
  factura?: Factura;
}

export type Factura = {
  id: string;
  cuf: string;
  nroFactura: number;
  estado: string;
  pdfUrl?: string;
  fechaEmision: string;
  pagoId: string;
}

export type Notificacion = {
  id: string;
  titulo: string;
  mensaje: string;
  leido: boolean;
  createdAt: string;
  usuarioId: string;
}

export type AuthResponse = {
  access_token: string;
  user: Usuario;
}