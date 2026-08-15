// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// 1. REGISTRO DE USUARIO
const registrarUsuario = async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Por favor proporciona nombre, email y contraseña.'
    });
  }

  try {
    // Verificar si el usuario ya existe
    const usuarioExistente = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'El correo electrónico ya está registrado.'
      });
    }

    // Encriptar la contraseña (Hash)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insertar el nuevo usuario en la base de datos
    const nuevoUsuario = await db.query(
      'INSERT INTO usuarios (nombre, email, password_hash) VALUES ($1, $2, $3) RETURNING id, nombre, email, creado_en',
      [nombre, email, passwordHash]
    );

    const user = nuevoUsuario.rows[0];

    // Generar Token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secreto_fallback',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      token,
      user
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

// 2. INICIO DE SESIÓN (LOGIN)
const iniciarSesion = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Por favor proporciona email y contraseña.'
    });
  }

  try {
    // Buscar al usuario por correo
    const resultado = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (resultado.rows.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
    }

    const usuario = resultado.rows[0];

    // Comprobar contraseña contra el hash
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
    }

    // Generar Token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET || 'secreto_fallback',
      { expiresIn: '7d' }
    );

    res.json({
      status: 'success',
      token,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        creado_en: usuario.creado_en
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

// 3. OBTENER PERFIL DEL USUARIO AUTENTICADO
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await db.query(
      'SELECT id, nombre, email, creado_en FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }

    res.json({ status: 'success', user: usuario.rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

module.exports = { registrarUsuario, iniciarSesion, obtenerPerfil };