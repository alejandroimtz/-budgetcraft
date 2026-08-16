import React, { useState, useEffect } from 'react';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalModal } from '../components/goals/GoalModal';
import { getGoals, createGoal, updateGoal, deleteGoal, addToGoal } from '../services/goalService';
import { Target, Plus, TrendingUp, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function GoalsPage({ onBack, embedded }) {
    const { darkMode } = useTheme();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [addAmountModal, setAddAmountModal] = useState({ open: false, goal: null, amount: '' });

    const fetchGoals = async () => {
        try {
            const data = await getGoals();
            if (data.status === 'success' || data.success) {
                setGoals(data.data);
            }
        } catch (err) {
            console.error('Error al cargar metas:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleCreateGoal = async (goalData) => {
        try {
            await createGoal(goalData);
            fetchGoals();
        } catch (err) {
            console.error('Error al crear meta:', err);
        }
    };

    const handleUpdateGoal = async (goalData) => {
        try {
            await updateGoal(editingGoal.id, goalData);
            fetchGoals();
            setEditingGoal(null);
        } catch (err) {
            console.error('Error al actualizar meta:', err);
        }
    };

    const handleDeleteGoal = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta meta?')) return;
        try {
            await deleteGoal(id);
            fetchGoals();
        } catch (err) {
            console.error('Error al eliminar meta:', err);
        }
    };

    const handleAddToGoal = async (goalId, amount) => {
        try {
            await addToGoal(goalId, amount);
            fetchGoals();
            setAddAmountModal({ open: false, goal: null, amount: '' });
        } catch (err) {
            console.error('Error al agregar dinero:', err);
        }
    };

    const handleMarkComplete = async (id) => {
        try {
            const goal = goals.find(g => g.id === id);
            if (goal) {
                await updateGoal(id, { ...goal, completada: true });
                fetchGoals();
            }
        } catch (err) {
            console.error('Error al marcar como completada:', err);
        }
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGoal(null);
    };

    const handleSaveGoal = (goalData) => {
        if (editingGoal) {
            handleUpdateGoal(goalData);
        } else {
            handleCreateGoal(goalData);
        }
    };

    const activeGoals = goals.filter(g => !g.completada);
    const completedGoals = goals.filter(g => g.completada);

    return (
        <div className={embedded ? '' : 'p-4 sm:p-6 lg:p-8'}>
            {!embedded && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={onBack}
                            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-stone-100 text-stone-500 hover:text-stone-700'}`}
                        >
                            ←
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-100">Metas Financieras</h1>
                            <p className="text-sm text-slate-400">Define y alcanza tus objetivos de ahorro</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-600/20 flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Nueva Meta</span>
                    </button>
                </div>
            )}

            {embedded && (
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className={`text-lg font-bold ${darkMode ? 'text-slate-200' : 'text-stone-800'}`}>Metas Financieras</h2>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-stone-500'}`}>Define y alcanza tus objetivos de ahorro</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-600/20 flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Nueva Meta</span>
                    </button>
                </div>
            )}

            {loading ? (
                <div className="text-center text-slate-400 py-12">Cargando metas...</div>
            ) : goals.length === 0 ? (
                <div className="text-center py-16">
                    <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg font-medium mb-2">No tienes metas aún</p>
                    <p className="text-slate-500 text-sm mb-6">Crea tu primera meta y comienza a ahorrar para lograrla</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-all"
                    >
                        Crear Mi Primera Meta
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {activeGoals.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" />
                                Metas Activas ({activeGoals.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                {activeGoals.map((goal) => (
                                    <GoalCard
                                        key={goal.id}
                                        goal={goal}
                                        onAdd={(goal) => setAddAmountModal({ open: true, goal, amount: '' })}
                                        onEdit={handleEdit}
                                        onDelete={handleDeleteGoal}
                                        onMarkComplete={handleMarkComplete}
                                        darkMode={darkMode}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {completedGoals.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center">
                                <Trash2 className="w-5 h-5 mr-2 text-slate-400" />
                                Completadas ({completedGoals.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 opacity-75">
                                {completedGoals.map((goal) => (
                                    <GoalCard
                                        key={goal.id}
                                        goal={goal}
                                        onAdd={() => {}}
                                        onEdit={handleEdit}
                                        onDelete={handleDeleteGoal}
                                        onMarkComplete={() => {}}
                                        darkMode={darkMode}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <GoalModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onGoalSaved={handleSaveGoal}
                goalToEdit={editingGoal}
            />

            {addAmountModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-slate-100 mb-4">
                            Agregar ahorro a: {addAmountModal.goal?.nombre}
                        </h3>
                        <div className="mb-4">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                Monto a agregar
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={addAmountModal.amount}
                                    onChange={(e) => setAddAmountModal(prev => ({ ...prev, amount: e.target.value }))}
                                    placeholder="0.00"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-8 pr-4 text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setAddAmountModal({ open: false, goal: null, amount: '' })}
                                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleAddToGoal(addAmountModal.goal.id, addAmountModal.amount)}
                                disabled={!addAmountModal.amount || parseFloat(addAmountModal.amount) <= 0}
                                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                            >
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
