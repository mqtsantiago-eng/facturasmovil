'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Empresa } from '@/lib/types'

interface EmpresaFormProps {
  empresa: Empresa
}

export function EmpresaForm({ empresa }: EmpresaFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: empresa.nombre,
    cif: empresa.cif,
    direccion: empresa.direccion,
    telefono: empresa.telefono || '',
    email: empresa.email || '',
    iva_porcentaje: empresa.iva_porcentaje,
    politica_proteccion_datos: empresa.politica_proteccion_datos || '',
    precios_con_iva: empresa.precios_con_iva || false, // ✅ NUEVO
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // const { name, value, type, checked } = e.target

    const target = e.target as HTMLInputElement

    const { name, value, type } = target

      setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value
      }))

        }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    const { error } = await supabase
      .from('empresas')
      .update({
        nombre: formData.nombre,
        cif: formData.cif,
        direccion: formData.direccion,
        telefono: formData.telefono || null,
        email: formData.email || null,
        iva_porcentaje: Number(formData.iva_porcentaje),
        politica_proteccion_datos: formData.politica_proteccion_datos || null,
        precios_con_iva: formData.precios_con_iva, // ✅ NUEVO
        updated_at: new Date().toISOString(),
      })
      .eq('id', empresa.id)

    if (error) {
      toast.error('Error al guardar: ' + error.message)
    } else {
      toast.success('Datos guardados correctamente')
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Datos fiscales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre de la empresa</Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="h-12"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cif">CIF/NIF</Label>
            <Input
              id="cif"
              name="cif"
              value={formData.cif}
              onChange={handleChange}
              required
              className="h-12"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="direccion">Direccion</Label>
            <Input
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              required
              className="h-12"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="telefono">Telefono</Label>
            <Input
              id="telefono"
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={handleChange}
              className="h-12"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="h-12"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Configuracion de facturas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="grid gap-2">
            <Label htmlFor="iva_porcentaje">IVA (%)</Label>
            <Input
              id="iva_porcentaje"
              name="iva_porcentaje"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.iva_porcentaje}
              onChange={handleChange}
              className="h-12"
            />
          </div>

          {/* ✅ NUEVO CHECKBOX */}
          <div className="flex items-center justify-between py-3 px-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Precios con IVA incluido</p>
              <p className="text-xs text-muted-foreground">
                Si activas esto, los precios que pongas ya incluirán el IVA
              </p>
            </div>
            <input
              type="checkbox"
              name="precios_con_iva"
              checked={formData.precios_con_iva}
              onChange={handleChange}
              className="h-5 w-5"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="politica_proteccion_datos">Politica de proteccion de datos</Label>
            <Textarea
              id="politica_proteccion_datos"
              name="politica_proteccion_datos"
              value={formData.politica_proteccion_datos}
              onChange={handleChange}
              placeholder="Texto legal que aparecera al pie de las facturas..."
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg">
            <span className="text-sm">Ultimo numero de factura</span>
            <span className="font-mono font-semibold">{empresa.ultimo_numero_factura}</span>
          </div>
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        className="w-full h-12 text-base" 
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
  )
}