// src/components/goals/GoalCard.jsx
import React from 'react';
import { Target, Calendar, Plus, Trash2, Edit2, CheckCircle } from 'lucide-react';

export const GoalCard = ({ goal, onAdd, onEdit, onDelete, onMarkComplete, darkMode }) => {
    const progress = Math.min(Math.round((goal.monto_actual / goal.monto_objetivo) * 100), 100);
    const isComplete = goal.completada || progress >= 100;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2
        }).format(value || 0);
    };

    return (
        <div className={`p-5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-stone-200/80 shadow-sm'}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <span className="text-3xl">{goal.icono || '🎯'}</span>
                    <div>
                        <h3 className={`font-bold text-lg ${darkMode ? 'text-slate-100' : 'text-stone-900'}`}>{goal.nombre}</h3>
                        {goal.descripcion && (
                            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>{goal.descripcion}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    {!isComplete && (
                        <button
                            onClick={() => onMarkComplete(goal.id)}
                            className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Marcar como completada"
                        >
                            <CheckCircle className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={() => onEdit(goal)}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'}`}
                        title="Editar"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(goal.id)}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10' : 'text-stone-500 hover:text-rose-700 hover:bg-rose-50'}`}
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="mb-3">
                <div className="flex justify-between items-baseline mb-2">
                    <span className={`text-2xl font-bold ${isComplete ? 'text-emerald-500' : darkMode ? 'text-slate-100' : 'text-stone-900'}`}>
                        {formatCurrency(goal.monto_actual)}
                    </span>
                    <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                        de {formatCurrency(goal.monto_objetivo)}
                    </span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-stone-200'}`}>
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                            width: `${progress}%`,
                            backgroundColor: goal.color || '#10b981'
                        }}
                    />
                </div>
                <div className="flex justify-between mt-2">
                    <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                        {progress}% completado
                    </span>
                    {goal.fecha_objetivo && (
                        <span className={`text-xs flex items-center ${darkMode ? 'text-slate-500' : 'text-stone-400'}`}>
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(goal.fecha_objetivo).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    )}
                </div>
            </div>

            {!isComplete && (
                <button
                    onClick={() => onAdd(goal)}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl border border-dashed border-slate-600 text-slate-400 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Agregar ahorro</span>
                </button>
            )}

            {isComplete && (
                <div className="flex items-center justify-center space-x-2 py-2.5 text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">¡Meta completada!</span>
                </div>
            )}
        </div>
    );
};
