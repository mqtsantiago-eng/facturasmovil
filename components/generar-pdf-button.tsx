'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Empresa, Factura, Cliente, ItemFactura } from '@/lib/types'
import jsPDF from 'jspdf'

interface GenerarPdfButtonProps {
  factura: Factura & { 
    cliente: Cliente | null
    items: ItemFactura[] 
  }
  empresa: Empresa
}

export function GenerarPdfButton({ factura, empresa }: GenerarPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generarPdf = async () => {
    setIsGenerating(true)

    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      let y = 20

      // Encabezado - Datos de la empresa
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(empresa.nombre, margin, y)
      y += 8

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`CIF: ${empresa.cif}`, margin, y)
      y += 5
      doc.text(empresa.direccion, margin, y)
      y += 5
      if (empresa.telefono) {
        doc.text(`Tel: ${empresa.telefono}`, margin, y)
        y += 5
      }
      if (empresa.email) {
        doc.text(`Email: ${empresa.email}`, margin, y)
        y += 5
      }

      // Numero de factura y fecha (lado derecho)
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('FACTURA', pageWidth - margin, 25, { align: 'right' })
      
      doc.setFontSize(12)
      doc.text(factura.numero_factura, pageWidth - margin, 35, { align: 'right' })
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const fechaFormateada = new Date(factura.fecha).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      doc.text(`Fecha: ${fechaFormateada}`, pageWidth - margin, 45, { align: 'right' })

      y = 70

      // Linea separadora
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y, pageWidth - margin, y)
      y += 15

      // Datos del cliente
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('FACTURAR A:', margin, y)
      y += 7

      doc.setFont('helvetica', 'normal')
      if (factura.cliente) {
        doc.text(factura.cliente.nombre, margin, y)
        y += 5
        if (factura.cliente.cif) {
          doc.text(`CIF: ${factura.cliente.cif}`, margin, y)
          y += 5
        }
        if (factura.cliente.direccion) {
          doc.text(factura.cliente.direccion, margin, y)
          y += 5
        }
        if (factura.cliente.email) {
          doc.text(factura.cliente.email, margin, y)
          y += 5
        }
      }

      y += 15

      // Tabla de items - Encabezados
      const colWidths = {
        descripcion: 85,
        cantidad: 25,
        precio: 30,
        subtotal: 30
      }

      doc.setFillColor(240, 240, 240)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 10, 'F')
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text('DESCRIPCION', margin + 2, y)
      doc.text('CANT.', margin + colWidths.descripcion + 2, y)
      doc.text('PRECIO', margin + colWidths.descripcion + colWidths.cantidad + 2, y)
      doc.text('SUBTOTAL', margin + colWidths.descripcion + colWidths.cantidad + colWidths.precio + 2, y)
      
      y += 10

      // Items
      doc.setFont('helvetica', 'normal')
      factura.items.forEach((item) => {
        if (y > 250) {
          doc.addPage()
          y = 20
        }
        
        doc.text(item.nombre.substring(0, 40), margin + 2, y)
        doc.text(String(item.cantidad), margin + colWidths.descripcion + 2, y)
        doc.text(
          Number(item.precio_unidad).toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' EUR',
          margin + colWidths.descripcion + colWidths.cantidad + 2,
          y
        )
        doc.text(
          Number(item.subtotal).toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' EUR',
          margin + colWidths.descripcion + colWidths.cantidad + colWidths.precio + 2,
          y
        )
        y += 7
      })

      y += 10

      // Totales
      doc.setDrawColor(200, 200, 200)
      doc.line(pageWidth - 80, y, pageWidth - margin, y)
      y += 8

      doc.setFont('helvetica', 'normal')
      doc.text('Base imponible:', pageWidth - 80, y)
      doc.text(
        Number(factura.total_base).toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' EUR',
        pageWidth - margin,
        y,
        { align: 'right' }
      )
      y += 7

      doc.text(`IVA (${empresa.iva_porcentaje}%):`, pageWidth - 80, y)
      doc.text(
        Number(factura.total_iva).toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' EUR',
        pageWidth - margin,
        y,
        { align: 'right' }
      )
      y += 10

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('TOTAL:', pageWidth - 80, y)
      doc.text(
        Number(factura.total).toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' EUR',
        pageWidth - margin,
        y,
        { align: 'right' }
      )

      // Politica de proteccion de datos al pie
      if (empresa.politica_proteccion_datos) {
        const footerY = doc.internal.pageSize.getHeight() - 30
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(128, 128, 128)
        const splitText = doc.splitTextToSize(empresa.politica_proteccion_datos, pageWidth - margin * 2)
        doc.text(splitText, margin, footerY)
      }

      // Descargar PDF
      doc.save(`factura-${factura.numero_factura}.pdf`)
      toast.success('PDF generado correctamente')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Error al generar el PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={generarPdf}
      className="w-full h-12 text-base"
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Spinner className="mr-2" />
          Generando PDF...
        </>
      ) : (
        <>
          <Download className="h-5 w-5 mr-2" />
          Descargar PDF
        </>
      )}
    </Button>
  )
}
