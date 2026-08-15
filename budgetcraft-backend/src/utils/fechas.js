function getSemanaActual() {
  const hoy = new Date();
  const dia = hoy.getDay(); // 0=domingo, 1=lunes...
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

module.exports = { getSemanaActual };