// src/services/goalService.js
import api from '../api/axios';

export const getGoals = async () => {
    const response = await api.get('/goals');
    return response.data;
};

export const createGoal = async (goalData) => {
    const response = await api.post('/goals', goalData);
    return response.data;
};

export const updateGoal = async (id, goalData) => {
    const response = await api.put(`/goals/${id}`, goalData);
    return response.data;
};

export const deleteGoal = async (id) => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
};

export const addToGoal = async (id, amount) => {
    const response = await api.post(`/goals/${id}/add`, { amount });
    return response.data;
};
