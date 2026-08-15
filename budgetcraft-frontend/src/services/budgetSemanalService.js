// src/services/budgetSemanalService.js
import api from '../api/axios';

export const getPresupuestoSemanal = async () => {
    const response = await api.get('/budget/semanal');
    return response.data;
};

export const destinarPresupuestoSemanal = async (monto) => {
    const response = await api.post('/budget/semanal/destinar', { monto });
    return response.data;
};