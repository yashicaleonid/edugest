import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async enviarConfirmacionInscripcion(data: {
    emailPadre: string;
    nombrePadre: string;
    nombreEstudiante: string;
    apellidoEstudiante: string;
    curso: string;
    gestion: number;
  }) {
    if (!process.env.MAIL_USER) {
      this.logger.warn('Correo no configurado. Saltando envio.');
      return;
    }
    try {
      await this.transporter.sendMail({
        from: `"EduGest" <${process.env.MAIL_USER}>`,
        to: data.emailPadre,
        subject: `Confirmacion de Inscripcion - ${data.nombreEstudiante} ${data.apellidoEstudiante}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px">
          <div style="background:#1976d2;padding:20px;border-radius:6px 6px 0 0;text-align:center">
            <h1 style="color:white;margin:0">EduGest</h1>
            <p style="color:#bbdefb;margin:4px 0 0">Sistema de Gestion Escolar</p>
          </div>
          <div style="padding:24px">
            <p>Estimado/a <strong>${data.nombrePadre}</strong>,</p>
            <p style="color:#6b7280">La inscripcion ha sido registrada exitosamente.</p>
            <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:16px;margin:16px 0">
              <h3 style="color:#0369a1;margin:0 0 10px">Detalle de Inscripcion</h3>
              <p><b>Estudiante:</b> ${data.nombreEstudiante} ${data.apellidoEstudiante}</p>
              <p><b>Curso:</b> ${data.curso}</p>
              <p><b>Gestion:</b> ${data.gestion}</p>
            </div>
          </div>
          <div style="background:#f8fafc;padding:12px;text-align:center;border-radius:0 0 6px 6px">
            <p style="color:#9ca3af;font-size:12px;margin:0">EduGest</p>
          </div>
        </div>`,
      });
      this.logger.log('Correo de inscripcion enviado a ' + data.emailPadre);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error('Error enviando correo de inscripcion: ' + msg);
    }
  }

  async enviarConfirmacionPago(data: {
    emailPadre: string;
    nombrePadre: string;
    nombreEstudiante: string;
    apellidoEstudiante: string;
    curso: string;
    mes: string;
    gestion: number;
    monto: number;
    metodoPago: string;
    cajero: string;
  }) {
    if (!process.env.MAIL_USER) {
      this.logger.warn('Correo no configurado. Saltando envio.');
      return;
    }
    try {
      await this.transporter.sendMail({
        from: `"EduGest" <${process.env.MAIL_USER}>`,
        to: data.emailPadre,
        subject: `Confirmacion de Pago - ${data.mes} ${data.gestion}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px">
          <div style="background:#1976d2;padding:20px;border-radius:6px 6px 0 0;text-align:center">
            <h1 style="color:white;margin:0">EduGest</h1>
            <p style="color:#bbdefb;margin:4px 0 0">Sistema de Gestion Escolar</p>
          </div>
          <div style="padding:24px">
            <p>Estimado/a <strong>${data.nombrePadre}</strong>,</p>
            <p style="color:#6b7280">Su pago ha sido registrado exitosamente.</p>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:16px;margin:16px 0">
              <h3 style="color:#15803d;margin:0 0 10px">Comprobante de Pago</h3>
              <p><b>Estudiante:</b> ${data.nombreEstudiante} ${data.apellidoEstudiante}</p>
              <p><b>Curso:</b> ${data.curso}</p>
              <p><b>Mes:</b> ${data.mes} ${data.gestion}</p>
              <p><b>Monto:</b> <span style="color:#15803d;font-size:18px;font-weight:bold">Bs ${Number(data.monto).toLocaleString('es-BO')}</span></p>
              <p><b>Metodo:</b> ${data.metodoPago}</p>
              <p><b>Cajero:</b> ${data.cajero}</p>
              <p><b>Fecha:</b> ${new Date().toLocaleDateString('es-BO')}</p>
            </div>
          </div>
          <div style="background:#f8fafc;padding:12px;text-align:center;border-radius:0 0 6px 6px">
            <p style="color:#9ca3af;font-size:12px;margin:0">EduGest</p>
          </div>
        </div>`,
      });
      this.logger.log('Correo de pago enviado a ' + data.emailPadre);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error('Error enviando correo de pago: ' + msg);
    }
  }

  async enviarRecuperacionPassword(data: { email: string; nombre: string; resetToken: string }) {
    if (!process.env.MAIL_USER) {
      this.logger.warn('Correo no configurado. Token: ' + data.resetToken);
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${data.resetToken}`;

    try {
      await this.transporter.sendMail({
        from: `"EduGest" <${process.env.MAIL_USER}>`,
        to: data.email,
        subject: 'Recuperación de Contraseña - EduGest',
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px">
          <div style="background:#1976d2;padding:20px;border-radius:6px 6px 0 0;text-align:center">
            <h1 style="color:white;margin:0">EduGest</h1>
          </div>
          <div style="padding:24px">
            <p>Estimado/a <strong>${data.nombre}</strong>,</p>
            <p style="color:#6b7280">Recibimos una solicitud para restablecer su contraseña.</p>
            <a href="${resetUrl}" style="display:inline-block;background:#1976d2;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin:16px 0">Restablecer Contraseña</a>
            <p style="color:#9ca3af;font-size:12px">Este enlace expira en 1 hora. Si no solicitó este cambio, ignore este correo.</p>
          </div>
        </div>`,
      });
      this.logger.log('Correo de recuperación enviado a ' + data.email);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error('Error enviando correo de recuperación: ' + msg);
    }
  }

  async enviarAvisoDeuda(data: {
    emailPadre: string;
    nombrePadre: string;
    nombreEstudiante: string;
    apellidoEstudiante: string;
    mesesPendientes: string[];
    gestion: number;
  }) {
    if (!process.env.MAIL_USER) return;

    try {
      await this.transporter.sendMail({
        from: `"EduGest" <${process.env.MAIL_USER}>`,
        to: data.emailPadre,
        subject: `Aviso de Deuda Pendiente - ${data.gestion}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px">
          <div style="background:#dc2626;padding:20px;border-radius:6px 6px 0 0;text-align:center">
            <h1 style="color:white;margin:0">Aviso de Deuda</h1>
          </div>
          <div style="padding:24px">
            <p>Estimado/a <strong>${data.nombrePadre}</strong>,</p>
            <p>Le informamos que el estudiante <strong>${data.nombreEstudiante} ${data.apellidoEstudiante}</strong> tiene pagos pendientes.</p>
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:16px;margin:16px 0">
              <p><b>Gestión:</b> ${data.gestion}</p>
              <p><b>Meses pendientes:</b> ${data.mesesPendientes.join(', ')}</p>
            </div>
            <p style="color:#6b7280">Por favor acérquese a la administración para regularizar su situación.</p>
          </div>
        </div>`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error('Error enviando aviso de deuda: ' + msg);
    }
  }

  async enviarAlertaAsistencia(data: {
    emailPadre: string;
    nombrePadre: string;
    nombreEstudiante: string;
    apellidoEstudiante: string;
    fecha: string;
    estado: string;
    curso: string;
  }) {
    if (!process.env.MAIL_USER) return;

    try {
      await this.transporter.sendMail({
        from: `"EduGest" <${process.env.MAIL_USER}>`,
        to: data.emailPadre,
        subject: `Alerta de Asistencia - ${data.nombreEstudiante}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px">
          <div style="background:#f59e0b;padding:20px;border-radius:6px 6px 0 0;text-align:center">
            <h1 style="color:white;margin:0">Alerta de Asistencia</h1>
          </div>
          <div style="padding:24px">
            <p>Estimado/a <strong>${data.nombrePadre}</strong>,</p>
            <p>Le informamos sobre la asistencia de su hijo/a:</p>
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:16px;margin:16px 0">
              <p><b>Estudiante:</b> ${data.nombreEstudiante} ${data.apellidoEstudiante}</p>
              <p><b>Curso:</b> ${data.curso}</p>
              <p><b>Fecha:</b> ${data.fecha}</p>
              <p><b>Estado:</b> <span style="color:#dc2626;font-weight:bold">${data.estado}</span></p>
            </div>
          </div>
        </div>`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error('Error enviando alerta de asistencia: ' + msg);
    }
  }

  async enviarFactura(data: {
    email: string;
    nombreCliente: string;
    cuf: string;
    nroFactura: number;
    monto: number;
    pdfUrl?: string;
  }) {
    if (!process.env.MAIL_USER) return;

    try {
      await this.transporter.sendMail({
        from: `"EduGest" <${process.env.MAIL_USER}>`,
        to: data.email,
        subject: `Factura N° ${data.nroFactura} - EduGest`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px">
          <div style="background:#1976d2;padding:20px;border-radius:6px 6px 0 0;text-align:center">
            <h1 style="color:white;margin:0">Factura Electrónica</h1>
          </div>
          <div style="padding:24px">
            <p>Estimado/a <strong>${data.nombreCliente}</strong>,</p>
            <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:16px;margin:16px 0">
              <p><b>N° Factura:</b> ${data.nroFactura}</p>
              <p><b>CUF:</b> ${data.cuf}</p>
              <p><b>Monto:</b> Bs ${Number(data.monto).toLocaleString('es-BO')}</p>
              ${data.pdfUrl ? `<p><a href="${data.pdfUrl}">Descargar PDF</a></p>` : ''}
            </div>
          </div>
        </div>`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error('Error enviando factura: ' + msg);
    }
  }

  async enviarComunicado(data: { emails: string[]; titulo: string; mensaje: string }) {
    if (!process.env.MAIL_USER || !data.emails.length) return;

    try {
      await this.transporter.sendMail({
        from: `"EduGest" <${process.env.MAIL_USER}>`,
        to: data.emails.join(','),
        subject: data.titulo,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px">
          <div style="background:#1976d2;padding:20px;border-radius:6px 6px 0 0;text-align:center">
            <h1 style="color:white;margin:0">Comunicado Institucional</h1>
          </div>
          <div style="padding:24px">
            <h2>${data.titulo}</h2>
            <p style="color:#374151">${data.mensaje}</p>
          </div>
        </div>`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error('Error enviando comunicado: ' + msg);
    }
  }
}