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
}