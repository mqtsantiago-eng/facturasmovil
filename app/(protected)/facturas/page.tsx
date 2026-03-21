// C:\dev\facturasmovil\app\(protected)\facturas\page.tsx

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
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
    .order('fecha', { ascending: false })

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <h1 className="text-lg font-semibold">Facturas</h1>
          <Button size="sm" asChild>
            <Link href="/facturas/nueva">
              <Plus className="h-4 w-4 mr-1" />
              Nueva
            </Link>
          </Button>
        </div>
      </header>

      <div className="p-4">
        {!facturas || facturas.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText />
              </EmptyMedia>

              <EmptyTitle>Sin facturas</EmptyTitle>

              <EmptyDescription>
                Crea tu primera factura para comenzar
              </EmptyDescription>
            </EmptyHeader>

            <EmptyContent>
              <Button asChild>
                <Link href="/facturas/nueva">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Factura
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="space-y-3">
            {facturas.map((factura) => (
              <Link key={factura.id} href={`/facturas/${factura.id}`}>
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-semibold">
                          {factura.numero_factura}
                        </p>
                        <Badge className={estadoColors[factura.estado]}>
                          {estadoLabels[factura.estado]}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground truncate">
                        {factura.cliente?.nombre || 'Cliente desconocido'}
                      </p>

                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          {new Date(factura.fecha).toLocaleDateString('es-ES')}
                        </span>
                        <span className="font-semibold">
                          {Number(factura.total).toLocaleString('es-ES', {
                            style: 'currency',
                            currency: 'EUR',
                          })}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
