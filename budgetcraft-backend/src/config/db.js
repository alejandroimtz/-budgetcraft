// src/config/db.js
const { Pool } = require('pg');
const path = require('path');

// Cargamos el .env directamente dentro del mismo archivo donde se usa la base de datos
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// DEPURACIÓN: Esto nos mostrará en consola qué está leyendo exactamente Node.js
console.log('--- DIAGNÓSTICO DE VARIABLES DE ENTORNO ---');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD existe?:', process.env.DB_PASSWORD !== undefined);
console.log('-------------------------------------------');

// Garantizamos que la contraseña NUNCA sea undefined para que pg no lance el error SASL
const pass = process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : 'PASSWORD_NO_DETECTADO';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: pass,
  database: process.env.DB_NAME || 'budgetcraft_db',
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error al conectar con PostgreSQL:', err.message);
  }
  console.log('✅ Conexión exitosa a la base de datos PostgreSQL (budgetcraft_db)');
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};