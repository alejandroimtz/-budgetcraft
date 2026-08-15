// budgetcraft-backend/src/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { chatConIA } = require('../controllers/aiController');
const { verificarToken } = require('../middlewares/auth');

router.post('/chat', verificarToken, chatConIA);

module.exports = router;