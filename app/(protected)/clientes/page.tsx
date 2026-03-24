// app/(protected)/clientes/page.tsx

import { createClient } from '@/lib/supabase/server'
import { ClientesView } from '@/components/clientes-view'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Redirige si no hay usuario
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirigiendo a login...</p>
      </div>
    )
  }

  // Obtener empresa del usuario
  const { data: empresa } = await supabase
    .from('empresas')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!empresa) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirigiendo a configuración de empresa...</p>
      </div>
    )
  }

  // Obtener clientes de la empresa
  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .eq('empresa_id', empresa.id)
    .order('nombre', { ascending: true })

  return <ClientesView clientes={clientes || []} />
}