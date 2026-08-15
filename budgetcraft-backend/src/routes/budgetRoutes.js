// routes/budgetRoutes.js
const { Router } = require('express');
const { apply50_30_20Rule, getUserBudgets, resetBudgetAlerts } = require('../controllers/budgetController.js');
const { verificarToken } = require('../middlewares/auth.js');

const router = Router();

// Aplicar regla 50/30/20
router.post('/apply-50-30-20', verificarToken, apply50_30_20Rule);

// Obtener presupuestos del usuario
router.get('/', verificarToken, getUserBudgets);

// Reiniciar alertas de un presupuesto
router.post('/:id/reset-alerts', verificarToken, resetBudgetAlerts);

module.exports = router;
