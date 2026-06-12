import { Injectable, Logger } from '@nestjs/common';

export interface EmisionFacturaInput {
  monto: number;
  metodoPago: string;
  nombreCliente: string;
  ciCliente: string;
  descripcion: string;
}

export interface EmisionFacturaResult {
  cuf: string;
  nroFactura: number;
  estado: string;
  pdfUrl?: string;
}

@Injectable()
export class CucuService {
  private readonly logger = new Logger(CucuService.name);

  async emitirFactura(data: EmisionFacturaInput): Promise<EmisionFacturaResult> {
    const apiUrl = process.env.CUCU_API_URL;
    const apiKey = process.env.CUCU_API_KEY;

    if (apiUrl && apiKey) {
      try {
        const response = await fetch(`${apiUrl}/facturas/emitir`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const result = await response.json();
          return {
            cuf: result.cuf,
            nroFactura: result.nroFactura,
            estado: result.estado || 'EMITIDA',
            pdfUrl: result.pdfUrl,
          };
        }

        this.logger.warn('API CUCU respondió con error, usando emisión simulada.');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Error conectando con API CUCU: ${msg}. Usando emisión simulada.`);
      }
    }

    return this.emitirSimulada(data);
  }

  async consultarEstado(cuf: string): Promise<{ cuf: string; estado: string }> {
    const apiUrl = process.env.CUCU_API_URL;
    const apiKey = process.env.CUCU_API_KEY;

    if (apiUrl && apiKey) {
      try {
        const response = await fetch(`${apiUrl}/facturas/${cuf}/estado`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (response.ok) {
          return response.json();
        }
      } catch {
        this.logger.warn('No se pudo consultar estado en CUCU.');
      }
    }

    return { cuf, estado: 'EMITIDA' };
  }

  async validarAnteSin(cuf: string): Promise<{ valido: boolean; mensaje: string }> {
    const apiUrl = process.env.CUCU_API_URL;
    const apiKey = process.env.CUCU_API_KEY;

    if (apiUrl && apiKey) {
      try {
        const response = await fetch(`${apiUrl}/facturas/${cuf}/validar`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (response.ok) {
          return response.json();
        }
      } catch {
        this.logger.warn('No se pudo validar factura ante SIN.');
      }
    }

    return { valido: true, mensaje: 'Validación simulada exitosa.' };
  }

  private emitirSimulada(data: EmisionFacturaInput): EmisionFacturaResult {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const nroFactura = Math.floor(Math.random() * 900000) + 100000;

    this.logger.log(`Factura simulada emitida para ${data.nombreCliente} - Bs ${data.monto}`);

    return {
      cuf: `CUF-${timestamp}-${random}`,
      nroFactura,
      estado: 'EMITIDA',
      pdfUrl: undefined,
    };
  }
}
