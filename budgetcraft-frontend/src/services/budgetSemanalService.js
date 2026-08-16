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

export const reiniciarPresupuestoSemanal = async () => {
  const response = await api.delete('/budget/semanal');
  return response.data;
};

export const getConfiguracionPresupuesto = async () => {
  const response = await api.get('/budget/configuracion');
  return response.data;
};

export const actualizarConfiguracionPresupuesto = async (dia_reinicio, hora_reinicio) => {
  const response = await api.put('/budget/configuracion', { dia_reinicio, hora_reinicio });
  return response.data;
};