// src/pages/Register.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, User, Mail, Lock, CheckCircle, Shield, BarChart3, Sparkles, Zap, LogOut, Eye, EyeOff } from 'lucide-react';

export default function Register({ onSwitchToLogin }) {
  const { register, login, user, logout } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(nombre, email, password);
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar la cuenta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Branding (solo visible en md+) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(0,0,0,0.2),transparent_50%)]" />
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <div className="mb-8">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 w-fit mb-6 backdrop-blur-sm">
              <Wallet className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">BudgetCraft</h1>
            <p className="text-emerald-100 text-lg">Comienza a controlar tu dinero hoy</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-white/10 rounded-xl border border-white/20">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Visualiza tus finanzas</h3>
                <p className="text-emerald-100 text-sm">Gráficos claros y resúmenes en tiempo real de tus ingresos y gastos.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-white/10 rounded-xl border border-white/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Asistente IA integrado</h3>
                <p className="text-emerald-100 text-sm">Obtén consejos personalizados basados en tus hábitos de gasto.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-white/10 rounded-xl border border-white/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Seguro y privado</h3>
                <p className="text-emerald-100 text-sm">Tus datos financieros protegidos con encriptación de nivel empresarial.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="flex items-center space-x-2 text-emerald-100">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Únete a miles de personas que ya ahorran mejor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-slate-950 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-slate-950 to-slate-950 lg:hidden" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none lg:hidden" />

        <div className="relative z-10 w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
              <Wallet className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              BudgetCraft
            </h1>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/40">
            {user && (
              <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
                <span className="text-sm text-amber-300">Ya tienes una sesión activa como <strong>{user.nombre}</strong></span>
                <button
                  onClick={() => { logout(); onSwitchToLogin(); }}
                  className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cambiar cuenta</span>
                </button>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-1">Crear Cuenta</h2>
              <p className="text-slate-400 text-sm">Comienza tu viaje hacia unas finanzas saludables</p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-sm mb-5 backdrop-blur-sm flex items-center space-x-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">Nombre Completo</label>
                <div className="relative group">
                  <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-3 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Alejandro Ortiz"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">Correo Electrónico</label>
                <div className="relative group">
                  <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">Contraseña</label>
                <div className="relative group">
                  <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-11 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-6 active:scale-[0.98]"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{loading ? 'Registrando...' : 'Crear Cuenta'}</span>
              </button>
            </form>

            <p className="text-sm text-slate-400 text-center mt-10">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-emerald-400 font-semibold hover:text-emerald-300 focus:outline-none transition-colors"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>

          <p className="text-xs text-slate-600 text-center mt-6">
            © 2024 BudgetCraft. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
