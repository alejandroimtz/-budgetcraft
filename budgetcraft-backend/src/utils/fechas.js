// src/utils/fechas.js

function getSemanaActual() {
  const hoy = new Date();
  const dia = hoy.getDay();
  const diff = hoy.getDate() - dia + (dia === 0 ? -6 : 1);

  const inicio = new Date(hoy);
  inicio.setDate(diff);
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 6);
  fin.setHours(23, 59, 59, 999);

  const toISODate = (d) => d.toISOString().split('T')[0];

  return { inicio: toISODate(inicio), fin: toISODate(fin) };
}

/**
 * Calcula el periodo semanal ACTUAL en base al día y hora de reinicio
 * elegidos por el usuario.
 * diaReinicio: 0 (domingo) a 6 (sábado), igual que Date.getDay()
 * horaReinicio: string 'HH:MM:SS'
 */
function getPeriodoActual(diaReinicio, horaReinicio) {
  const ahora = new Date();
  const [h, m, s] = horaReinicio.split(':').map(Number);

  // Candidato: hoy, a la hora de reinicio
  const candidato = new Date(ahora);
  candidato.setHours(h, m, s || 0, 0);

  // Retrocedemos hasta llegar al día de la semana elegido
  let diff = candidato.getDay() - diaReinicio;
  if (diff < 0) diff += 7;
  candidato.setDate(candidato.getDate() - diff);

  // Si aún así el candidato quedó en el futuro (ej. hoy es el día pero
  // la hora de reinicio todavía no llega), retrocedemos una semana completa
  if (candidato > ahora) {
    candidato.setDate(candidato.getDate() - 7);
  }

  const inicio = new Date(candidato);
  const fin = new Date(candidato);
  fin.setDate(fin.getDate() + 7);
  fin.setMilliseconds(fin.getMilliseconds() - 1);

  return { inicio, fin };
}

module.exports = { getSemanaActual, getPeriodoActual };