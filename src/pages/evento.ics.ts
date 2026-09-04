import type { APIRoute } from 'astro';
import evento from '../data/evento.json';

const utc = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '');

const escapar = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');

const titulo = evento.bebe ? `${evento.tipo} de ${evento.bebe}` : evento.tipo;

export const GET: APIRoute = () => {
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//invitacion//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${utc(evento.fechaISO)}@invitacion`,
    `DTSTAMP:${utc(new Date().toISOString())}`,
    `DTSTART:${utc(evento.fechaISO)}`,
    `DTEND:${utc(evento.finISO)}`,
    `SUMMARY:${escapar(titulo)}`,
    `DESCRIPTION:${escapar(`${evento.frase}\n${evento.sitioUrl}`)}`,
    `LOCATION:${escapar(`${evento.lugar}, ${evento.direccion}`)}`,
    `URL:${evento.sitioUrl}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapar(`Mañana es el ${titulo.toLowerCase()}`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return new Response(lineas.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="invitacion.ics"',
    },
  });
};
