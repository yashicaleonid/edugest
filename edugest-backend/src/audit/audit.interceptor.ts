import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip } = request;

    const METODOS_AUDITADOS = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!METODOS_AUDITADOS.includes(method)) return next.handle();

    const modulo = url.split('/')[1] || 'desconocido';
    const accion = `${method} ${url}`;

    return next.handle().pipe(
      tap(() => {
        this.prisma.db.auditLog
          .create({
            data: {
              usuarioId: user?.id ?? null,
              accion,
              modulo,
              detalle: `${method} en ${url}`,
              ip: ip ?? null,
            },
          })
          .catch(() => {});
      }),
    );
  }
}