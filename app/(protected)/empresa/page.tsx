// C:\dev\facturasmovil\app\(protected)\empresa\page.tsx


import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmpresaForm } from '@/components/empresa-form'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export default async function EmpresaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: empresa } = await supabase
    .from('empresas')
    .select('*')
    .eq('user_id', user.id)
    .single()

console.log('EMPRESA:', empresa)

  if (!empresa) {
    redirect('/empresa/configurar')
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <h1 className="text-lg font-semibold">Mi Empresa</h1>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-1" />
              Salir
            </Button>
          </form>
        </div>
      </header>

      <div className="p-4">
        <EmpresaForm empresa={empresa} />
      </div>
    </div>
  )
}
