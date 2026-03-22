'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { Cliente, Empresa } from '@/lib/types'

interface ItemFactura {
  id: string
  nombre: string
  cantidad: number
  precio_unidad: number
}

// ✅ FUNCIÓN DE REDONDEO PROFESIONAL
const round2 = (num: number) => Math.round(num * 100) / 100

export default function NuevaFacturaPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteId, setClienteId] = useState<string>('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [items, setItems] = useState<ItemFactura[]>([
    { id: crypto.randomUUID(), nombre: '', cantidad: 1, precio_unidad: 0 }
  ])
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: emp } = await supabase
        .from('empresas')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (emp) {
        setEmpresa(emp)
        
        const { data: cls } = await supabase
          .from('clientes')
          .select('*')
          .eq('empresa_id', emp.id)
          .order('nombre')

        setClientes(cls || [])
      }
    }
    fetchData()
  }, [])

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), nombre: '', cantidad: 1, precio_unidad: 0 }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof ItemFactura, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  // ✅ VALORES SEGUROS
  const iva = empresa?.iva_porcentaje ?? 0
  const preciosConIva = empresa?.precios_con_iva ?? false

  // 🔥 1. REDONDEO POR LÍNEA (CLAVE EN ESPAÑA)
  const subtotales = items.map(item =>
    round2(item.cantidad * item.precio_unidad)
  )

  const totalBruto = round2(
    subtotales.reduce((sum, val) => sum + val, 0)
  )

  let totalBase = 0
  let totalIva = 0
  let total = 0

  // 🔥 2. LÓGICA CORRECTA CON REDONDEO
  if (preciosConIva) {
    total = round2(totalBruto)

    totalBase = round2(
      total / (1 + iva / 100)
    )

    totalIva = round2(total - totalBase)

  } else {
    totalBase = round2(totalBruto)

    totalIva = round2(
      totalBase * (iva / 100)
    )

    total = round2(totalBase + totalIva)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresa || !clienteId) {
      toast.error('Selecciona un cliente')
      return
    }

    const validItems = items.filter(item => item.nombre.trim() && item.cantidad > 0 && item.precio_unidad > 0)
    if (validItems.length === 0) {
      toast.error('Agrega al menos un item a la factura')
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    const nuevoNumero = empresa.ultimo_numero_factura + 1
    const numeroFactura = `${new Date().getFullYear()}-${String(nuevoNumero).padStart(4, '0')}`

    const { data: factura, error: facturaError } = await supabase
      .from('facturas')
      .insert({
        empresa_id: empresa.id,
        cliente_id: clienteId,
        fecha,
        numero_factura: numeroFactura,
        total_base: totalBase,
        total_iva: totalIva,
        total,
        estado: 'borrador',
      })
      .select()
      .single()

    if (facturaError) {
      toast.error('Error al crear factura: ' + facturaError.message)
      setIsLoading(false)
      return
    }

    const itemsToInsert = validItems.map(item => ({
      factura_id: factura.id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio_unidad: item.precio_unidad,
    }))

    const { error: itemsError } = await supabase
      .from('items_factura')
      .insert(itemsToInsert)

    if (itemsError) {
      toast.error('Error al crear items: ' + itemsError.message)
      setIsLoading(false)
      return
    }

    await supabase
      .from('empresas')
      .update({ ultimo_numero_factura: nuevoNumero })
      .eq('id', empresa.id)

    toast.success('Factura creada correctamente')
    router.push(`/facturas/${factura.id}`)
  }

  if (!empresa) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/facturas">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Nueva Factura</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* TODO tu UI intacta */}
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Datos generales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Cliente *</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clientes.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No tienes clientes.{' '}
                  <Link href="/clientes/nuevo" className="text-primary underline">
                    Crear uno
                  </Link>
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="h-12"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Conceptos</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="p-3 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Item {index + 1}</span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Descripcion del concepto"
                  value={item.nombre}
                  onChange={(e) => updateItem(item.id, 'nombre', e.target.value)}
                  className="h-12"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Cantidad</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.cantidad}
                      onChange={(e) => updateItem(item.id, 'cantidad', parseFloat(e.target.value) || 0)}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Precio unitario</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.precio_unidad}
                      onChange={(e) => updateItem(item.id, 'precio_unidad', parseFloat(e.target.value) || 0)}
                      className="h-12"
                    />
                  </div>
                </div>
                <div className="text-right text-sm">
                  Subtotal: <span className="font-semibold">
                    {(item.cantidad * item.precio_unidad).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base imponible</span>
                <span>{totalBase.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA ({empresa.iva_porcentaje}%)</span>
                <span>{totalIva.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>{total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full h-12 text-base" 
          disabled={isLoading || !clienteId}
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2" />
              Creando...
            </>
          ) : (
            'Crear Factura'
          )}
        </Button>
      </form>
    </div>
  )
}
