import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Wallet, TrendingUp, TrendingDown, DollarSign,
  Plus, Bot, LogOut, Trash2, Send, X, Receipt,
  ArrowUpRight, ArrowDownRight, Sparkles, BarChart3, Loader2
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [summary, setSummary] = useState({ total_ingresos: 0, total_gastos: 0, balance_total: 0 });
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados Form Transacción
  const [showModal, setShowModal] = useState(false);
  const [monto, setMonto] = useState(''); // Valor numérico limpio para la API (ej: 1250.50)
  const [montoDisplay, setMontoDisplay] = useState(''); // Valor formateado para el input (ej: 1,250.50)
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('gasto');
  const [categoriaId, setCategoriaId] = useState('');

  // Estados Chat IA
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: `¡Hola ${user?.nombre || ''}! 👋 Soy BudgetCraft AI. ¿En qué puedo ayudarte con tus finanzas hoy?` }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, txRes, catRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/transactions'),
        api.get('/categories')
      ]);
      setSummary(sumRes.data.data);
      setTransactions(txRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear el input con comas en miles
  const handleMontoChange = (e) => {
    const value = e.target.value;

    // Remueve todo lo que no sea dígito o punto decimal
    const cleanValue = value.replace(/[^0-9.]/g, '');

    // Evita múltiples puntos decimales
    const parts = cleanValue.split('.');
    if (parts.length > 2) return;

    // Guarda el valor numérico puro para la API
    setMonto(cleanValue);

    // Formatea la parte entera con comas
    if (parts[0]) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Une la parte entera formateada con los decimales si existen
    const formatted = parts.join('.');
    setMontoDisplay(formatted);
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions', {
        monto: parseFloat(monto),
        descripcion,
        tipo,
        categoria_id: categoriaId ? parseInt(categoriaId) : null
      });
      setShowModal(false);
      setMonto('');
      setMontoDisplay('');
      setDescripcion('');
      setCategoriaId('');
      fetchDashboardData();
    } catch (err) {
      console.error('Error al crear transacción:', err);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este movimiento?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchDashboardData();
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  };

  const handleSendAiMessage = async (e) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const userText = aiMessage;
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setAiMessage('');
    setAiLoading(true);

    try {
      const res = await api.post('/ai/chat', { mensaje: userText });
      setChatHistory(prev => [...prev, { sender: 'ai', text: res.data.respuesta }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: 'ai', text: 'Error al consultar la IA.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Wallet className="w-12 h-12 text-emerald-400 animate-pulse" />
            <div className="absolute inset-0 w-12 h-12 bg-emerald-400/30 rounded-full animate-ping" />
          </div>
          <p className="text-emerald-400 font-medium animate-pulse">Cargando tu panel financiero...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* NAVBAR */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              BudgetCraft
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-slate-300">Hola, <strong className="text-slate-100 font-semibold">{user?.nombre}</strong></span>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-700"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* TARJETAS DE RESUMEN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 p-6 rounded-2xl hover:border-slate-700 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Balance Total</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
              {formatCurrency(summary.balance_total)}
            </p>
            <div className="mt-3 flex items-center text-xs text-slate-500">
              <BarChart3 className="w-3.5 h-3.5 mr-1" />
              Actualizado hoy
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 p-6 rounded-2xl hover:border-emerald-800/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingresos</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-400 tracking-tight">
              +{formatCurrency(summary.total_ingresos)}
            </p>
            <div className="mt-3 flex items-center text-xs text-emerald-400/70">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              Dinero entrante
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 p-6 rounded-2xl hover:border-rose-800/50 transition-all duration-300 group sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gastos</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-rose-400 tracking-tight">
              -{formatCurrency(summary.total_gastos)}
            </p>
            <div className="mt-3 flex items-center text-xs text-rose-400/70">
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
              Dinero saliente
            </div>
          </div>
        </div>

        {/* BARRA DE ACCIONES Y TITULO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Receipt className="w-6 h-6 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-200">Movimientos Recientes</h2>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setShowAiModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>Asistente IA</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Movimiento</span>
            </button>
          </div>
        </div>

        {/* TABLA DE MOVIMIENTOS */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
          {transactions.length === 0 ? (
            <div className="p-12 sm:p-16 text-center">
              <div className="text-5xl mb-4">💳</div>
              <p className="text-slate-400 text-lg font-medium mb-2">No tienes movimientos registrados</p>
              <p className="text-slate-500 text-sm">Agrega tu primer gasto o ingreso para comenzar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-xs text-slate-400 uppercase bg-slate-950/50">
                    <th className="p-4 font-semibold">Descripción</th>
                    <th className="p-4 font-semibold">Categoría</th>
                    <th className="p-4 font-semibold">Fecha</th>
                    <th className="p-4 text-right font-semibold">Monto</th>
                    <th className="p-4 text-center font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4 font-medium text-slate-200">{t.descripcion}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {t.categoria_nombre || 'Sin categoría'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(t.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className={`p-4 text-right font-bold ${t.tipo === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(parseFloat(t.monto))}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-500/20"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL NUEVO MOVIMIENTO MEJORADO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 relative shadow-2xl shadow-black/80 transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-xl border ${tipo === 'gasto' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                  {tipo === 'gasto' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <h3 className="text-xl font-bold text-slate-100">Registrar {tipo === 'gasto' ? 'Gasto' : 'Ingreso'}</h3>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setMonto('');
                  setMontoDisplay('');
                }}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4">
              {/* SELECTOR GASTO / INGRESO */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setTipo('gasto')}
                  className={`py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer ${tipo === 'gasto'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-lg shadow-rose-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>Gasto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipo('ingreso')}
                  className={`py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer ${tipo === 'ingreso'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Ingreso</span>
                </button>
              </div>

              {/* INPUT DE MONTO CON SIGNO DE PESOS Y SEPARADOR DE MILES */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">Monto</label>
                <div className="relative flex items-center">
                  <span className={`absolute left-4 text-xl font-bold select-none ${tipo === 'gasto' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    $
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="0.00"
                    value={montoDisplay}
                    onChange={handleMontoChange}
                    className={`w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-9 pr-4 text-2xl font-bold tracking-tight text-slate-100 focus:outline-none transition-all ${tipo === 'gasto'
                        ? 'focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
                        : 'focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30'
                      }`}
                  />
                </div>
              </div>

              {/* CAMPO DE DESCRIPCIÓN */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">Descripción</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Compras supermercado, Nómina, etc."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 focus:outline-none focus:border-slate-600 transition-all text-sm"
                />
              </div>

              {/* CAMPO DE CATEGORÍA */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">Categoría</label>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 focus:outline-none focus:border-slate-600 transition-all text-sm cursor-pointer"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setMonto('');
                    setMontoDisplay('');
                  }}
                  className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-semibold transition-colors text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`w-1/2 font-bold py-3 rounded-xl transition-all shadow-lg text-sm cursor-pointer active:scale-[0.98] ${tipo === 'gasto'
                      ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-rose-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    }`}
                >
                  Guardar {tipo === 'gasto' ? 'Gasto' : 'Ingreso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ASISTENTE IA */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl h-[550px] flex flex-col relative shadow-2xl shadow-black/60 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">BudgetCraft AI</h3>
                  <p className="text-xs text-indigo-400">Asistente Financiero Smart</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-bl-none'
                      }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-bl-none px-4 py-2.5 text-sm text-slate-400 flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Analizando finanzas...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer / Form */}
            <form onSubmit={handleSendAiMessage} className="p-3 border-t border-slate-800 bg-slate-950/50 flex space-x-2">
              <input
                type="text"
                placeholder="Pregunta sobre tu presupuesto o hábitos..."
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button
                type="submit"
                disabled={aiLoading || !aiMessage.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}