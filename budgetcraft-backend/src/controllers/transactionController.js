// src/controllers/transactionController.js
const db = require('../config/db');

const checkBudgetAlerts = async (usuario_id) => {
  try {
    const result = await db.query(
      `SELECT 
        b.id as budget_id,
        b.limite_mensual,
        b.alert_80_sent,
        b.alert_100_sent,
        c.nombre as categoria_nombre,
        c.color as categoria_color,
        COALESCE(SUM(t.monto), 0) as gastado
       FROM budgets b
       JOIN categorias c ON b.categoria_id = c.id
       LEFT JOIN transacciones t 
         ON t.usuario_id = b.usuario_id 
         AND t.categoria_id = b.categoria_id 
         AND t.tipo = 'gasto'
         AND DATE_TRUNC('month', t.fecha) = DATE_TRUNC('month', CURRENT_DATE)
       WHERE b.usuario_id = $1
       GROUP BY b.id, c.nombre, c.color, b.limite_mensual, b.alert_80_sent, b.alert_100_sent`,
      [usuario_id]
    );

    const alerts = [];
    for (const row of result.rows) {
      const gastado = parseFloat(row.gastado);
      const limite = parseFloat(row.limite_mensual);
      const percentage = limite > 0 ? Math.round((gastado / limite) * 100) : 0;

      if (percentage >= 100 && !row.alert_100_sent) {
        await db.query(
          'UPDATE budgets SET alert_100_sent = TRUE WHERE id = $1',
          [row.budget_id]
        );
        alerts.push({
          type: 'danger',
          message: `Has alcanzado el 100% del presupuesto de ${row.categoria_nombre}`,
          category: row.categoria_nombre,
          percentage: 100
        });
      } else if (percentage >= 80 && !row.alert_80_sent) {
        await db.query(
          'UPDATE budgets SET alert_80_sent = TRUE WHERE id = $1',
          [row.budget_id]
        );
        alerts.push({
          type: 'warning',
          message: `Has alcanzado el 80% del presupuesto de ${row.categoria_nombre}`,
          category: row.categoria_nombre,
          percentage
        });
      } else if (percentage < 80 && row.alert_80_sent) {
        await db.query(
          'UPDATE budgets SET alert_80_sent = FALSE WHERE id = $1',
          [row.budget_id]
        );
      } else if (percentage < 100 && row.alert_100_sent) {
        await db.query(
          'UPDATE budgets SET alert_100_sent = FALSE WHERE id = $1',
          [row.budget_id]
        );
      }
    }
    return alerts;
  } catch (error) {
    console.error('Error al verificar alertas de presupuesto:', error);
    return [];
  }
};

// 1. OBTENER TODAS LAS CATEGORÍAS (Para los Select del Frontend)
const obtenerCategorias = async (req, res) => {
  try {
    const resultado = await db.query('SELECT * FROM categorias ORDER BY tipo DESC, nombre ASC');
    res.json({
      status: 'success',
      data: resultado.rows
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

// 1.1 CREAR UNA NUEVA CATEGORÍA
const crearCategoria = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { nombre, color } = req.body;

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'El nombre de la categoría es obligatorio.'
    });
  }

  try {
    const nuevaCategoria = await db.query(
      `INSERT INTO categorias (nombre, tipo, color)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre.trim(), 'gasto', color || '#475569']
    );

    res.status(201).json({
      status: 'success',
      message: 'Categoría creada correctamente',
      data: nuevaCategoria.rows[0]
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

// 2. CREAR UNA NUEVA TRANSACCIÓN (Ingreso o Gasto)
const crearTransaccion = async (req, res) => {
  const usuario_id = req.usuario.id; // Obtenido del token JWT
  const { categoria_id, monto, descripcion, tipo, fecha } = req.body;

  if (!monto || !descripcion || !tipo) {
    return res.status(400).json({
      status: 'error',
      message: 'Por favor proporciona monto, descripción y tipo (ingreso/gasto).'
    });
  }

  try {
    const fechaTransaccion = fecha || new Date().toISOString().split('T')[0];

    const nuevaTransaccion = await db.query(
      `INSERT INTO transacciones (usuario_id, categoria_id, monto, descripcion, tipo, fecha)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [usuario_id, categoria_id || null, monto, descripcion, tipo, fechaTransaccion]
    );

    res.status(201).json({
      status: 'success',
      message: 'Transacción registrada correctamente',
      data: nuevaTransaccion.rows[0],
      alerts: await checkBudgetAlerts(usuario_id)
    });
  } catch (error) {
    console.error('Error al crear transacción:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

// 3. OBTENER TODAS LAS TRANSACCIONES DEL USUARIO (Con nombre de categoría)
const obtenerTransacciones = async (req, res) => {
  const usuario_id = req.usuario.id;

  try {
    const consulta = `
      SELECT 
        t.id, 
        t.monto, 
        t.descripcion, 
        t.tipo, 
        t.fecha, 
        t.creado_en,
        c.nombre AS categoria_nombre,
        c.icono AS categoria_icono
      FROM transacciones t
      LEFT JOIN categorias c ON t.categoria_id = c.id
      WHERE t.usuario_id = $1
      ORDER BY t.fecha DESC, t.creado_en DESC
    `;
    
    const resultado = await db.query(consulta, [usuario_id]);

    res.json({
      status: 'success',
      results: resultado.rows.length,
      data: resultado.rows
    });
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

// 4. ELIMINAR UNA TRANSACCIÓN
const eliminarTransaccion = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { id } = req.params;

  try {
    const resultado = await db.query(
      'DELETE FROM transacciones WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, usuario_id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Transacción no encontrada o no autorizada.'
      });
    }

    res.json({
      status: 'success',
      message: 'Transacción eliminada correctamente',
      alerts: await checkBudgetAlerts(usuario_id)
    });
  } catch (error) {
    console.error('Error al eliminar transacción:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

// 5. RESUMEN DEL DASHBOARD (Totales calculados dinámicamente)
const obtenerResumenDashboard = async (req, res) => {
  const usuario_id = req.usuario.id;

  try {
    // Total Ingresos y Total Gastos
    const totales = await db.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) AS total_ingresos,
        COALESCE(SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END), 0) AS total_gastos
       FROM transacciones 
       WHERE usuario_id = $1`,
      [usuario_id]
    );

    // Desglose de Gastos por Categoría (Para gráficas de Dona/Pastel)
    const porCategoria = await db.query(
      `SELECT 
        c.nombre AS categoria,
        SUM(t.monto) AS total
       FROM transacciones t
       JOIN categorias c ON t.categoria_id = c.id
       WHERE t.usuario_id = $1 AND t.tipo = 'gasto'
       GROUP BY c.nombre
       ORDER BY total DESC`,
      [usuario_id]
    );

    const ingresos = parseFloat(totales.rows[0].total_ingresos);
    const gastos = parseFloat(totales.rows[0].total_gastos);
    const balance = ingresos - gastos;

    res.json({
      status: 'success',
      data: {
        total_ingresos: ingresos,
        total_gastos: gastos,
        balance_total: balance,
        gastos_por_categoria: porCategoria.rows
      }
    });
  } catch (error) {
    console.error('Error en resumen dashboard:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerCategorias,
  crearCategoria,
  crearTransaccion,
  obtenerTransacciones,
  eliminarTransaccion,
  obtenerResumenDashboard
};