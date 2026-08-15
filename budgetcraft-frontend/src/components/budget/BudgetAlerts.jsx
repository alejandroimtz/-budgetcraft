// src/components/budget/BudgetAlerts.jsx
import { useState, useEffect } from 'react';
import { getUserBudgets } from '../../services/budgetService';
import { resetBudgetAlerts } from '../../services/budgetService';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

export const BudgetAlerts = ({ darkMode }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        try {
            const data = await getUserBudgets();
            if (data.success) {
                const budgetAlerts = [];
                data.data.forEach(b => {
                    const gastado = parseFloat(b.gastado);
                    const limite = parseFloat(b.limite_mensual);
                    const percentage = Math.round((gastado / limite) * 100);

                    if (percentage >= 100 && b.alert_100_sent) {
                        budgetAlerts.push({
                            id: b.id,
                            type: 'danger',
                            message: `Has alcanzado el 100% del presupuesto de ${b.categoria_nombre}`,
                            category: b.categoria_nombre,
                            percentage
                        });
                    } else if (percentage >= 80 && b.alert_80_sent) {
                        budgetAlerts.push({
                            id: b.id,
                            type: 'warning',
                            message: `Has alcanzado el 80% del presupuesto de ${b.categoria_nombre}`,
                            category: b.categoria_nombre,
                            percentage
                        });
                    }
                });
                setAlerts(budgetAlerts);
            }
        } catch (err) {
            console.error('Error al cargar alertas:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleDismiss = async (alertId) => {
        try {
            await resetBudgetAlerts(alertId);
            setAlerts(prev => prev.filter(a => a.id !== alertId));
        } catch (err) {
            console.error('Error al descartar alerta:', err);
        }
    };

    if (loading || alerts.length === 0) return null;

    return (
        <div className="space-y-3">
            {alerts.map((alert) => (
                <div
                    key={alert.id}
                    className={`flex items-start justify-between p-4 rounded-xl border ${
                        alert.type === 'danger'
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    }`}
                >
                    <div className="flex items-start space-x-3">
                        {alert.type === 'danger' ? (
                            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        ) : (
                            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                            <p className="font-medium text-sm">{alert.message}</p>
                            <p className="text-xs opacity-75 mt-0.5">
                                {alert.category} - {alert.percentage}% utilizado
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleDismiss(alert.id)}
                        className="p-1 hover:bg-black/10 rounded-lg transition-colors flex-shrink-0"
                        title="Descartar alerta"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};
