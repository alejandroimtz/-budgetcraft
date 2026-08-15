// src/index.js
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const express = require('express');
const cors = require('cors');
const db = require('./config/db');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const aiRoutes = require('./routes/aiRoutes'); // 👈 Nuevo

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Registrar Endpoints
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', transactionRoutes);
app.use('/api/v1/ai', aiRoutes); // 👈 Nuevo (/api/v1/ai/chat)

// Health check
app.get('/api/v1/health', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({
            status: 'success',
            message: 'API BudgetCraft funcionando correctamente 🚀',
            db_time: result.rows[0].now
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.use((req, res) => {
    res.status(404).json({ status: 'error', message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
    console.log(`🌐 Servidor corriendo en http://localhost:${PORT}`);
});