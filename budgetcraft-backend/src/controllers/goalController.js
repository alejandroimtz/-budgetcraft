// controllers/goalController.js
const db = require('../config/db');

// Obtener todas las metas del usuario
const obtenerMetas = async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    const resultado = await db.query(
      'SELECT * FROM metas WHERE usuario_id = $1 ORDER BY completada ASC, creado_en DESC',
      [usuarioId]
    );

    res.json({
      status: 'success',
      data: resultado.rows
    });
  } catch (error) {
    console.error('Error al obtener metas:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

// Crear una nueva meta
const crearMeta = async (req, res) => {
  const usuarioId = req.usuario.id;
  const { nombre, descripcion, monto_objetivo, fecha_objetivo, icono, color } = req.body;

  if (!nombre || !monto_objetivo) {
    return res.status(400).json({
      status: 'error',
      message: 'Nombre y monto objetivo son requeridos.'
    });
  }

  try {
    const resultado = await db.query(
      `INSERT INTO metas (usuario_id, nombre, descripcion, monto_objetivo, fecha_objetivo, icono, color)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [usuarioId, nombre, descripcion, monto_objetivo, fecha_objetivo, icono || '🎯', color || '#10b981']
    );

    res.status(201).json({
      status: 'success',
      data: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al crear meta:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

// Actualizar una meta
const actualizarMeta = async (req, res) => {
  const usuarioId = req.usuario.id;
  const { id } = req.params;
  const { nombre, descripcion, monto_objetivo, monto_actual, fecha_objetivo, icono, color, completada } = req.body;

  try {
    const resultado = await db.query(
      `UPDATE metas 
       SET nombre = $1, descripcion = $2, monto_objetivo = $3, monto_actual = $4, 
           fecha_objetivo = $5, icono = $6, color = $7, completada = $8, actualizado_en = CURRENT_TIMESTAMP
       WHERE id = $9 AND usuario_id = $10
       RETURNING *`,
      [nombre, descripcion, monto_objetivo, monto_actual, fecha_objetivo, icono, color, completada, id, usuarioId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Meta no encontrada.'
      });
    }

    res.json({
      status: 'success',
      data: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar meta:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

// Agregar dinero a una meta
const agregarDineroMeta = async (req, res) => {
  const usuarioId = req.usuario.id;
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'El monto debe ser mayor a 0.'
    });
  }

  try {
    const resultado = await db.query(
      `UPDATE metas 
       SET monto_actual = monto_actual + $1, actualizado_en = CURRENT_TIMESTAMP
       WHERE id = $2 AND usuario_id = $3
       RETURNING *`,
      [amount, id, usuarioId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Meta no encontrada.'
      });
    }

    res.json({
      status: 'success',
      data: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al agregar dinero a la meta:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

// Eliminar una meta
const eliminarMeta = async (req, res) => {
  const usuarioId = req.usuario.id;
  const { id } = req.params;

  try {
    const resultado = await db.query(
      'DELETE FROM metas WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, usuarioId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Meta no encontrada.'
      });
    }

    res.json({
      status: 'success',
      message: 'Meta eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar meta:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerMetas,
  crearMeta,
  actualizarMeta,
  eliminarMeta,
  agregarDineroMeta
};
