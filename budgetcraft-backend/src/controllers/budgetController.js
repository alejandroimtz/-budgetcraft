// controllers/budgetController.js
const db = require('../config/db');

/**
 * Aplica o actualiza la regla 50/30/20 para el usuario autenticado
 * POST /api/budgets/apply-50-30-20
 * Body: { monthlyIncome: 10000 }
 */
const apply50_30_20Rule = async (req, res) => {
  const userId = req.usuario.id;
  const { monthlyIncome } = req.body;

  if (!monthlyIncome || isNaN(monthlyIncome) || monthlyIncome <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, proporciona un ingreso mensual válido mayor a 0.'
    });
  }

  const income = parseFloat(monthlyIncome);
  const targets = [
    { nombre: 'Necesidades (50%)', limite: income * 0.50, color: '#0f766e' },
    { nombre: 'Deseos (30%)', limite: income * 0.30, color: '#6d28d9' },
    { nombre: 'Ahorro / Deudas (20%)', limite: income * 0.20, color: '#047857' }
  ];

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const createdOrUpdatedBudgets = [];

    for (const target of targets) {
      let catRes = await client.query(
        `SELECT id FROM categorias 
         WHERE (usuario_id = $1 OR usuario_id IS NULL) AND LOWER(nombre) = LOWER($2) 
         LIMIT 1`,
        [userId, target.nombre]
      );

      let categoryId;

      if (catRes.rows.length > 0) {
        categoryId = catRes.rows[0].id;
      } else {
        const newCatRes = await client.query(
          `INSERT INTO categorias (usuario_id, nombre, color) 
           VALUES ($1, $2, $3) RETURNING id`,
          [userId, target.nombre, target.color]
        );
        categoryId = newCatRes.rows[0].id;
      }

      const budgetRes = await client.query(
        `INSERT INTO budgets (usuario_id, categoria_id, limite_mensual, alert_80_sent, alert_100_sent)
         VALUES ($1, $2, $3, FALSE, FALSE)
         ON CONFLICT (usuario_id, categoria_id) 
         DO UPDATE SET 
            limite_mensual = EXCLUDED.limite_mensual,
            alert_80_sent = FALSE,
            alert_100_sent = FALSE,
            actualizado_en = CURRENT_TIMESTAMP
         RETURNING *`,
        [userId, categoryId, target.limite]
      );

      createdOrUpdatedBudgets.push({
        categoria: target.nombre,
        limite: target.limite,
        budget: budgetRes.rows[0]
      });
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Regla 50/30/20 aplicada correctamente a tus presupuestos.',
      data: createdOrUpdatedBudgets
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al aplicar la regla 50/30/20:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al configurar el presupuesto.'
    });
  } finally {
    client.release();
  }
};

/**
 * Obtiene todos los presupuestos del usuario autenticado
 * GET /api/budgets
 */
const getUserBudgets = async (req, res) => {
  const userId = req.usuario.id;

  try {
    const result = await db.query(
      `SELECT 
        b.id,
        b.limite_mensual,
        b.alert_80_sent,
        b.alert_100_sent,
        b.actualizado_en,
        b.creado_en,
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
       GROUP BY b.id, c.nombre, c.color
       ORDER BY c.nombre ASC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener presupuestos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los presupuestos.'
    });
  }
};

/**
 * Marca las alertas de un presupuesto como leídas/resueltas
 * POST /api/budgets/:id/reset-alerts
 */
const resetBudgetAlerts = async (req, res) => {
  const userId = req.usuario.id;
  const { id } = req.params;

  try {
    await db.query(
      'UPDATE budgets SET alert_80_sent = FALSE, alert_100_sent = FALSE WHERE id = $1 AND usuario_id = $2',
      [id, userId]
    );
    return res.status(200).json({
      success: true,
      message: 'Alertas reiniciadas correctamente'
    });
  } catch (error) {
    console.error('Error al reiniciar alertas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al reiniciar las alertas.'
    });
  }
};

module.exports = {
  apply50_30_20Rule,
  getUserBudgets,
  resetBudgetAlerts
};
