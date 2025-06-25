import { LoginForm } from '@/components/login-form'
import { FileText } from 'lucide-react'
import { Suspense } from 'react'

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-3/5 xl:w-2/3 relative overflow-hidden bg-blue-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-8 lg:p-12 xl:p-16 text-white">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Sistema</h1>
              <p className="text-sm text-white/80 font-medium">Gestão de Planilhas</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div className="max-w-md">
              <h2 className="text-4xl font-bold mb-4">Gerencie suas planilhas com eficiência</h2>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-white/60">© 2025 Sistema. Sistema seguro e confiável.</div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-2/5 xl:w-1/3 flex items-center justify-center p-4 lg:p-8 xl:p-12 bg-slate-50">
        <div className="w-full max-w-lg space-y-8">
          {/* Mobile Brand */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistema</h1>
              <p className="text-sm text-gray-600">Gestão de Planilhas</p>
            </div>
          </div>

          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Acesso ao Sistema</h2>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            <Suspense
              fallback={
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-8 bg-gray-100 rounded-lg animate-pulse"></div>
                </div>
              }>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
