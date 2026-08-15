// src/services/budgetService.js
import api from '../api/axios';

export const apply503020Rule = async (monthlyIncome) => {
    const response = await api.post('/budgets/apply-50-30-20', { monthlyIncome });
    return response.data;
};

export const getUserBudgets = async () => {
    const response = await api.get('/budgets');
    return response.data;
};

export const resetBudgetAlerts = async (budgetId) => {
    const response = await api.post(`/budgets/${budgetId}/reset-alerts`);
    return response.data;
};
