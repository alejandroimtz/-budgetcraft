// routes/goalRoutes.js
const { Router } = require('express');
const { verificarToken } = require('../middleware/auth.js');
const { obtenerMetas, crearMeta, actualizarMeta, eliminarMeta, agregarDineroMeta } = require('../controllers/goalController.js');

const router = Router();

// Obtener todas las metas del usuario
router.get('/', verificarToken, obtenerMetas);

// Crear una nueva meta
router.post('/', verificarToken, crearMeta);

// Actualizar una meta
router.put('/:id', verificarToken, actualizarMeta);

// Eliminar una meta
router.delete('/:id', verificarToken, eliminarMeta);

// Agregar dinero a una meta
router.post('/:id/add', verificarToken, agregarDineroMeta);

module.exports = router;
