// src/routes/budget.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { getSemanaActual, getPeriodoActual } = require('../utils/fechas');
const { verificarToken } = require('../middleware/auth');

const DESCRIPCION_ASIGNACION = 'Asignación a Presupuesto Semanal';

async function getConfiguracion(usuarioId) {
  const result = await db.query(
    `SELECT dia_reinicio, hora_reinicio FROM budget_settings WHERE usuario_id = $1`,
    [usuarioId]
  );
  if (result.rows.length === 0) {
    return { dia_reinicio: 1, hora_reinicio: '00:00:00' };
  }
  return result.rows[0];
}

// GET /api/v1/budget/configuracion -> día y hora de reinicio actuales
router.get('/configuracion', verificarToken, async (req, res) => {
  try {
    const config = await getConfiguracion(req.usuario.id);
    res.json({ data: config });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la configuración' });
  }
});

// PUT /api/v1/budget/configuracion -> actualizar día y hora de reinicio
router.put('/configuracion', verificarToken, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { dia_reinicio, hora_reinicio } = req.body;

    if (
      dia_reinicio === undefined ||
      dia_reinicio < 0 || dia_reinicio > 6 ||
      !hora_reinicio || !/^\d{2}:\d{2}(:\d{2})?$/.test(hora_reinicio)
    ) {
      return res.status(400).json({ error: 'Día u hora de reinicio inválidos' });
    }

    const horaCompleta = hora_reinicio.length === 5 ? `${hora_reinicio}:00` : hora_reinicio;

    const result = await db.query(
      `INSERT INTO budget_settings (usuario_id, dia_reinicio, hora_reinicio)
       VALUES ($1, $2, $3)
       ON CONFLICT (usuario_id)
       DO UPDATE SET dia_reinicio = $2, hora_reinicio = $3, actualizado_en = CURRENT_TIMESTAMP
       RETURNING dia_reinicio, hora_reinicio`,
      [usuarioId, dia_reinicio, horaCompleta]
    );

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la configuración' });
  }
});

// GET /api/v1/budget/semanal -> presupuesto del periodo actual (con cierre automático)
router.get('/semanal', verificarToken, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const config = await getConfiguracion(usuarioId);
    const { inicio, fin } = getPeriodoActual(config.dia_reinicio, config.hora_reinicio);

    const existente = await db.query(
      `SELECT monto_destinado, semana_inicio, semana_fin
       FROM weekly_budgets
       WHERE usuario_id = $1 AND semana_inicio = $2`,
      [usuarioId, inicio]
    );

    if (existente.rows.length > 0) {
      return res.json({ data: existente.rows[0] });
    }

    // No hay fila para el periodo actual: puede que haya un periodo anterior
    // con dinero sin usar que debe regresar al balance total.
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const anteriorResult = await client.query(
        `SELECT * FROM weekly_budgets WHERE usuario_id = $1 ORDER BY semana_inicio DESC LIMIT 1`,
        [usuarioId]
      );

      if (anteriorResult.rows.length > 0) {
        const anterior = anteriorResult.rows[0];
        const montoDestinadoAnterior = parseFloat(anterior.monto_destinado);

        if (montoDestinadoAnterior > 0) {
          const gastadoResult = await client.query(
            `SELECT COALESCE(SUM(monto), 0) AS gastado
             FROM transacciones
             WHERE usuario_id = $1 AND tipo = 'gasto'
               AND descripcion <> $2
               AND fecha >= $3 AND fecha <= $4`,
            [usuarioId, DESCRIPCION_ASIGNACION, anterior.semana_inicio, anterior.semana_fin]
          );
          const gastadoReal = parseFloat(gastadoResult.rows[0].gastado);
          const sobrante = Math.max(0, montoDestinadoAnterior - gastadoReal);

          if (sobrante > 0) {
            await client.query(
              `INSERT INTO transacciones (usuario_id, tipo, monto, descripcion)
               VALUES ($1, 'ingreso', $2, 'Presupuesto semanal no utilizado - devuelto a balance')`,
              [usuarioId, sobrante]
            );
          }
        }
      }

      const nuevo = await client.query(
        `INSERT INTO weekly_budgets (usuario_id, monto_destinado, semana_inicio, semana_fin)
         VALUES ($1, 0, $2, $3)
         ON CONFLICT (usuario_id, semana_inicio) DO NOTHING
         RETURNING monto_destinado, semana_inicio, semana_fin`,
        [usuarioId, inicio, fin]
      );

      await client.query('COMMIT');

      const data = nuevo.rows[0] || { monto_destinado: 0, semana_inicio: inicio, semana_fin: fin };
      res.json({ data });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el presupuesto semanal' });
  }
});

// DELETE /api/v1/budget/semanal -> reinicia el presupuesto del periodo actual
router.delete('/semanal', verificarToken, async (req, res) => {
  const client = await db.pool.connect();
  try {
    const usuarioId = req.usuario.id;
    const config = await getConfiguracion(usuarioId);
    const { inicio } = getPeriodoActual(config.dia_reinicio, config.hora_reinicio);

    await client.query('BEGIN');
    const result = await client.query(
      `DELETE FROM weekly_budgets
       WHERE usuario_id = $1 AND semana_inicio = $2
       RETURNING *`,
      [usuarioId, inicio]
    );
    await client.query('COMMIT');
    res.json({ data: result.rows[0] || { monto_destinado: 0 } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al reiniciar el presupuesto semanal' });
  } finally {
    client.release();
  }
});

// POST /api/v1/budget/semanal/destinar -> actualiza el monto del presupuesto del periodo actual
router.post('/semanal/destinar', verificarToken, async (req, res) => {
  const client = await db.pool.connect();
  try {
    const usuarioId = req.usuario.id;
    const { monto } = req.body;

    if (!monto && monto !== 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    if (monto < 0) {
      return res.status(400).json({ error: 'El monto no puede ser negativo' });
    }

    const config = await getConfiguracion(usuarioId);
    const { inicio, fin } = getPeriodoActual(config.dia_reinicio, config.hora_reinicio);

    await client.query('BEGIN');

    const upsert = await client.query(
      `INSERT INTO weekly_budgets (usuario_id, monto_destinado, semana_inicio, semana_fin)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (usuario_id, semana_inicio)
       DO UPDATE SET monto_destinado = $2,
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