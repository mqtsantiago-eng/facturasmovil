'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MoreVertical } from 'lucide-react'
import { FacturaActions } from '@/components/factura-actions'

interface Props {
  facturaId: string
  estado: string
  numeroFactura: string
  total: number
}

export function FacturaActionsMenu({
  facturaId,
  estado,
  numeroFactura,
  total,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">

      {/* BOTÓN ⋮ */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-xl"
        onClick={() => setOpen(!open)}
      >
        <MoreVertical className="h-5 w-5" />
      </Button>

      {/* MENÚ */}
      {open && (
        <div className="absolute bottom-14 right-0 w-56 rounded-xl border bg-background shadow-lg p-2 space-y-2 z-50 animate-in fade-in slide-in-from-bottom-2">

          <FacturaActions
            facturaId={facturaId}
            estado={estado}
            numeroFactura={numeroFactura}
            total={total}
          />

        </div>
      )}

    </div>
  )
}