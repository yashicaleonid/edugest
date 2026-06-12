import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';
import { CategoriaDocumento } from '@prisma/client';

@Injectable()
export class DocumentosService {
  constructor(private readonly prisma: PrismaService) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(
    file: Express.Multer.File,
    categoria: CategoriaDocumento,
    estudianteId?: string,
    subidoPorId?: string,
  ) {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new BadRequestException('Cloudinary no está configurado.');
    }

    const folder = `edugest/${categoria.toLowerCase()}`;

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, uploadResult) => {
          if (error || !uploadResult) reject(error || new Error('Error al subir archivo'));
          else resolve({ secure_url: uploadResult.secure_url, public_id: uploadResult.public_id });
        },
      );
      stream.end(file.buffer);
    });

    const documento = await this.prisma.db.documento.create({
      data: {
        nombre: file.originalname,
        url: result.secure_url,
        publicId: result.public_id,
        categoria,
        mimeType: file.mimetype,
        size: file.size,
        estudianteId,
        subidoPorId,
      },
    });

    if (estudianteId && categoria === CategoriaDocumento.FOTO_ESTUDIANTE) {
      await this.prisma.db.estudiante.update({
        where: { id: estudianteId },
        data: { foto: result.secure_url },
      });
    }

    return documento;
  }

  async findAll(categoria?: CategoriaDocumento, estudianteId?: string) {
    return this.prisma.db.documento.findMany({
      where: {
        ...(categoria && { categoria }),
        ...(estudianteId && { estudianteId }),
      },
      include: {
        estudiante: { select: { nombre: true, apellido: true } },
        subidoPor: { select: { nombre: true, apellido: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const documento = await this.prisma.db.documento.findUnique({
      where: { id },
      include: {
        estudiante: { select: { nombre: true, apellido: true } },
        subidoPor: { select: { nombre: true, apellido: true } },
      },
    });

    if (!documento) {
      throw new NotFoundException(`Documento con id ${id} no encontrado.`);
    }

    return documento;
  }

  async remove(id: string) {
    const documento = await this.findOne(id);

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      await cloudinary.uploader.destroy(documento.publicId);
    }

    await this.prisma.db.documento.delete({ where: { id } });
    return { message: 'Documento eliminado exitosamente.' };
  }
}
