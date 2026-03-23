'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2, CheckCircle, Send, FileText, Clipboard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  facturaId: string
  estado: string
  numeroFactura?: string
  total?: number
}

export function FacturaActions({
  facturaId,
  estado,
  numeroFactura,
  total,
}: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [urlPDF, setUrlPDF] = useState('')

  useEffect(() => {
    setUrlPDF(`${window.location.origin}/api/pdf/${facturaId}`)
  }, [facturaId])

  const cambiarEstado = async (nuevoEstado: string) => {
    if (!supabase) {
      toast.error('No se pudo inicializar Supabase')
      return
    }

    const { error } = await supabase
      .from('facturas')
      .update({ estado: nuevoEstado })
      .eq('id', facturaId)

    if (error) {
      toast.error('Error al actualizar estado')
      return
    }

    toast.success('Estado actualizado')
    router.refresh()
  }

  const eliminarFactura = async () => {
    if (!supabase) {
      toast.error('No se pudo inicializar Supabase')
      return
    }

    const confirm = window.confirm('¿Eliminar esta factura?')
    if (!confirm) return

    const { error } = await supabase
      .from('facturas')
      .delete()
      .eq('id', facturaId)

    if (error) {
      toast.error('Error al eliminar')
      return
    }

    toast.success('Factura eliminada')
    router.push('/facturas')
  }

  const mensajeWhatsapp = `Hola, te envío la factura ${numeroFactura || ''} por importe de ${
    total
      ? Number(total).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
      : ''
  }`

  return (
    <div className="space-y-2">

      {estado !== 'pagada' && (
        <Button
          className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
          onClick={() => cambiarEstado('pagada')}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Marcar como pagada
        </Button>
      )}

      {estado === 'borrador' && (
        <Button
          variant="secondary"
          className="w-full h-12"
          onClick={() => cambiarEstado('emitida')}
        >
          <Send className="h-4 w-4 mr-2" />
          Marcar como emitida
        </Button>
      )}

      <Button variant="outline" className="w-full h-12" asChild>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(mensajeWhatsapp)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Enviar por WhatsApp
        </a>
      </Button>

      <Button
        variant="outline"
        className="w-full h-12"
        asChild
        disabled={!urlPDF}
      >
        <a href={urlPDF} target="_blank" rel="noopener noreferrer">
          <FileText className="h-4 w-4 mr-2" />
          Ver/Compartir PDF
        </a>
      </Button>

      <Button
        variant="outline"
        className="w-full h-12"
        onClick={() => {
          if (urlPDF) {
            navigator.clipboard.writeText(urlPDF)
            toast.success('Enlace copiado al portapapeles')
          }
        }}
        disabled={!urlPDF}
      >
        <Clipboard className="h-4 w-4 mr-2" />
        Copiar enlace PDF
      </Button>

      <Button
        variant="destructive"
        className="w-full h-12"
        onClick={eliminarFactura}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Eliminar factura
      </Button>
    </div>
  )
}