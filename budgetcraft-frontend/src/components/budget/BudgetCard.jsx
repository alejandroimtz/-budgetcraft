// src/components/budget/BudgetCard.jsx
import React from 'react';

export const BudgetCard = ({ categoryName, spent, limit, color }) => {
    const percentage = Math.min(Math.round((spent / limit) * 100), 100);
    const isOverBudget = spent >= limit;
    const isWarning = percentage >= 80 && !isOverBudget;

    // Selección dinámica de color para Tailwind
    const getProgressBarColor = () => {
        if (isOverBudget) return 'bg-rose-500';
        if (isWarning) return 'bg-amber-500';
        return 'bg-teal-500';
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-white">
            <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-slate-200">{categoryName}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isOverBudget ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        isWarning ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                    }`}>
                    {percentage}% gastado
                </span>
            </div>

            {/* Montos */}
            <div className="flex justify-between items-baseline mb-2">
                <span className="text-2xl font-bold">${spent.toLocaleString('es-MX')}</span>
                <span className="text-xs text-slate-400">de ${limit.toLocaleString('es-MX')}</span>
            </div>

            {/* Barra de Progreso */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ease-out ${getProgressBarColor()}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};