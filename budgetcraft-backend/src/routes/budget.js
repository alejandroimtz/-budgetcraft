// src/routes/budget.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { getSemanaActual } = require('../utils/fechas');
const { verificarToken } = require('../middleware/auth');

// GET /api/v1/budget/semanal -> devuelve el presupuesto de LA SEMANA ACTUAL
router.get('/semanal', verificarToken, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { inicio, fin } = getSemanaActual();

    const result = await db.query(
      `SELECT monto_destinado, semana_inicio, semana_fin
       FROM weekly_budgets
       WHERE usuario_id = $1 AND semana_inicio = $2`,
      [usuarioId, inicio]
    );

    if (result.rows.length === 0) {
      // No hay presupuesto destinado esta semana todavía
      return res.json({
        data: { monto_destinado: 0, semana_inicio: inicio, semana_fin: fin }
      });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el presupuesto semanal' });
  }
});

// POST /api/v1/budget/semanal/destinar -> agrega monto al presupuesto de la semana actual
router.post('/semanal/destinar', verificarToken, async (req, res) => {
  const client = await db.pool.connect();
  try {
    const usuarioId = req.usuario.id;
    const { monto } = req.body;

    if (!monto || monto <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    await client.query('BEGIN');

    // 1. Verificar balance actual del usuario
    const balanceResult = await client.query(
      `SELECT
        COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END), 0) AS balance_total
       FROM transacciones WHERE usuario_id = $1`,
      [usuarioId]
    );
    const balanceTotal = parseFloat(balanceResult.rows[0].balance_total);

    if (monto > balanceTotal) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Saldo insuficiente en tu balance total' });
    }

    // 2. Registrar el gasto (para que quede trazable en el historial)
    await client.query(
      `INSERT INTO transacciones (usuario_id, tipo, monto, descripcion)
       VALUES ($1, 'gasto', $2, 'Asignación a Presupuesto Semanal')`,
      [usuarioId, monto]
    );

    // 3. Insertar o sumar al presupuesto de la semana actual
    const { inicio, fin } = getSemanaActual();
    const upsert = await client.query(
      `INSERT INTO weekly_budgets (usuario_id, monto_destinado, semana_inicio, semana_fin)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (usuario_id, semana_inicio)
       DO UPDATE SET monto_destinado = weekly_budgets.monto_destinado + $2,
                     actualizado_en = CURRENT_TIMESTAMP
       RETURNING monto_destinado, semana_inicio, semana_fin`,
      [usuarioId, monto, inicio, fin]
    );

    await client.query('COMMIT');
    res.json({ data: upsert.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al destinar el presupuesto' });
  } finally {
    client.release();
  }
});

module.exports = router;