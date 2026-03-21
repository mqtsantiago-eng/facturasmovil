import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Empty } from '@/components/ui/empty'
import { Plus, Users, Phone, Mail, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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

  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .eq('empresa_id', empresa.id)
    .order('nombre', { ascending: true })

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <h1 className="text-lg font-semibold">Clientes</h1>
          <Button size="sm" asChild>
            <Link href="/clientes/nuevo">
              <Plus className="h-4 w-4 mr-1" />
              Nuevo
            </Link>
          </Button>
        </div>
      </header>

      <div className="p-4">
        {!clientes || clientes.length === 0 ? (
          <Empty
            icon={Users}
            title="Sin clientes"
            description="Agrega tu primer cliente para comenzar a facturar"
          >
            <Button asChild>
              <Link href="/clientes/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Cliente
              </Link>
            </Button>
          </Empty>
        ) : (
          <div className="space-y-3">
            {clientes.map((cliente) => (
              <Link key={cliente.id} href={`/clientes/${cliente.id}`}>
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{cliente.nombre}</p>
                      {cliente.cif && (
                        <p className="text-sm text-muted-foreground">{cliente.cif}</p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        {cliente.telefono && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {cliente.telefono}
                          </span>
                        )}
                        {cliente.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">{cliente.email}</span>
                          </span>
                        )}
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
