import type { Usuario } from '../types';

export type Modulo =
  | 'dashboard'
  | 'usuarios'
  | 'estudiantes'
  | 'padres'
  | 'inscripciones'
  | 'docentes'
  | 'cursos'
  | 'pagos'
  | 'facturas'
  | 'asistencia'
  | 'documentos'
  | 'reportes'
  | 'notificaciones';

const PERMISOS: Record<Usuario['role'], Modulo[]> = {
  ADMINISTRADOR: [
    'dashboard', 'usuarios', 'estudiantes', 'padres', 'inscripciones',
    'docentes', 'cursos', 'pagos', 'facturas', 'asistencia', 'documentos',
    'reportes', 'notificaciones',
  ],
  DIRECTOR: [
    'dashboard', 'usuarios', 'estudiantes', 'padres', 'inscripciones',
    'docentes', 'cursos', 'pagos', 'facturas', 'asistencia', 'documentos',
    'reportes', 'notificaciones',
  ],
  CAJERO: [
    'dashboard', 'estudiantes', 'padres', 'inscripciones', 'pagos',
    'facturas', 'reportes', 'notificaciones',
  ],
  DOCENTE: [
    'dashboard', 'estudiantes', 'cursos', 'asistencia', 'documentos', 'notificaciones',
  ],
};

export function puedeAcceder(role: Usuario['role'], modulo: Modulo): boolean {
  return PERMISOS[role]?.includes(modulo) ?? false;
}

export function modulosPermitidos(role: Usuario['role']): Modulo[] {
  return PERMISOS[role] ?? [];
}
