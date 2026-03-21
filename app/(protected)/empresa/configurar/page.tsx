'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ConfigurarEmpresaPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Debes iniciar sesion')
      setIsLoading(false)
      return
    }

    const { error } = await supabase.from('empresas').insert({
      user_id: user.id,
      nombre: formData.get('nombre') as string,
      cif: formData.get('cif') as string,
      direccion: formData.get('direccion') as string,
      telefono: formData.get('telefono') as string,
      email: formData.get('email') as string,
      iva_porcentaje: 21,
      ultimo_numero_factura: 0,
    })

    if (error) {
      toast.error('Error al crear la empresa: ' + error.message)
      setIsLoading(false)
      return
    }

    toast.success('Empresa configurada correctamente')
    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-primary">
            <FileText className="h-8 w-8" />
            <span className="text-2xl font-bold">FacturaApp</span>
          </div>

          <Card className="w-full shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Configura tu Empresa</CardTitle>
              <CardDescription>
                Introduce los datos de tu empresa para empezar a facturar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nombre">Nombre de la empresa *</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      placeholder="Mi Empresa S.L."
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cif">CIF/NIF *</Label>
                    <Input
                      id="cif"
                      name="cif"
                      placeholder="B12345678"
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="direccion">Direccion *</Label>
                    <Input
                      id="direccion"
                      name="direccion"
                      placeholder="Calle Mayor 1, 28001 Madrid"
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="telefono">Telefono</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      placeholder="912345678"
                      className="h-12"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="contacto@miempresa.com"
                      className="h-12"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base mt-2" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner className="mr-2" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar y Continuar'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
