// src/pages/BudgetsPage.jsx
import React, { useState, useEffect } from 'react';
import { BudgetPlannerModal } from '../components/budget/BudgetPlannerModal';
import { BudgetCard } from '../components/budget/BudgetCard';
import { getUserBudgets } from '../services/budgetService';

export default function BudgetsPage({ onNavigateToDashboard }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBudgets = async () => {
        try {
            const data = await getUserBudgets();
            if (data.success) {
                setBudgets(data.data);
            }
        } catch (err) {
            console.error('Error al cargar presupuestos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onNavigateToDashboard}
                        className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                        title="Volver al Dashboard"
                    >
                        ←
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Presupuestos</h1>
                        <p className="text-sm text-slate-400">Gestiona tus límites mensuales por categoría</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-teal-600/20"
                >
                    Regla 50/30/20
                </button>
            </div>

            {loading ? (
                <div className="text-center text-slate-400 py-12">Cargando presupuestos...</div>
            ) : budgets.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-slate-400 mb-4">No tienes presupuestos configurados</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2 rounded-xl font-semibold transition-all"
                    >
                        Crear Presupuesto con 50/30/20
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {budgets.map((b) => (
                        <BudgetCard
                            key={b.id}
                            categoryName={b.categoria_nombre}
                            spent={parseFloat(b.gastado)}
                            limit={parseFloat(b.limite_mensual)}
                            color={b.categoria_color}
                        />
                    ))}
                </div>
            )}

            <BudgetPlannerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onBudgetSaved={fetchBudgets}
            />
        </div>
    );
};
