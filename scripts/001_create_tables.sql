-- Tabla de empresas (cada usuario tiene una empresa)
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  cif TEXT NOT NULL,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  logo_url TEXT,
  iva_porcentaje NUMERIC(5,2) DEFAULT 21.00,
  ultimo_numero_factura INTEGER DEFAULT 0,
  politica_proteccion_datos TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  cif TEXT,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS facturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  numero_factura TEXT NOT NULL,
  total_base NUMERIC(12,2) DEFAULT 0,
  total_iva NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  estado TEXT DEFAULT 'borrador' CHECK (estado IN ('borrador', 'emitida', 'pagada', 'anulada')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de items de factura
CREATE TABLE IF NOT EXISTS items_factura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id UUID NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  cantidad NUMERIC(10,2) NOT NULL DEFAULT 1,
  nombre TEXT NOT NULL,
  precio_unidad NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) GENERATED ALWAYS AS (cantidad * precio_unidad) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_factura ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para empresas
CREATE POLICY "usuarios_pueden_ver_su_empresa" ON empresas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_crear_su_empresa" ON empresas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_actualizar_su_empresa" ON empresas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_eliminar_su_empresa" ON empresas
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para clientes (a través de empresa)
CREATE POLICY "usuarios_pueden_ver_sus_clientes" ON clientes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM empresas WHERE empresas.id = clientes.empresa_id AND empresas.user_id = auth.uid())
  );

CREATE POLICY "usuarios_pueden_crear_clientes" ON clientes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM empresas WHERE empresas.id = clientes.empresa_id AND empresas.user_id = auth.uid())
  );

CREATE POLICY "usuarios_pueden_actualizar_clientes" ON clientes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM empresas WHERE empresas.id = clientes.empresa_id AND empresas.user_id = auth.uid())
  );

CREATE POLICY "usuarios_pueden_eliminar_clientes" ON clientes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM empresas WHERE empresas.id = clientes.empresa_id AND empresas.user_id = auth.uid())
  );

-- Políticas RLS para facturas (a través de empresa)
CREATE POLICY "usuarios_pueden_ver_sus_facturas" ON facturas
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM empresas WHERE empresas.id = facturas.empresa_id AND empresas.user_id = auth.uid())
  );

CREATE POLICY "usuarios_pueden_crear_facturas" ON facturas
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM empresas WHERE empresas.id = facturas.empresa_id AND empresas.user_id = auth.uid())
  );

CREATE POLICY "usuarios_pueden_actualizar_facturas" ON facturas
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM empresas WHERE empresas.id = facturas.empresa_id AND empresas.user_id = auth.uid())
  );

CREATE POLICY "usuarios_pueden_eliminar_facturas" ON facturas
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM empresas WHERE empresas.id = facturas.empresa_id AND empresas.user_id = auth.uid())
  );

-- Políticas RLS para items_factura (a través de factura y empresa)
CREATE POLICY "usuarios_pueden_ver_items_factura" ON items_factura
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM facturas 
      JOIN empresas ON empresas.id = facturas.empresa_id 
      WHERE facturas.id = items_factura.factura_id AND empresas.user_id = auth.uid()
    )
  );

CREATE POLICY "usuarios_pueden_crear_items_factura" ON items_factura
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM facturas 
      JOIN empresas ON empresas.id = facturas.empresa_id 
      WHERE facturas.id = items_factura.factura_id AND empresas.user_id = auth.uid()
    )
  );

CREATE POLICY "usuarios_pueden_actualizar_items_factura" ON items_factura
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM facturas 
      JOIN empresas ON empresas.id = facturas.empresa_id 
      WHERE facturas.id = items_factura.factura_id AND empresas.user_id = auth.uid()
    )
  );

CREATE POLICY "usuarios_pueden_eliminar_items_factura" ON items_factura
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM facturas 
      JOIN empresas ON empresas.id = facturas.empresa_id 
      WHERE facturas.id = items_factura.factura_id AND empresas.user_id = auth.uid()
    )
  );

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_empresas_user_id ON empresas(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_empresa_id ON clientes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_facturas_empresa_id ON facturas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente_id ON facturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_items_factura_factura_id ON items_factura(factura_id);
