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

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_pueden_ver_su_empresa" ON empresas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_crear_su_empresa" ON empresas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_actualizar_su_empresa" ON empresas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_eliminar_su_empresa" ON empresas
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_empresas_user_id ON empresas(user_id);
