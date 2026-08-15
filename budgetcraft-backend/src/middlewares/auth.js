// src/middlewares/auth.js
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Acceso denegado. No se proporcionó un token de autenticación.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_fallback');
    req.usuario = decoded; // Guardamos los datos del usuario en la petición (ej. id, email)
    next();
  } catch (error) {
    return res.status(403).json({
      status: 'error',
      message: 'Token inválido o expirado.'
    });
  }
};

module.exports = { verificarToken };