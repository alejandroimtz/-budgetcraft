import { useMemo } from 'react';
import { CalendarDays, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function WeeklyCalendar({ transactions, darkMode }) {
  const dias = useMemo(() => {
    const hoy = new Date();
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const resultado = [];

    const toLocalDateString = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);
      const fechaStr = toLocalDateString(fecha);

      const txDia = transactions.filter(t => {
        const txFecha = t.fecha ? toLocalDateString(new Date(t.fecha)) : '';
        return txFecha === fechaStr;
      });

      const ingresos = txDia
        .filter(t => t.tipo === 'ingreso')
        .reduce((acc, t) => acc + parseFloat(t.monto), 0);

      const gastos = txDia
        .filter(t => t.tipo === 'gasto')
        .reduce((acc, t) => acc + parseFloat(t.monto), 0);

      const balance = ingresos - gastos;

      resultado.push({
        fecha,
        fechaStr,
        diaNombre: diasSemana[fecha.getDay()],
        diaNumero: fecha.getDate(),
        mes: fecha.toLocaleString('es-MX', { month: 'short' }),
        ingresos,
        gastos,
        balance,
        tieneMovimientos: txDia.length > 0
      });
    }

    return resultado;
  }, [transactions]);

  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-2">
        {dias.map((dia, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border text-center transition-all ${
              darkMode
                ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                : 'bg-stone-200/50 border-stone-300/70 hover:border-stone-400'
            }`}
          >
            <div className="space-y-1.5">
              <div>
                <p className={`text-[10px] font-semibold uppercase ${darkMode ? 'text-slate-500' : 'text-stone-500'}`}>
                  {dia.diaNombre}
                </p>
                <p className={`text-lg font-bold ${darkMode ? 'text-slate-200' : 'text-stone-800'}`}>
                  {dia.diaNumero}
                </p>
                <p className={`text-[10px] ${darkMode ? 'text-slate-600' : 'text-stone-400'}`}>
                  {dia.mes}
                </p>
              </div>

              <div className="space-y-1">
                {dia.ingresos > 0 && (
                  <div className="flex items-center justify-center space-x-0.5">
                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatoMoneda(dia.ingresos)}
                    </span>
                  </div>
                )}

                {dia.gastos > 0 && (
                  <div className="flex items-center justify-center space-x-0.5">
                    <ArrowDownRight className="w-3 h-3 text-rose-500" />
                    <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400">
                      {formatoMoneda(dia.gastos)}
                    </span>
                  </div>
                )}

                {!dia.tieneMovimientos && (
                  <p className={`text-[10px] ${darkMode ? 'text-slate-600' : 'text-stone-400'}`}>
                    -
                  </p>
                )}
              </div>

              {dia.balance !== 0 && (
                <div className={`pt-1 border-t ${darkMode ? 'border-slate-800' : 'border-stone-300'}`}>
                  <p className={`text-[10px] font-bold ${
                    dia.balance > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}>
                    {formatoMoneda(dia.balance)}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}