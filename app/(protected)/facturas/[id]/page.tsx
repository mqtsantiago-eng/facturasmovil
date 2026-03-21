import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Mail } from 'lucide-react'
import Link from 'next/link'
import { FacturaActions } from '@/components/factura-actions'
import { GenerarPdfButton } from '@/components/generar-pdf-button'

const estadoColors: Record<string, string> = {
  borrador: 'bg-muted text-muted-foreground',
  emitida: 'bg-blue-100 text-blue-800',
  pagada: 'bg-green-100 text-green-800',
  anulada: 'bg-red-100 text-red-800',
}

const estadoLabels: Record<string, string> = {
  borrador: 'Borrador',
  emitida: 'Emitida',
  pagada: 'Pagada',
  anulada: 'Anulada',
}

export default async function FacturaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: empresa } = await supabase
    .from('empresas')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!empresa) {
    redirect('/empresa/configurar')
  }

  const { data: factura } = await supabase
    .from('facturas')
    .select(`
      *,
      cliente:clientes(*),
      items:items_factura(*)
    `)
    .eq('id', id)
    .eq('empresa_id', empresa.id)
    .single()

  if (!factura) {
    redirect('/facturas')
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/facturas">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold font-mono">{factura.numero_factura}</h1>
            </div>
          </div>
          <Badge className={estadoColors[factura.estado]}>
            {estadoLabels[factura.estado]}
          </Badge>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Datos de la factura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Fecha</span>
              <span className="text-sm font-medium">
                {new Date(factura.fecha).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Cliente</span>
              <span className="text-sm font-medium">{factura.cliente?.nombre}</span>
            </div>
            {factura.cliente?.cif && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">CIF Cliente</span>
                <span className="text-sm font-mono">{factura.cliente.cif}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Conceptos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {factura.items?.map((item: { id: string; nombre: string; cantidad: number; precio_unidad: number; subtotal: number }) => (
                <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.cantidad} x {Number(item.precio_unidad).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {Number(item.subtotal).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base imponible</span>
                <span>{Number(factura.total_base).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA ({empresa.iva_porcentaje}%)</span>
                <span>{Number(factura.total_iva).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t">
                <span>Total</span>
                <span>{Number(factura.total).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 pt-2">
          <GenerarPdfButton
            factura={factura}
            empresa={empresa}
          />
          
          <FacturaActions
            facturaId={factura.id}
            estado={factura.estado}
          />
        </div>
      </div>
    </div>
  )
}
