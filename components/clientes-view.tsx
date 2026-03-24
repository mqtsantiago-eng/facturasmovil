'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Plus, Users, Phone, Mail, ChevronRight, FileText, Search } from 'lucide-react'
import Link from 'next/link'

interface Cliente {
  id: string
  nombre: string
  cif?: string | null
  telefono?: string | null
  email?: string | null
}

interface ClientesViewProps {
  clientes: Cliente[]
}

export function ClientesView({ clientes }: ClientesViewProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cliente.cif && cliente.cif.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cliente.telefono && cliente.telefono.includes(searchTerm)) ||
    (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur px-4 py-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Clientes</h1>
        <Button size="sm" asChild>
          <Link href="/clientes/nuevo">
            <Plus className="h-4 w-4 mr-1" />
            Nuevo
          </Link>
        </Button>
      </header>

      <div className="p-4 space-y-3">
        {/* Search input */}
        {clientes.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Empty state */}
        {filteredClientes.length === 0 ? (
          searchTerm ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search />
                </EmptyMedia>
                <EmptyTitle>No se encontraron clientes</EmptyTitle>
                <EmptyDescription>
                  No hay clientes que coincidan con "{searchTerm}"
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Limpiar búsqueda
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>
                <EmptyTitle>Sin clientes</EmptyTitle>
                <EmptyDescription>
                  Agrega tu primer cliente para comenzar a facturar
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild>
                  <Link href="/clientes/nuevo">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Cliente
                  </Link>
                </Button>
              </EmptyContent>
            </Empty>
          )
        ) : (
          // Listado de clientes
          filteredClientes.map(cliente => (
            <Card key={cliente.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-medium truncate">{cliente.nombre}</p>
                  {cliente.cif && <p className="text-sm text-muted-foreground">{cliente.cif}</p>}
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    {cliente.telefono && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {cliente.telefono}
                      </span>
                    )}
                    {cliente.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">{cliente.email}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Button size="sm" variant="outline" asChild className="mb-1">
                    <Link href={`/facturas/nueva?cliente=${cliente.id}`}>
                      <FileText className="h-4 w-4 mr-1" />
                      Factura
                    </Link>
                  </Button>
                  <Link href={`/clientes/${cliente.id}`}>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}