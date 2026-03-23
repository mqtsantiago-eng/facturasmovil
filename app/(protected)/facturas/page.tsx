// C:\dev\facturasmovil\app\(protected)\facturas\page.tsx

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { Plus, FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'

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

export default async function FacturasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: empresa } = await supabase
    .from('empresas')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!empresa) {
    redirect('/empresa/configurar')
  }

  const { data: facturas } = await supabase
    .from('facturas')
    .select(`
      *,
      cliente:clientes(nombre)
    `)
    .eq('empresa_id', empresa.id)
    .order('created_at', { ascending: false })
    .order('numero_factura', { ascending: false })

  return (
    <div className="flex flex-col min-h-svh bg-muted/20">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Facturas</h1>

          <Button size="default" className="h-10 px-4" asChild>
            <Link href="/facturas/nueva">
              <Plus className="h-4 w-4 mr-2" />
              Nueva
            </Link>
          </Button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 p-4 pb-24">
        {!facturas || facturas.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText />
              </EmptyMedia>

              <EmptyTitle>Sin facturas</EmptyTitle>

              <EmptyDescription>
                Crea tu primera factura en segundos
              </EmptyDescription>
            </EmptyHeader>

            <EmptyContent>
              <Button size="lg" className="w-full" asChild>
                <Link href="/facturas/nueva">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear factura
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="space-y-3">
            {facturas.map((factura) => (
              <Link key={factura.id} href={`/facturas/${factura.id}`}>
                <Card className="active:scale-[0.98] transition-transform rounded-2xl shadow-sm border">
                  <CardContent className="p-4">
                    
                    {/* TOP ROW */}
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-mono text-sm font-semibold">
                        {factura.numero_factura}
                      </p>

                      <Badge
                        className={`text-xs px-2 py-0.5 ${estadoColors[factura.estado]}`}
                      >
                        {estadoLabels[factura.estado]}
                      </Badge>
                    </div>

                    {/* CLIENTE */}
                    <p className="text-sm text-muted-foreground truncate">
                      {factura.cliente?.nombre || 'Cliente desconocido'}
                    </p>

                    {/* BOTTOM ROW */}
                    <div className="flex items-end justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(factura.fecha).toLocaleDateString('es-ES')}
                      </span>

                      <span className="text-lg font-bold">
                        {Number(factura.total).toLocaleString('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </span>
                    </div>

                    {/* CHEVRON */}
                    <div className="flex justify-end mt-2">
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>

                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* BOTÓN FLOTANTE (CLAVE UX MÓVIL) */}
      {facturas && facturas.length > 0 && (
        <div className="fixed bottom-5 right-5">
          <Button size="lg" className="h-14 w-14 rounded-full shadow-lg" asChild>
            <Link href="/facturas/nueva">
              <Plus className="h-6 w-6" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}