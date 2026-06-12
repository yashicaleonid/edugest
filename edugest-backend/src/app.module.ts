import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { EstudiantesModule } from './estudiantes/estudiantes.module';
import { PadresModule } from './padres/padres.module';
import { DocentesModule } from './docentes/docentes.module';
import { CursosModule } from './cursos/cursos.module';
import { InscripcionesModule } from './inscripciones/inscripciones.module';
import { PagosModule } from './pagos/pagos.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { FacturasModule } from './facturas/facturas.module';
import { MailModule } from './mail/mail.module';
import { DocumentosModule } from './documentos/documentos.module';
import { ReportesModule } from './reportes/reportes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MailModule,
    AuthModule,
    UsuariosModule,
    EstudiantesModule,
    PadresModule,
    DocentesModule,
    CursosModule,
    InscripcionesModule,
    PagosModule,
    AsistenciaModule,
    NotificacionesModule,
    FacturasModule,
    DocumentosModule,
    ReportesModule,
  ],
})
export class AppModule {}