import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FileText, Mail } from 'lucide-react'
import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-primary">
            <FileText className="h-8 w-8" />
            <span className="text-2xl font-bold">FacturaApp</span>
          </div>
          
          <Card className="w-full shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Cuenta Creada</CardTitle>
              <CardDescription>
                Revisa tu correo electronico
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                Te hemos enviado un correo de confirmacion. 
                Por favor, haz clic en el enlace para activar tu cuenta.
              </p>
              <Link 
                href="/auth/login"
                className="text-primary font-medium underline underline-offset-4"
              >
                Volver al inicio de sesion
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
