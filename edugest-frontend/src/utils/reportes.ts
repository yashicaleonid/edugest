import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ─── PDF ───────────────────────────────────────────────────────────────────

export const exportarPagosPDF = (pagos: any[]) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175);
  doc.text('EduGest — Reporte de Pagos', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-BO')}`, 14, 28);

  autoTable(doc, {
    startY: 35,
    head: [['Estudiante', 'Curso', 'Mes', 'Monto (Bs)', 'Método', 'Cajero', 'Fecha']],
    body: pagos.map((p) => [
      p.inscripcion?.estudiante
        ? `${p.inscripcion.estudiante.apellido}, ${p.inscripcion.estudiante.nombre}`
        : '—',
      p.inscripcion?.curso
        ? `${p.inscripcion.curso.nombre} ${p.inscripcion.curso.paralelo}`
        : '—',
      `${p.mes} ${p.gestion}`,
      Number(p.monto).toLocaleString('es-BO'),
      p.metodoPago,
      p.cajero ? `${p.cajero.nombre} ${p.cajero.apellido}` : '—',
      new Date(p.createdAt).toLocaleDateString('es-BO'),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 64, 175] },
    alternateRowStyles: { fillColor: [240, 244, 248] },
  });

  doc.save('reporte_pagos.pdf');
};

export const exportarAsistenciaPDF = (asistencias: any[]) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175);
  doc.text('EduGest — Reporte de Asistencia', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-BO')}`, 14, 28);

  autoTable(doc, {
    startY: 35,
    head: [['Estudiante', 'Curso', 'Fecha', 'Estado']],
    body: asistencias.map((a) => [
      a.inscripcion?.estudiante
        ? `${a.inscripcion.estudiante.apellido}, ${a.inscripcion.estudiante.nombre}`
        : '—',
      a.inscripcion?.curso
        ? `${a.inscripcion.curso.nombre} ${a.inscripcion.curso.paralelo}`
        : '—',
      new Date(a.fecha).toLocaleDateString('es-BO'),
      a.estado,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [16, 185, 129] },
    alternateRowStyles: { fillColor: [240, 244, 248] },
  });

  doc.save('reporte_asistencia.pdf');
};

// ─── EXCEL ─────────────────────────────────────────────────────────────────

export const exportarPagosExcel = (pagos: any[]) => {
  const datos = pagos.map((p) => ({
    Estudiante: p.inscripcion?.estudiante
      ? `${p.inscripcion.estudiante.apellido}, ${p.inscripcion.estudiante.nombre}`
      : '—',
    CI: p.inscripcion?.estudiante?.ci || '—',
    Curso: p.inscripcion?.curso
      ? `${p.inscripcion.curso.nombre} ${p.inscripcion.curso.paralelo}`
      : '—',
    Mes: p.mes,
    Gestión: p.gestion,
    'Monto (Bs)': Number(p.monto),
    'Método de Pago': p.metodoPago,
    Cajero: p.cajero ? `${p.cajero.nombre} ${p.cajero.apellido}` : '—',
    Fecha: new Date(p.createdAt).toLocaleDateString('es-BO'),
    Factura: p.factura ? p.factura.estado : 'Sin factura',
  }));

  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pagos');

  // Ancho de columnas
  ws['!cols'] = [
    { wch: 25 }, { wch: 12 }, { wch: 25 }, { wch: 12 },
    { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 20 },
    { wch: 12 }, { wch: 15 },
  ];

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'reporte_pagos.xlsx');
};

export const exportarAsistenciaExcel = (asistencias: any[]) => {
  const datos = asistencias.map((a) => ({
    Estudiante: a.inscripcion?.estudiante
      ? `${a.inscripcion.estudiante.apellido}, ${a.inscripcion.estudiante.nombre}`
      : '—',
    Curso: a.inscripcion?.curso
      ? `${a.inscripcion.curso.nombre} ${a.inscripcion.curso.paralelo}`
      : '—',
    Fecha: new Date(a.fecha).toLocaleDateString('es-BO'),
    Estado: a.estado,
  }));

  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');

  ws['!cols'] = [{ wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 12 }];

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'reporte_asistencia.xlsx');
};