// C:\dev\facturasmovil\app\(protected)\facturas\[id]\page.tsx

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
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
    <div className="flex flex-col min-h-svh bg-muted/20">

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/facturas">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>

            <div>
              <p className="text-xs text-muted-foreground">Factura</p>
              <h1 className="text-base font-semibold font-mono">
                {factura.numero_factura}
              </h1>
            </div>
          </div>

          <Badge className={estadoColors[factura.estado]}>
            {estadoLabels[factura.estado]}
          </Badge>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 p-4 space-y-4 pb-32">

        {/* TOTAL DESTACADO */}
        <Card className="rounded-2xl">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total</p>
            <p className="text-3xl font-bold">
              {Number(factura.total).toLocaleString('es-ES', {
                style: 'currency',
                currency: 'EUR',
              })}
            </p>
          </CardContent>
        </Card>

        {/* INFO */}
        <Card className="rounded-2xl">
          <CardContent className="p-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha</span>
              <span>
                {new Date(factura.fecha).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente</span>
              <span className="font-medium">{factura.cliente?.nombre}</span>
            </div>

            {factura.cliente?.cif && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">CIF</span>
                <span className="font-mono">{factura.cliente.cif}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ITEMS */}
        <Card className="rounded-2xl">
          <CardContent className="p-4 space-y-3">
            {factura.items?.map((item: any) => (
              <div key={item.id} className="rounded-xl border p-3 bg-background">

                <p className="text-sm font-medium mb-1">
                  {item.nombre}
                </p>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {item.cantidad} x {Number(item.precio_unidad).toLocaleString('es-ES', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </span>

                  <span className="text-sm font-semibold text-foreground">
                    {Number(item.subtotal).toLocaleString('es-ES', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </span>
                </div>

              </div>
            ))}
          </CardContent>
        </Card>

        {/* TOTALES */}
        <Card className="rounded-2xl">
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base</span>
              <span>
                {Number(factura.total_base).toLocaleString('es-ES', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                IVA ({empresa.iva_porcentaje}%)
              </span>
              <span>
                {Number(factura.total_iva).toLocaleString('es-ES', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ACCIONES FIJAS ABAJO */}
      <div className="flex gap-2">

      {/* BOTÓN PRINCIPAL */}
      <div className="flex-1">
        <GenerarPdfButton
          factura={factura}
          empresa={empresa}
          />
      </div>

      {/* MENÚ DESPLEGABLE */}
        <details className="flex-1">

        <summary className="h-12 flex items-center justify-center rounded-xl border text-sm cursor-pointer">
          Acciones
        </summary>

        <div className="mt-2 space-y-2">
          <FacturaActions
          facturaId={factura.id}
          estado={factura.estado}
          numeroFactura={factura.numero_factura}
          total={factura.total}
          />
        </div>

      </details>

  </div>
    </div>
  )
}