// src/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const {
  obtenerCategorias,
  crearTransaccion,
  obtenerTransacciones,
  eliminarTransaccion,
  obtenerResumenDashboard
} = require('../controllers/transactionController');

// Proteger todas las rutas con el Middleware de JWT
router.use(verificarToken);

// Endpoints de Categorías
router.get('/categories', obtenerCategorias);

// Endpoints de Transacciones
router.get('/transactions', obtenerTransacciones);
router.post('/transactions', crearTransaccion);
router.delete('/transactions/:id', eliminarTransaccion);

// Endpoint de Resumen/Dashboard
router.get('/dashboard/summary', obtenerResumenDashboard);

module.exports = router;