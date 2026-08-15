-- Tabla de presupuestos mensuales por categoría
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria_id INT NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    limite_mensual NUMERIC(12,2) NOT NULL,
    alert_80_sent BOOLEAN DEFAULT FALSE,
    alert_100_sent BOOLEAN DEFAULT FALSE,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_budget_user_category UNIQUE (usuario_id, categoria_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_budgets_usuario ON budgets(usuario_id);
CREATE INDEX IF NOT EXISTS idx_budgets_categoria ON budgets(categoria_id);
