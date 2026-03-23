// C:\dev\facturasmovil\app\(protected)\facturas\nueva\page.tsx

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
      const supabase = createClient()!
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

  const iva = empresa?.iva_porcentaje ?? 0
  const preciosConIva = empresa?.precios_con_iva ?? false

  const subtotales = items.map(item =>
    round2(item.cantidad * item.precio_unidad)
  )

  const totalBruto = round2(
    subtotales.reduce((sum, val) => sum + val, 0)
  )

  let totalBase = 0
  let totalIva = 0
  let total = 0

  if (preciosConIva) {
    total = round2(totalBruto)
    totalBase = round2(total / (1 + iva / 100))
    totalIva = round2(total - totalBase)
  } else {
    totalBase = round2(totalBruto)
    totalIva = round2(totalBase * (iva / 100))
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
      toast.error('Agrega al menos un item')
      return
    }

    setIsLoading(true)
    const supabase = createClient()!

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
      toast.error('Error: ' + facturaError.message)
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
      toast.error('Error items')
      setIsLoading(false)
      return
    }

    await supabase
      .from('empresas')
      .update({ ultimo_numero_factura: nuevoNumero })
      .eq('id', empresa.id)

    toast.success('Factura creada')
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
  <div className="flex flex-col min-h-screen bg-muted/20">

    {/* HEADER */}
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/facturas">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Nueva factura</h1>
      </div>
    </header>

    {/* FORM */}
    <form
      id="form-factura"
      onSubmit={handleSubmit}
      className="flex-1 flex flex-col"
    >

      <div className="flex-1 p-4 space-y-4">

        {/* DATOS */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="space-y-1">
              <Label>Cliente *</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="h-12"
              />
            </div>

          </CardContent>
        </Card>

        {/* ITEMS */}
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Conceptos</CardTitle>
            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" />
              Añadir
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="rounded-xl border p-3 space-y-3 bg-background">

                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Item {index + 1}</span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Input
                  placeholder="Descripción"
                  value={item.nombre}
                  onChange={(e) => updateItem(item.id, 'nombre', e.target.value)}
                  className="h-12"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Cantidad"
                    value={item.cantidad}
                    onChange={(e) => updateItem(item.id, 'cantidad', parseFloat(e.target.value) || 0)}
                    className="h-12"
                  />
                  <Input
                    type="number"
                    placeholder="Precio €"
                    value={item.precio_unidad}
                    onChange={(e) => updateItem(item.id, 'precio_unidad', parseFloat(e.target.value) || 0)}
                    className="h-12"
                  />
                </div>

                <div className="text-right text-sm font-medium">
                  {round2(item.cantidad * item.precio_unidad).toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </div>

              </div>
            ))}
          </CardContent>
        </Card>

        {/* TOTAL */}
        <Card className="rounded-2xl">
          <CardContent className="pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base</span>
              <span>{totalBase.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IVA ({iva}%)</span>
              <span>{totalIva.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total</span>
              <span>{total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* FOOTER BOTÓN (MEJORADO) */}
      <div className="sticky bottom-0 p-4 border-t bg-background space-y-2">

        <Button 
          type="submit"
          className="w-full h-12 text-base rounded-xl shadow-lg"
          disabled={isLoading || !clienteId}
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2" />
              Creando...
            </>
          ) : (
            'Crear factura'
          )}
        </Button>

        {!clienteId && (
          <p className="text-xs text-muted-foreground text-center">
            Selecciona un cliente para continuar
          </p>
        )}

      </div>

    </form>

  </div>
)
}