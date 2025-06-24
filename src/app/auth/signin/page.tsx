import { SignInForm } from '@/components/auth/sign-in-form'
import { FileText, Sparkles } from 'lucide-react'
import { Suspense } from 'react'

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-3/5 xl:w-2/3 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="white" fillOpacity="0.05" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

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

          {/* Main Quote/Testimonial */}
          <div className="space-y-8"></div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6"></div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-2/5 xl:w-1/3 flex items-center justify-center p-4 lg:p-8 xl:p-12 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="w-full max-w-lg space-y-8">
          {/* Mobile Brand */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sheet Ledger</h1>
              <p className="text-sm text-gray-600">Gestão Inteligente</p>
            </div>
          </div>

          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-600 uppercase tracking-wide">Bem-vindo de volta</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Administração</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Gerencie suas planilhas e relatórios com facilidade e segurança
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            <Suspense
              fallback={
                <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg animate-pulse"></div>
              }>
              <SignInForm />
            </Suspense>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-slate-50 to-blue-50/30 text-gray-500">
                  Sistema seguro e confiável
                </span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">Autenticação segura via Google</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 space-y-2"></div>
        </div>
      </div>
    </div>
  )
}
