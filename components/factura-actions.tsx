'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface FacturaActionsProps {
  facturaId: string
  estado: string
}

const estados = [
  { value: 'borrador', label: 'Borrador' },
  { value: 'emitida', label: 'Emitida' },
  { value: 'pagada', label: 'Pagada' },
  { value: 'anulada', label: 'Anulada' },
]

export function FacturaActions({ facturaId, estado }: FacturaActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentEstado, setCurrentEstado] = useState(estado)
  const router = useRouter()

  const handleEstadoChange = async (nuevoEstado: string) => {
    setIsUpdating(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('facturas')
      .update({ 
        estado: nuevoEstado,
        updated_at: new Date().toISOString()
      })
      .eq('id', facturaId)

    if (error) {
      toast.error('Error al actualizar estado')
    } else {
      setCurrentEstado(nuevoEstado)
      toast.success('Estado actualizado')
      router.refresh()
    }

    setIsUpdating(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('facturas')
      .delete()
      .eq('id', facturaId)

    if (error) {
      toast.error('Error al eliminar: ' + error.message)
      setIsDeleting(false)
      return
    }

    toast.success('Factura eliminada')
    router.push('/facturas')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground shrink-0">Estado:</span>
        <Select
          value={currentEstado}
          onValueChange={handleEstadoChange}
          disabled={isUpdating}
        >
          <SelectTrigger className="flex-1 h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {estados.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isUpdating && <Spinner />}
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="w-full h-12 text-destructive border-destructive/30">
            <Trash2 className="h-5 w-5 mr-2" />
            Eliminar Factura
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar factura</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara la factura y todos sus items permanentemente.
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
  )
}
