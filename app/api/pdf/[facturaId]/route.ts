import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import jsPDF from 'jspdf'
import type { Empresa, Factura, Cliente, ItemFactura } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ facturaId: string }> }
) {
  try {
    const { facturaId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: empresa } = await supabase
      .from('empresas')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa not found' }, { status: 404 })
    }

    const { data: factura } = await supabase
      .from('facturas')
      .select(`
        *,
        cliente:clientes(*),
        items:items_factura(*)
      `)
      .eq('id', facturaId)
      .eq('empresa_id', empresa.id)
      .single()

    if (!factura) {
      return NextResponse.json({ error: 'Factura not found' }, { status: 404 })
    }

    // Generate PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let y = 20

    // Header - Company data
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

    // Invoice number and date (right side)
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

    // Separator line
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, y, pageWidth - margin, y)
    y += 15

    // Client data
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

    // Items table header
    doc.setFont('helvetica', 'bold')
    doc.text('Descripción', margin, y)
    doc.text('Cant.', 120, y)
    doc.text('Precio', 150, y)
    doc.text('Total', pageWidth - margin, y, { align: 'right' })
    y += 5

    doc.line(margin, y, pageWidth - margin, y)
    y += 8

    // Items
    doc.setFont('helvetica', 'normal')
    factura.items?.forEach((item: ItemFactura) => {
      if (y > 250) {
        doc.addPage()
        y = 20
      }

      doc.text(item.nombre || '', margin, y)
      doc.text(item.cantidad?.toString() || '0', 120, y)
      doc.text(
        Number(item.precio_unidad || 0).toLocaleString('es-ES', {
          style: 'currency',
          currency: 'EUR'
        }),
        150,
        y
      )
      doc.text(
        Number(item.subtotal || 0).toLocaleString('es-ES', {
          style: 'currency',
          currency: 'EUR'
        }),
        pageWidth - margin,
        y,
        { align: 'right' }
      )
      y += 8
    })

    y += 10

    // Totals
    if (y > 220) {
      doc.addPage()
      y = 20
    }

    doc.line(pageWidth - 80, y, pageWidth - margin, y)
    y += 8

    doc.setFont('helvetica', 'bold')
    doc.text('Base imponible:', pageWidth - 80, y)
    doc.text(
      Number(factura.total_base || 0).toLocaleString('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }),
      pageWidth - margin,
      y,
      { align: 'right' }
    )
    y += 6

    doc.text(`IVA (${empresa.iva_porcentaje}%):`, pageWidth - 80, y)
    doc.text(
      Number(factura.total_iva || 0).toLocaleString('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }),
      pageWidth - margin,
      y,
      { align: 'right' }
    )
    y += 6

    doc.setFontSize(12)
    doc.text('TOTAL:', pageWidth - 80, y)
    doc.text(
      Number(factura.total || 0).toLocaleString('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }),
      pageWidth - margin,
      y,
      { align: 'right' }
    )

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer')

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${factura.numero_factura}.pdf"`,
      },
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}