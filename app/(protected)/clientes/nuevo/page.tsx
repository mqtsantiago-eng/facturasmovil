'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function NuevoClientePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [empresaId, setEmpresaId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function getEmpresa() {
      const supabase = createClient()!
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: empresa } = await supabase
        .from('empresas')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (empresa) {
        setEmpresaId(empresa.id)
      }
    }
    getEmpresa()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!empresaId) {
      toast.error('Error: No se encontro la empresa')
      return
    }

    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const supabase = createClient()!

    const { error } = await supabase.from('clientes').insert({
      empresa_id: empresaId,
      nombre: formData.get('nombre') as string,
      cif: formData.get('cif') as string || null,
      direccion: formData.get('direccion') as string || null,
      telefono: formData.get('telefono') as string || null,
      email: formData.get('email') as string || null,
    })

    if (error) {
      toast.error('Error al crear cliente: ' + error.message)
      setIsLoading(false)
      return
    }

    toast.success('Cliente creado correctamente')
    router.push('/clientes')
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/clientes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Nuevo Cliente</h1>
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
                  placeholder="Nombre del cliente"
                  required
                  className="h-12"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cif">CIF/NIF</Label>
                <Input
                  id="cif"
                  name="cif"
                  placeholder="B12345678"
                  className="h-12"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="direccion">Direccion</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  placeholder="Direccion completa"
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
                  placeholder="cliente@ejemplo.com"
                  className="h-12"
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full h-12 text-base mt-4" 
            disabled={isLoading || !empresaId}
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Guardando...
              </>
            ) : (
              'Guardar Cliente'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
