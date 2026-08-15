import React, { useState } from 'react';
import { calculate50_30_20 } from '../../utils/budgetCalculators';
import { apply503020Rule } from '../../services/budgetService';

export const BudgetPlannerModal = ({ isOpen, onClose, onBudgetSaved }) => {
    const [monthlyIncome, setMonthlyIncome] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const breakdown = calculate50_30_20(monthlyIncome);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!monthlyIncome || parseFloat(monthlyIncome) <= 0) {
            setError('Por favor ingresa un monto válido.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await apply503020Rule(parseFloat(monthlyIncome));
            if (onBudgetSaved) onBudgetSaved(data.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error al guardar el presupuesto');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-teal-400">Regla 50/30/20</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <p className="text-sm text-slate-400 mb-6">
                    Ingresa tus ingresos mensuales para distribuir tu presupuesto automáticamente.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                            Ingreso Mensual Estimado
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={monthlyIncome}
                                onChange={(e) => setMonthlyIncome(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-8 pr-4 text-white focus:outline-none focus:border-teal-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-teal-950/40 border border-teal-800/50 p-3 rounded-xl text-center">
                            <span className="block text-xs font-medium text-teal-400">Necesidades (50%)</span>
                            <span className="block text-lg font-bold text-teal-200 mt-1">
                                ${breakdown.necesidades.toLocaleString()}
                            </span>
                        </div>

                        <div className="bg-purple-950/40 border border-purple-800/50 p-3 rounded-xl text-center">
                            <span className="block text-xs font-medium text-purple-400">Deseos (30%)</span>
                            <span className="block text-lg font-bold text-purple-200 mt-1">
                                ${breakdown.deseos.toLocaleString()}
                            </span>
                        </div>

                        <div className="bg-emerald-950/40 border border-emerald-800/50 p-3 rounded-xl text-center">
                            <span className="block text-xs font-medium text-emerald-400">Ahorro (20%)</span>
                            <span className="block text-lg font-bold text-emerald-200 mt-1">
                                ${breakdown.ahorro.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !monthlyIncome}
                            className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors text-sm shadow-lg shadow-teal-900/40"
                        >
                            {loading ? 'Guardando...' : 'Aplicar Regla'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};
