import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import {
  Wallet, TrendingUp, TrendingDown, DollarSign,
  Plus, Bot, LogOut, Trash2, Send, X, Receipt,
  ArrowUpRight, ArrowDownRight, Sparkles, BarChart3, Loader2,
  FolderPlus, Target, PieChart, Lightbulb, AlertCircle, Check,
  Sun, Moon, LayoutDashboard, CalendarRange, Scale, Wallet as WalletIcon, PiggyBank, ShoppingCart
} from 'lucide-react';
import { BudgetAlerts } from '../components/budget/BudgetAlerts';
import GoalsPage from './GoalsPage';

// Paleta de colores sobrios y mate para categorías
const CATEGORY_PALETTE = [
  '#0f766e', // Teal sobrio
  '#047857', // Esmeralda mate
  '#1d4ed8', // Azul cobalto
  '#6d28d9', // Púrpura profundo
  '#be123c', // Rojo terracota
  '#c2410c', // Naranja arcilla
  '#b45309', // Ámbar cálido
  '#475569'  // Gris pizarra
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  // Control de Secciones / Pestañas ('inicio' | 'presupuesto' | 'metas')
  const [activeTab, setActiveTab] = useState('inicio');

  const [summary, setSummary] = useState({ total_ingresos: 0, total_gastos: 0, balance_total: 0 });
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados Form Transacción
  const [showModal, setShowModal] = useState(false);
  const [monto, setMonto] = useState('');
  const [montoDisplay, setMontoDisplay] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('gasto');
  const [categoriaId, setCategoriaId] = useState('');

  // Estado Crear Categoría
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [colorCategoria, setColorCategoria] = useState(CATEGORY_PALETTE[0]);

  // Estado Presupuesto Semanal
  const [presupuestoSemanal, setPresupuestoSemanal] = useState(2000);
  const [editingPresupuesto, setEditingPresupuesto] = useState(false);
  const [tempPresupuesto, setTempPresupuesto] = useState('2000');

  // Estado Modal Regla 50/30/20
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleIngresoMensual, setRuleIngresoMensual] = useState('');
  const [ruleIngresoDisplay, setRuleIngresoDisplay] = useState('');

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

  // CÁLCULOS SEMANALES & ANÁLISIS
  const statsSemanales = useMemo(() => {
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const gastosSemana = transactions.filter(t =>
      t.tipo === 'gasto' && new Date(t.fecha) >= hace7Dias
    );

    const totalGastadoSemana = gastosSemana.reduce((acc, t) => acc + parseFloat(t.monto), 0);

    const gastosPorCat = {};
    gastosSemana.forEach(t => {
      const cat = t.categoria_nombre || 'Sin categoría';
      gastosPorCat[cat] = (gastosPorCat[cat] || 0) + parseFloat(t.monto);
    });

    let mayorGastoCat = { nombre: 'N/A', monto: 0 };
    Object.entries(gastosPorCat).forEach(([nombre, monto]) => {
      if (monto > mayorGastoCat.monto) {
        mayorGastoCat = { nombre, monto };
      }
    });

    const promedioDiario = totalGastadoSemana / 7;

    return {
      gastosSemana,
      totalGastadoSemana,
      gastosPorCat,
      mayorGastoCat,
      promedioDiario
    };
  }, [transactions]);

  const handleMontoChange = (e) => {
    const value = e.target.value;
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) return;

    setMonto(cleanValue);

    if (parts[0]) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    setMontoDisplay(parts.join('.'));
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

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return;
    try {
      await api.post('/categories', { nombre: nuevaCategoria, color: colorCategoria });
      setNuevaCategoria('');
      setShowCategoryModal(false);
      fetchDashboardData();
    } catch (err) {
      console.error('Error al crear categoría:', err);
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

  const porcentajePresupuesto = Math.min(
    100,
    Math.round((statsSemanales.totalGastadoSemana / presupuestoSemanal) * 100) || 0
  );

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-zinc-100 text-stone-800'}`}>
        <div className="flex flex-col items-center space-y-4">
          <Wallet className="w-12 h-12 text-teal-700 dark:text-emerald-500 animate-pulse" />
          <p className="text-teal-800 dark:text-emerald-400 font-medium animate-pulse">Cargando tu panel financiero...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col relative pb-20 sm:pb-8 transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-zinc-100/90 text-stone-800'
      }`}>
      {/* NAVBAR */}
      <header className={`px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${darkMode ? 'bg-slate-900/90 border-slate-800/80' : 'bg-stone-50/90 border-stone-200/80 shadow-sm'
        }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border ${darkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-teal-100/60 border-teal-200 text-teal-800'}`}>
              <Wallet className="w-6 h-6" />
            </div>
            <span className={`text-xl font-bold bg-gradient-to-r ${darkMode ? 'from-emerald-400 to-teal-300' : 'from-teal-800 to-emerald-700'} bg-clip-text text-transparent`}>
              BudgetCraft
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* TOGGLE TEMA */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${darkMode
                  ? 'bg-slate-800/80 text-amber-400 border-slate-700/80 hover:bg-slate-800'
                  : 'bg-stone-200/60 text-stone-700 border-stone-300 hover:bg-stone-200'
                }`}
              title={darkMode ? 'Cambiar a Modo Claro (Mate)' : 'Cambiar a Modo Oscuro'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs ${darkMode ? 'bg-slate-800/60 border-slate-700/60 text-slate-300' : 'bg-stone-200/50 border-stone-300 text-stone-700'
              }`}>
              <div className="w-2 h-2 bg-teal-700 dark:bg-emerald-500 rounded-full animate-pulse" />
              <span>Hola, <strong className={darkMode ? 'text-slate-100' : 'text-stone-900'}>{user?.nombre}</strong></span>
            </div>

            <button
              onClick={() => setShowAiModal(true)}
              className={`p-2.5 rounded-xl transition-all border cursor-pointer flex items-center space-x-2 ${darkMode
                  ? 'bg-slate-800/80 hover:bg-slate-800 text-emerald-400 border-slate-700/80'
                  : 'bg-teal-100/60 hover:bg-teal-200/70 text-teal-900 border-teal-300/80'
                }`}
              title="Asistente IA"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-semibold">Asistente IA</span>
            </button>

            <button
              onClick={logout}
              className={`p-2.5 rounded-xl transition-colors cursor-pointer border ${darkMode
                  ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800 border-transparent'
                  : 'text-stone-500 hover:text-rose-700 hover:bg-rose-100/50 border-transparent'
                }`}
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* CONTROLES DE NAVEGACIÓN (SECCIONES) */}
        <div className={`p-1.5 rounded-2xl border inline-flex space-x-1 ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-stone-200/60 border-stone-300/70'
          }`}>
          <button
            onClick={() => setActiveTab('inicio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${activeTab === 'inicio'
                ? darkMode
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-teal-800 text-white shadow-md'
                : darkMode
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Inicio</span>
          </button>

          <button
            onClick={() => setActiveTab('presupuesto')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${activeTab === 'presupuesto'
                ? darkMode
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-teal-800 text-white shadow-md'
                : darkMode
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>Presupuesto Semanal</span>
          </button>

          <button
            onClick={() => setActiveTab('metas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${activeTab === 'metas'
                ? darkMode
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-teal-800 text-white shadow-md'
                : darkMode
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
          >
            <Target className="w-4 h-4" />
            <span>Metas</span>
          </button>
        </div>

        {/* ALERTAS DE PRESUPUESTO */}
        <BudgetAlerts darkMode={darkMode} />

        {/* SECCIÓN 1: INICIO */}
        {activeTab === 'inicio' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* TARJETAS DESCRIPTIVAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* BALANCE TOTAL */}
              <div className={`p-6 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-stone-50 border-stone-200/80 shadow-sm'
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-stone-200/60 border-stone-300 text-stone-700'}`}>
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>Balance Total</span>
                </div>
                <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${darkMode ? 'text-slate-100' : 'text-stone-900'}`}>
                  {formatCurrency(summary.balance_total)}
                </p>
                <div className={`mt-3 flex items-center text-xs ${darkMode ? 'text-slate-500' : 'text-stone-500'}`}>
                  <BarChart3 className="w-3.5 h-3.5 mr-1" />
                  Ingresos acumulados vs Gastos
                </div>
              </div>

              {/* INGRESOS DEL MES */}
              <div className={`p-6 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-stone-50 border-stone-200/80 shadow-sm'
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-teal-100/60 border-teal-300 text-teal-800'}`}>
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>Ingresos del Mes</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-teal-800 dark:text-emerald-400 tracking-tight">
                  +{formatCurrency(summary.total_ingresos)}
                </p>
                <div className="mt-3 flex items-center text-xs text-teal-800/80 dark:text-emerald-400/70">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  Total entradas mes actual
                </div>
              </div>

              {/* GASTOS DEL MES */}
              <div className={`p-6 rounded-2xl border transition-all sm:col-span-2 lg:col-span-1 ${darkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-stone-50 border-stone-200/80 shadow-sm'
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-rose-100/60 border-rose-200 text-rose-800'}`}>
                    <ArrowDownRight className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>Gastos del Mes</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-rose-800 dark:text-rose-400 tracking-tight">
                  -{formatCurrency(summary.total_gastos)}
                </p>
                <div className="mt-3 flex items-center text-xs text-rose-800/80 dark:text-rose-400/70">
                  <TrendingDown className="w-3.5 h-3.5 mr-1" />
                  Total salidas mes actual
                </div>
              </div>
            </div>

            {/* TABLA HISTORIAL DE MOVIMIENTOS */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-3">
                <Receipt className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-stone-500'}`} />
                <h2 className={`text-lg font-bold ${darkMode ? 'text-slate-200' : 'text-stone-800'}`}>Historial de Movimientos</h2>
              </div>

              <div className={`rounded-2xl overflow-hidden border shadow-lg ${darkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-stone-50 border-stone-200/80 shadow-stone-200/50'
                }`}>
                {transactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-4xl mb-3">💳</div>
                    <p className={`font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-stone-600'}`}>No tienes movimientos registrados</p>
                    <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-stone-400'}`}>Toca el botón flotante (+) para agregar uno.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`border-b text-xs uppercase ${darkMode ? 'border-slate-800/80 text-slate-400 bg-slate-950/40' : 'border-stone-200 text-stone-500 bg-stone-200/50'
                          }`}>
                          <th className="p-4 font-semibold">Descripción</th>
                          <th className="p-4 font-semibold">Categoría</th>
                          <th className="p-4 font-semibold">Fecha</th>
                          <th className="p-4 text-right font-semibold">Monto</th>
                          <th className="p-4 text-center font-semibold">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y text-sm ${darkMode ? 'divide-slate-800/60' : 'divide-stone-200/60'}`}>
                        {transactions.map((t) => (
                          <tr key={t.id} className={darkMode ? 'hover:bg-slate-800/20' : 'hover:bg-stone-100/80'}>
                            <td className={`p-4 font-medium ${darkMode ? 'text-slate-200' : 'text-stone-800'}`}>{t.descripcion}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-stone-200/60 text-stone-700 border-stone-300'
                                }`}>
                                {t.categoria_nombre || 'Sin categoría'}
                              </span>
                            </td>
                            <td className={`p-4 text-xs ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                              {new Date(t.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className={`p-4 text-right font-bold ${t.tipo === 'ingreso' ? 'text-teal-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-400'}`}>
                              {t.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(parseFloat(t.monto))}
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleDeleteTransaction(t.id)}
                                className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-rose-100/50 rounded-lg transition-all cursor-pointer"
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
            </div>
          </div>
        )}

        {/* SECCIÓN 2: SEMANA / PRESUPUESTO */}
        {activeTab === 'presupuesto' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-bold ${darkMode ? 'text-slate-200' : 'text-stone-800'}`}>Presupuesto Semanal</h2>
              <button
                onClick={() => setShowRuleModal(true)}
                className={`text-xs font-semibold cursor-pointer px-3 py-1.5 rounded-lg border ${darkMode ? 'text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10' : 'text-teal-800 border-teal-300 hover:bg-teal-100/60'}`}
              >
                Regla 50/30/20
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CONTROL DE PRESUPUESTO SEMANAL */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${darkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-stone-50 border-stone-200/80 shadow-sm'
              }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-xl border ${darkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-teal-100/60 border-teal-200 text-teal-800'}`}>
                      <Target className="w-5 h-5" />
                    </div>
                    <h3 className={`font-bold ${darkMode ? 'text-slate-200' : 'text-stone-800'}`}>Presupuesto Semanal</h3>
                  </div>
                  {!editingPresupuesto ? (
                    <button
                      onClick={() => setEditingPresupuesto(true)}
                      className="text-xs text-teal-800 dark:text-emerald-400 hover:underline cursor-pointer font-semibold"
                    >
                      Ajustar Meta
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setPresupuestoSemanal(parseFloat(tempPresupuesto) || 0);
                        setEditingPresupuesto(false);
                      }}
                      className="text-xs bg-teal-800 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold px-2.5 py-1 rounded-lg cursor-pointer"
                    >
                      OK
                    </button>
                  )}
                </div>

                {editingPresupuesto ? (
                  <input
                    type="number"
                    value={tempPresupuesto}
                    onChange={(e) => setTempPresupuesto(e.target.value)}
                    className={`w-full rounded-xl p-2.5 text-xl font-bold mb-4 focus:outline-none border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-stone-100 border-stone-300 text-stone-900 focus:border-teal-700'
                      }`}
                  />
                ) : (
                  <div className="mb-4">
                    <p className={`text-3xl font-bold ${darkMode ? 'text-slate-100' : 'text-stone-900'}`}>{formatCurrency(presupuestoSemanal)}</p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                      Gastado esta semana: <strong className="text-rose-800 dark:text-rose-400">{formatCurrency(statsSemanales.totalGastadoSemana)}</strong>
                    </p>
                  </div>
                )}

                {/* BARRA DE PROGRESO */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={darkMode ? 'text-slate-400' : 'text-stone-500'}>Consumo Semanal</span>
                    <span className={porcentajePresupuesto > 90 ? 'text-rose-800 dark:text-rose-400' : 'text-teal-800 dark:text-emerald-400'}>
                      {porcentajePresupuesto}%
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-200 border-stone-300/60'
                    }`}>
                    <div
                      className={`h-full transition-all duration-500 ${porcentajePresupuesto > 90 ? 'bg-rose-700 dark:bg-rose-500' : 'bg-teal-700 dark:bg-emerald-500'
                        }`}
                      style={{ width: `${porcentajePresupuesto}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className={`mt-6 pt-4 border-t text-xs flex items-center space-x-2 ${darkMode ? 'border-slate-800/80 text-slate-400' : 'border-stone-200 text-stone-600'
                }`}>
                <AlertCircle className="w-4 h-4 text-teal-700 dark:text-emerald-400 flex-shrink-0" />
                <span>
                  {presupuestoSemanal - statsSemanales.totalGastadoSemana >= 0
                    ? `Disponibles: ${formatCurrency(presupuestoSemanal - statsSemanales.totalGastadoSemana)} para los próximos días.`
                    : 'Has rebasado tu presupuesto fijado.'}
                </span>
              </div>
            </div>

            {/* ESTADÍSTICAS & DESGLOSE SEMANAL */}
            <div className={`lg:col-span-2 p-6 rounded-2xl border flex flex-col justify-between ${darkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-stone-50 border-stone-200/80 shadow-sm'
              }`}>
              <div>
                <div className="flex items-center space-x-2.5 mb-4">
                  <div className={`p-2 rounded-xl border ${darkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-teal-100/60 border-teal-200 text-teal-800'}`}>
                    <PieChart className="w-5 h-5" />
                  </div>
                  <h3 className={`font-bold ${darkMode ? 'text-slate-200' : 'text-stone-800'}`}>Análisis de los Últimos 7 Días</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-stone-200/50 border-stone-300/70'}`}>
                    <p className={`text-xs font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>Mayor Gasto En</p>
                    <p className={`text-xl font-bold mt-1 ${darkMode ? 'text-slate-100' : 'text-stone-800'}`}>{statsSemanales.mayorGastoCat.nombre}</p>
                    <p className="text-xs text-rose-800 dark:text-rose-400 mt-0.5">{formatCurrency(statsSemanales.mayorGastoCat.monto)} gastados</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-stone-200/50 border-stone-300/70'}`}>
                    <p className={`text-xs font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>Promedio Diario</p>
                    <p className={`text-xl font-bold mt-1 ${darkMode ? 'text-slate-100' : 'text-stone-800'}`}>{formatCurrency(statsSemanales.promedioDiario)}</p>
                    <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>Calculado sobre 7 días</p>
                  </div>
                </div>

                {/* DESGLOSE POR CATEGORÍA */}
                <div className="space-y-2">
                  <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>Gastos por Categoría (Semana)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(statsSemanales.gastosPorCat).length === 0 ? (
                      <p className={`text-xs col-span-full ${darkMode ? 'text-slate-500' : 'text-stone-400'}`}>Sin consumos en esta semana.</p>
                    ) : (
                      Object.entries(statsSemanales.gastosPorCat).map(([cat, monto]) => (
                        <div key={cat} className={`p-2.5 rounded-xl text-xs border ${darkMode ? 'bg-slate-950/40 border-slate-800/80' : 'bg-stone-200/40 border-stone-300/60'
                          }`}>
                          <span className={`block truncate ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>{cat}</span>
                          <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-stone-800'}`}>{formatCurrency(monto)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className={`mt-4 pt-3 border-t flex items-center space-x-2 text-xs p-3 rounded-xl border ${darkMode
                  ? 'border-slate-800/80 text-emerald-300 bg-emerald-500/10'
                  : 'border-teal-200 text-teal-900 bg-teal-100/40'
                }`}>
                <Lightbulb className="w-4 h-4 flex-shrink-0 text-teal-700 dark:text-emerald-400" />
                <span>
                  {statsSemanales.mayorGastoCat.monto > 0
                    ? `Sugerencia: Puedes optimizar tus consumos en "${statsSemanales.mayorGastoCat.nombre}" para liberar presupuesto.`
                    : 'Sigue registrando tus movimientos para obtener sugerencias personalizadas.'}
                </span>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* SECCIÓN 3: METAS */}
        {activeTab === 'metas' && (
          <GoalsPage embedded={true} onBack={() => setActiveTab('inicio')} />
        )}
      </main>

      {/* BOTÓN FLOTANTE (FAB) PRINCIPAL */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-teal-800 hover:bg-teal-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 p-4 rounded-full font-bold shadow-xl shadow-stone-400/30 dark:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all z-30 flex items-center justify-center cursor-pointer group"
        title="Nuevo Movimiento"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-sm ml-0 group-hover:ml-2">
          Nuevo Movimiento
        </span>
      </button>

      {/* MODAL CREAR CATEGORÍA */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-sm rounded-3xl p-6 relative shadow-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-stone-50 border-stone-200'
            }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base font-bold flex items-center space-x-2 ${darkMode ? 'text-slate-100' : 'text-stone-900'}`}>
                <FolderPlus className="w-5 h-5 text-teal-700 dark:text-emerald-500" />
                <span>Nueva Categoría</span>
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className={`p-1 rounded-xl ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-stone-200 text-stone-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className={`block text-xs mb-1.5 font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>Nombre de la Categoría</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ropa, Entretenimiento, Despensa"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  className={`w-full rounded-xl py-2.5 px-4 text-sm focus:outline-none border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-stone-100 border-stone-300 text-stone-900 focus:border-teal-700'
                    }`}
                />
              </div>

              <div>
                <label className={`block text-xs mb-2 font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>Color Distintivo</label>
                <div className={`grid grid-cols-4 gap-2.5 p-3 rounded-xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-100 border-stone-200'}`}>
                  {CATEGORY_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setColorCategoria(color)}
                      className="w-full h-8 rounded-lg transition-transform flex items-center justify-center cursor-pointer hover:scale-110"
                      style={{ backgroundColor: color }}
                    >
                      {colorCategoria === color && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className={`w-1/2 py-2.5 rounded-xl font-semibold text-sm cursor-pointer ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-stone-200 text-stone-700 hover:bg-stone-300/70'
                    }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-teal-800 dark:bg-emerald-500 hover:bg-teal-700 text-white dark:text-slate-950 font-bold py-2.5 rounded-xl text-sm cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVO MOVIMIENTO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-3xl p-6 relative shadow-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-stone-50 border-stone-200'
            }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-xl border ${tipo === 'gasto' ? 'bg-rose-100 border-rose-200 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-teal-100 border-teal-200 text-teal-800 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                  {tipo === 'gasto' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-stone-900'}`}>Registrar {tipo === 'gasto' ? 'Gasto' : 'Ingreso'}</h3>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setMonto('');
                  setMontoDisplay('');
                }}
                className={`p-1.5 rounded-xl ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-stone-200 text-stone-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div className={`grid grid-cols-2 gap-2 p-1 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800/80' : 'bg-stone-200/60 border-stone-300/60'
                }`}>
                <button
                  type="button"
                  onClick={() => setTipo('gasto')}
                  className={`py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 cursor-pointer ${tipo === 'gasto'
                      ? 'bg-rose-800 text-white dark:bg-rose-500/20 dark:text-rose-400 border border-rose-700 dark:border-rose-500/30'
                      : 'text-stone-600 dark:text-slate-500'
                    }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>Gasto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipo('ingreso')}
                  className={`py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 cursor-pointer ${tipo === 'ingreso'
                      ? 'bg-teal-800 text-white dark:bg-emerald-500/20 dark:text-emerald-400 border border-teal-700 dark:border-emerald-500/30'
                      : 'text-stone-600 dark:text-slate-500'
                    }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Ingreso</span>
                </button>
              </div>

              <div>
                <label className={`block text-xs mb-1.5 font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>Monto</label>
                <div className="relative flex items-center">
                  <span className={`absolute left-4 text-xl font-bold ${tipo === 'gasto' ? 'text-rose-800 dark:text-rose-400' : 'text-teal-800 dark:text-emerald-400'}`}>$</span>
                  <input
                    type="text"
                    required
                    placeholder="0.00"
                    value={montoDisplay}
                    onChange={handleMontoChange}
                    className={`w-full rounded-2xl py-3 pl-9 pr-4 text-2xl font-bold focus:outline-none border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-stone-100 border-stone-300 text-stone-900 focus:border-teal-700'
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs mb-1.5 font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>Descripción</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Compras supermercado, Transporte, etc."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className={`w-full rounded-xl py-2.5 px-4 text-sm focus:outline-none border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-stone-100 border-stone-300 text-stone-900 focus:border-teal-700'
                    }`}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={`block text-xs font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>Categoría</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setShowCategoryModal(true);
                    }}
                    className="text-xs text-teal-800 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    + Nueva Categoría
                  </button>
                </div>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className={`w-full rounded-xl py-2.5 px-4 text-sm focus:outline-none cursor-pointer border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-stone-100 border-stone-300 text-stone-900 focus:border-teal-700'
                    }`}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setMonto('');
                    setMontoDisplay('');
                  }}
                  className={`w-1/2 py-3 rounded-xl font-semibold text-sm cursor-pointer ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-stone-200 text-stone-700 hover:bg-stone-300/70'
                    }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`w-1/2 font-bold py-3 rounded-xl text-sm cursor-pointer ${tipo === 'gasto'
                      ? 'bg-rose-800 text-white dark:bg-rose-500 dark:text-white'
                      : 'bg-teal-800 text-white dark:bg-emerald-500 dark:text-slate-950'
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-lg rounded-3xl h-[550px] flex flex-col relative shadow-2xl overflow-hidden border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-stone-50 border-stone-200'
            }`}>
            <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-stone-200/50 border-stone-300/60'
              }`}>
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-xl border ${darkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-teal-100 border-teal-200 text-teal-800'}`}>
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${darkMode ? 'text-slate-100' : 'text-stone-900'}`}>BudgetCraft AI</h3>
                  <p className="text-xs text-teal-800 dark:text-emerald-400 font-medium">Asistente Financiero Smart</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className={`p-1.5 rounded-xl ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-stone-200 text-stone-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.sender === 'user'
                        ? 'bg-teal-800 text-white dark:bg-emerald-500 dark:text-slate-950 font-medium rounded-br-none'
                        : darkMode
                          ? 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-bl-none'
                          : 'bg-stone-200/70 text-stone-800 border border-stone-300/60 rounded-bl-none'
                      }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className={`rounded-2xl px-4 py-2.5 text-sm flex items-center space-x-2 border ${darkMode ? 'bg-slate-800/80 border-slate-700/60 text-slate-400' : 'bg-stone-200/60 border-stone-300 text-stone-600'
                    }`}>
                    <Loader2 className="w-4 h-4 animate-spin text-teal-700 dark:text-emerald-400" />
                    <span>Analizando finanzas...</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendAiMessage} className={`p-3 border-t flex space-x-2 ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-stone-200/50 border-stone-300/60'
              }`}>
              <input
                type="text"
                placeholder="Pregunta sobre tu presupuesto..."
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                className={`flex-1 rounded-xl px-4 py-2 text-sm focus:outline-none border ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-stone-100 border-stone-300 text-stone-900 focus:border-teal-700'
                  }`}
              />
              <button
                type="submit"
                disabled={aiLoading || !aiMessage.trim()}
                className="bg-teal-800 hover:bg-teal-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 p-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FLOTANTE REGLA 50/30/20 */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 relative shadow-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-stone-50 border-stone-200'
            }`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-2xl border ${darkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-teal-100/60 border-teal-200 text-teal-800'}`}>
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-slate-100' : 'text-stone-900'}`}>Regla 50/30/20</h3>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>Distribución inteligente de ingresos</p>
                </div>
              </div>
              <button
                onClick={() => setShowRuleModal(false)}
                className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-stone-200 text-stone-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-xs mb-2 font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  Ingreso Semanal
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>$</span>
                  <input
                    type="text"
                    value={ruleIngresoDisplay}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setRuleIngresoMensual(raw);
                      setRuleIngresoDisplay(raw ? Number(raw).toLocaleString('es-MX') : '');
                    }}
                    placeholder="0"
                    className={`w-full rounded-xl py-3 pl-10 pr-4 text-base font-semibold focus:outline-none border transition-all ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-emerald-500' : 'bg-stone-100 border-stone-300 text-stone-900 focus:border-teal-700'
                      }`}
                  />
                </div>
              </div>

              {ruleIngresoMensual && Number(ruleIngresoMensual) > 0 && (
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl border-2 ${darkMode ? 'bg-slate-950/60 border-emerald-500/30' : 'bg-teal-50 border-teal-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-emerald-400' : 'text-teal-800'}`}>Necesidades</span>
                      <span className={`text-xs font-bold ${darkMode ? 'text-slate-500' : 'text-stone-500'}`}>50%</span>
                    </div>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-stone-900'}`}>{formatCurrency(Number(ruleIngresoMensual) * 0.5)}</p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-stone-500'}`}>Vivienda, comida, transporte</p>
                  </div>

                  <div className={`p-4 rounded-2xl border-2 ${darkMode ? 'bg-slate-950/60 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>Deseos</span>
                      <span className={`text-xs font-bold ${darkMode ? 'text-slate-500' : 'text-stone-500'}`}>30%</span>
                    </div>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-stone-900'}`}>{formatCurrency(Number(ruleIngresoMensual) * 0.3)}</p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-stone-500'}`}>Ocio, suscripciones, gustos</p>
                  </div>

                  <div className={`p-4 rounded-2xl border-2 ${darkMode ? 'bg-slate-950/60 border-violet-500/30' : 'bg-violet-50 border-violet-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-violet-400' : 'text-violet-800'}`}>Ahorro</span>
                      <span className={`text-xs font-bold ${darkMode ? 'text-slate-500' : 'text-stone-500'}`}>20%</span>
                    </div>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-stone-900'}`}>{formatCurrency(Number(ruleIngresoMensual) * 0.2)}</p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-stone-500'}`}>Metas, emergencias, inversión</p>
                  </div>
                </div>
              )}

              {!ruleIngresoMensual && (
                <div className={`p-4 rounded-2xl border ${darkMode ? 'border-slate-800/80 text-slate-300 bg-slate-950/40' : 'border-stone-300/70 text-stone-700 bg-stone-100/60'}`}>
                  <div className="flex items-start space-x-2">
                    <Scale className="w-4 h-4 flex-shrink-0 text-teal-700 dark:text-emerald-400 mt-0.5" />
                    <p className="text-xs font-medium">
                      Ingresa tu ingreso semanal para ver cómo distribuir tus finanzas con la regla 50/30/20.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}