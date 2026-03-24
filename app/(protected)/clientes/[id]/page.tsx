'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge' // <-- este
import { ArrowLeft, Trash2, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

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

interface Cliente {
  id: string
  nombre: string
  cif?: string
  direccion?: string
  telefono?: string
  email?: string
}

interface Factura {
  id: string
  numero_factura: string
  estado: string
  total: number
}

export default function EditarClientePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState('')
  const router = useRouter()
  const params = useParams()
  const clienteId = params.id as string

  const supabase = createClient()!

  useEffect(() => {
    async function fetchCliente() {
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single()

      if (clienteData) {
        setCliente(clienteData)
      }

      const { data: facturasData } = await supabase
        .from('facturas')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('fecha', { ascending: false })

      setFacturas(facturasData || [])
    }
    fetchCliente()
  }, [clienteId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const { error } = await supabase
      .from('clientes')
      .update({
        nombre: formData.get('nombre') as string,
        cif: (formData.get('cif') as string) || null,
        direccion: (formData.get('direccion') as string) || null,
        telefono: (formData.get('telefono') as string) || null,
        email: (formData.get('email') as string) || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clienteId)

    if (error) {
      toast.error('Error al guardar: ' + error.message)
    } else {
      toast.success('Cliente actualizado')
    }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', clienteId)

    if (error) {
      toast.error('Error al eliminar: ' + error.message)
      setIsDeleting(false)
      return
    }

    toast.success('Cliente eliminado')
    router.push('/clientes')
  }

  const facturasFiltradas = facturas.filter((f) => {
  const coincideEstado = filtroEstado === 'todos' || f.estado === filtroEstado
  const coincideBusqueda = f.numero_factura
    .toLowerCase()
    .includes(busqueda.toLowerCase())

  return coincideEstado && coincideBusqueda
})

  if (!cliente) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-svh">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/clientes">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold truncate">{cliente.nombre}</h1>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive">
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta accion no se puede deshacer. Se eliminara el cliente permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Formulario editar cliente */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input id="nombre" name="nombre" defaultValue={cliente.nombre} required className="h-12" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cif">CIF/NIF</Label>
                <Input id="cif" name="cif" defaultValue={cliente.cif || ''} className="h-12" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" name="direccion" defaultValue={cliente.direccion || ''} className="h-12" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" name="telefono" type="tel" defaultValue={cliente.telefono || ''} className="h-12" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={cliente.email || ''} className="h-12" />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full h-12 text-base mt-4" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </form>

{/* Buscador de facturas */}
<div className="relative pt-4">

  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

  <Input
    placeholder="Buscar factura..."
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value)}
    className="pl-9 h-10"
  />

</div>




        {/* Filtro estado facturas */}
        <div className="flex gap-2 overflow-x-auto pt-4">
          {['todos', 'borrador', 'emitida', 'pagada', 'anulada'].map(estado => (
            <Button
              key={estado}
              size="sm"
              variant={filtroEstado === estado ? 'default' : 'outline'}
              onClick={() => setFiltroEstado(estado)}
            >
              {estado === 'todos' ? 'Todos' : estadoLabels[estado]}
            </Button>
          ))}
        </div>

        {/* Lista facturas */}
        {facturasFiltradas.length === 0 ? (
          <Card className="p-4 text-center text-sm text-muted-foreground">
            Este cliente no tiene facturas
          </Card>
        ) : (
          <div className="space-y-3 pt-2">
            {facturasFiltradas.map(f => (
              <Link key={f.id} href={`/facturas/${f.id}`}>
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="flex justify-between items-center p-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-semibold truncate">{f.numero_factura}</p>
                      <span className="text-sm text-muted-foreground">
                        {f.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                    <Badge className={estadoColors[f.estado]}>
                      {estadoLabels[f.estado]}
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground ml-2" />
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