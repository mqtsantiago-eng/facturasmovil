export interface Empresa {
  id: string
  user_id: string
  nombre: string
  cif: string
  direccion: string
  telefono: string | null
  email: string | null
  logo_url: string | null
  iva_porcentaje: number
  ultimo_numero_factura: number
  politica_proteccion_datos: string | null
  created_at: string
  updated_at: string
}

export interface Cliente {
  id: string
  empresa_id: string
  nombre: string
  cif: string | null
  direccion: string | null
  telefono: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface Factura {
  id: string
  empresa_id: string
  cliente_id: string
  fecha: string
  numero_factura: string
  total_base: number
  total_iva: number
  total: number
  estado: 'borrador' | 'emitida' | 'pagada' | 'anulada'
  created_at: string
  updated_at: string
  // Relaciones
  cliente?: Cliente
  items?: ItemFactura[]
}

export interface ItemFactura {
  id: string
  factura_id: string
  cantidad: number
  nombre: string
  precio_unidad: number
  subtotal: number
  created_at: string
}

export type FacturaConDetalles = Factura & {
  cliente: Cliente
  items: ItemFactura[]
  empresa: Empresa
}
