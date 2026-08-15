-- Tabla de metas financieras (objetivos de ahorro)
CREATE TABLE IF NOT EXISTS metas (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    monto_objetivo NUMERIC(12,2) NOT NULL,
    monto_actual NUMERIC(12,2) DEFAULT 0,
    fecha_objetivo DATE,
    icono VARCHAR(100) DEFAULT '🎯',
    color VARCHAR(7) DEFAULT '#10b981',
    completada BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_metas_usuario ON metas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_metas_completada ON metas(completada);
