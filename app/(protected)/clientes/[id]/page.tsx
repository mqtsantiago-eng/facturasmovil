'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, Trash2 } from 'lucide-react'
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
import type { Cliente } from '@/lib/types'

export default function EditarClientePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const router = useRouter()
  const params = useParams()
  const clienteId = params.id as string

  useEffect(() => {
    async function fetchCliente() {
      const supabase = createClient()
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single()

      if (data) {
        setCliente(data)
      }
    }
    fetchCliente()
  }, [clienteId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error } = await supabase
      .from('clientes')
      .update({
        nombre: formData.get('nombre') as string,
        cif: formData.get('cif') as string || null,
        direccion: formData.get('direccion') as string || null,
        telefono: formData.get('telefono') as string || null,
        email: formData.get('email') as string || null,
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
    const supabase = createClient()

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

  if (!cliente) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/clientes">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">Editar Cliente</h1>
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

      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  defaultValue={cliente.nombre}
                  required
                  className="h-12"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cif">CIF/NIF</Label>
                <Input
                  id="cif"
                  name="cif"
                  defaultValue={cliente.cif || ''}
                  className="h-12"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="direccion">Direccion</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  defaultValue={cliente.direccion || ''}
                  className="h-12"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="telefono">Telefono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  defaultValue={cliente.telefono || ''}
                  className="h-12"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={cliente.email || ''}
                  className="h-12"
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full h-12 text-base mt-4" 
            disabled={isLoading}
          >
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
      </div>
    </div>
  )
}
