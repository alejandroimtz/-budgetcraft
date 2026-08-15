// budgetcraft-backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registrarUsuario, iniciarSesion, obtenerPerfil } = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');

// Rutas PÚBLICAS (NO llevan verificarToken)
router.post('/register', registrarUsuario);
router.post('/login', iniciarSesion);

// Ruta PROTEGIDA (Sí lleva verificarToken)
router.get('/me', verificarToken, obtenerPerfil);

module.exports = router;