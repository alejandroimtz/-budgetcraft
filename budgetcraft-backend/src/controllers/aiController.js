const { GoogleGenAI } = require('@google/genai');
const pool = require('../config/db');

// Inicializar la SDK oficial de Google
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const chatConIA = async (req, res) => {
    try {
        const { mensaje } = req.body;
        const usuarioId = req.usuario.id;

        if (!mensaje) {
            return res.status(400).json({
                status: 'error',
                message: 'El mensaje es obligatorio.',
            });
        }

        // 1. Obtener historial reciente de transacciones del usuario
        const queryTransacciones = `
      SELECT t.monto, t.tipo, t.descripcion, c.nombre as categoria 
      FROM transacciones t
      LEFT JOIN categorias c ON t.categoria_id = c.id
      WHERE t.usuario_id = $1
      ORDER BY t.fecha DESC LIMIT 10
    `;
        const resultTransacciones = await pool.query(queryTransacciones, [usuarioId]);
        const transacciones = resultTransacciones.rows;

        const contextoFinanciero = transacciones.length > 0
            ? JSON.stringify(transacciones)
            : "El usuario no tiene transacciones registradas aún.";

        // 2. Definir prompt e instrucciones del sistema
        const promptCompleto = `Eres BudgetCraft AI, un asistente financiero personal inteligente y conciso.
El historial reciente de transacciones del usuario es: ${contextoFinanciero}.
Responde de forma clara, amigable y proporciona consejos breves de ahorro.

Pregunta del usuario: ${mensaje}`;

        // 3. Petición HTTP directa al endpoint oficial de la Interactions API
        const responseAI = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/interactions?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gemini-3.6-flash',
                    input: promptCompleto,
                })
            }
        );

        const data = await responseAI.json();

        if (!responseAI.ok) {
            console.error('❌ Error de Interactions API:', JSON.stringify(data, null, 2));
            throw new Error(data.error?.message || 'Error al comunicarse con Gemini');
        }

        // 4. Extraer el texto real de la estructura de respuesta de Interactions API
        let textoRespuesta = "";

        if (data.outputs && data.outputs.length > 0) {
            // Intenta leer el campo text dentro del output o el arreglo de partes
            const firstOutput = data.outputs[0];
            textoRespuesta = firstOutput.text
                || (firstOutput.contents && firstOutput.contents[0]?.parts?.[0]?.text)
                || (firstOutput.parts && firstOutput.parts[0]?.text);
        }

        // Resguardos adicionales si la estructura varía
        if (!textoRespuesta) {
            textoRespuesta = data.output
                || (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text)
                || (data.steps && data.steps[0]?.content?.[0]?.text);
        }

        // Imprimir en consola del backend para verificar la estructura recibida si hiciera falta
        if (!textoRespuesta) {
            console.log('📦 Estructura JSON recibida de la API:', JSON.stringify(data, null, 2));
            textoRespuesta = "Hola, soy BudgetCraft AI. ¿En qué puedo ayudarte con tus finanzas hoy?";
        }

        return res.json({
            status: 'success',
            respuesta: textoRespuesta,
        });

    } catch (error) {
        console.error('Error detallado en aiController:', error.message);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error al procesar la respuesta con el asistente de IA.',
            error: error.message || error,
        });
    }
};

module.exports = {
    chatConIA,
};