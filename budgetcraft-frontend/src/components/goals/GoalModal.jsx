import React, { useState, useEffect } from 'react';
import { createGoal, updateGoal } from '../../services/goalService';

const GOAL_ICONS = ['🎯', '✈️', '🚗', '🎮', '💻', '📱', '🏠', '💍', '🎓', '🏥', '🛥️', '⚡'];
const GOAL_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6', '#e11d48', '#84cc16', '#a855f7'];

export const GoalModal = ({ isOpen, onClose, onGoalSaved, goalToEdit }) => {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [montoObjetivo, setMontoObjetivo] = useState('');
    const [montoActual, setMontoActual] = useState('');
    const [fechaObjetivo, setFechaObjetivo] = useState('');
    const [icono, setIcono] = useState('🎯');
    const [color, setColor] = useState('#10b981');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (goalToEdit) {
            setNombre(goalToEdit.nombre);
            setDescripcion(goalToEdit.descripcion || '');
            setMontoObjetivo(goalToEdit.monto_objetivo);
            setMontoActual(goalToEdit.monto_actual || 0);
            setFechaObjetivo(goalToEdit.fecha_objetivo || '');
            setIcono(goalToEdit.icono || '🎯');
            setColor(goalToEdit.color || '#10b981');
        } else {
            resetForm();
        }
    }, [goalToEdit, isOpen]);

    const resetForm = () => {
        setNombre('');
        setDescripcion('');
        setMontoObjetivo('');
        setMontoActual('');
        setFechaObjetivo('');
        setIcono('🎯');
        setColor('#10b981');
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!nombre || !montoObjetivo) {
            setError('Nombre y monto objetivo son requeridos.');
            return;
        }

        setLoading(true);

        try {
            const goalData = {
                nombre,
                descripcion,
                monto_objetivo: parseFloat(montoObjetivo),
                monto_actual: parseFloat(montoActual) || 0,
                fecha_objetivo: fechaObjetivo || null,
                icono,
                color
            };

            if (goalToEdit) {
                await updateGoal(goalToEdit.id, goalData);
            } else {
                await createGoal(goalData);
            }

            onGoalSaved();
            onClose();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar la meta.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-emerald-400">
                        {goalToEdit ? 'Editar Meta' : 'Nueva Meta'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                            Nombre de la Meta
                        </label>
                        <input
                            type="text"
                            required
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej. Viaje a la playa, Carro nuevo, Consola PS5"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                            Descripción (opcional)
                        </label>
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Describe tu meta..."
                            rows="2"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                Monto Objetivo
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={montoObjetivo}
                                    onChange={(e) => setMontoObjetivo(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-8 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                Monto Actual
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={montoActual}
                                    onChange={(e) => setMontoActual(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-8 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                            Fecha Objetivo (opcional)
                        </label>
                        <input
                            type="date"
                            value={fechaObjetivo}
                            onChange={(e) => setFechaObjetivo(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                            Icono
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {GOAL_ICONS.map((icon) => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setIcono(icon)}
                                    className={`w-10 h-10 rounded-xl border text-xl flex items-center justify-center transition-all ${
                                        icono === icon
                                            ? 'border-emerald-500 bg-emerald-500/20 scale-110'
                                            : 'border-slate-700 hover:border-slate-600'
                                    }`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                            Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {GOAL_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                                        color === c ? 'border-white scale-110' : 'border-transparent'
                                    }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-900/40"
                        >
                            {loading ? 'Guardando...' : goalToEdit ? 'Actualizar' : 'Crear Meta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
