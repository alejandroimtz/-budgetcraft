// src/utils/budgetCalculators.js
export const calculate50_30_20 = (monthlyIncome) => {
    const income = parseFloat(monthlyIncome) || 0;
    return {
        necesidades: income * 0.50,
        deseos: income * 0.30,
        ahorro: income * 0.20
    };
};
