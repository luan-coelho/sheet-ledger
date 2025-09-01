import GrupoEstimulos from '@/images/grupo-estimulos.png'
import IconeEstimulos from '@/images/icone-estimulos.png'
import { FileText } from 'lucide-react'
import Image from 'next/image'
import { Suspense } from 'react'

import { LoginForm } from '@/components/login-form'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Hero Section */}
      <div className="bg-primary relative hidden overflow-hidden lg:flex lg:w-3/5 xl:w-2/3">
        {/* Background Textures and Patterns */}
        <div className="absolute inset-0">
          <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Organic flowing texture */}
              <filter id="organicNoise">
                <feTurbulence
                  type="turbulence"
                  baseFrequency="0.02 0.08"
                  numOctaves="3"
                  stitchTiles="stitch"
                  result="noise"
                />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
                <feColorMatrix type="saturate" values="0" />
                <feComponentTransfer>
                  <feFuncA type="discrete" tableValues="0.05 0.1 0.15" />
                </feComponentTransfer>
              </filter>

              {/* Flowing waves pattern */}
              <pattern id="wavesPattern" x="0" y="0" width="200" height="100" patternUnits="userSpaceOnUse">
                <path d="M0,50 Q50,20 100,50 T200,50" stroke="white" strokeWidth="1" strokeOpacity="0.06" fill="none" />
                <path
                  d="M0,30 Q50,10 100,30 T200,30"
                  stroke="white"
                  strokeWidth="0.8"
                  strokeOpacity="0.04"
                  fill="none"
                />
                <path
                  d="M0,70 Q50,40 100,70 T200,70"
                  stroke="white"
                  strokeWidth="1.2"
                  strokeOpacity="0.08"
                  fill="none"
                />
              </pattern>

              {/* Geometric hexagon pattern */}
              <pattern id="hexPattern" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
                <polygon
                  points="30,8 22,22 8,22 0,8 8,-6 22,-6"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                  strokeOpacity="0.05"
                />
                <polygon
                  points="30,34 22,48 8,48 0,34 8,20 22,20"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                  strokeOpacity="0.05"
                />
                <polygon
                  points="60,21 52,35 38,35 30,21 38,7 52,7"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                  strokeOpacity="0.05"
                />
              </pattern>

              {/* Soft gradient overlay */}
              <radialGradient id="softGradient" cx="20%" cy="20%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="40%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
              </radialGradient>

              {/* Diagonal lines texture */}
              <pattern id="diagonalLines" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M0,20 L20,0" stroke="white" strokeWidth="0.3" strokeOpacity="0.03" />
                <path d="M-5,5 L5,-5" stroke="white" strokeWidth="0.3" strokeOpacity="0.03" />
                <path d="M15,25 L25,15" stroke="white" strokeWidth="0.3" strokeOpacity="0.03" />
              </pattern>
            </defs>

            {/* Apply layered textures */}
            <rect width="100%" height="100%" fill="url(#hexPattern)" />
            <rect width="100%" height="100%" fill="url(#wavesPattern)" />
            <rect width="100%" height="100%" fill="url(#diagonalLines)" />
            <rect width="100%" height="100%" filter="url(#organicNoise)" opacity="0.4" />
            <rect width="100%" height="100%" fill="url(#softGradient)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-8 text-white lg:p-12 xl:p-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
              <Image className="h-6 w-6" src={GrupoEstimulos} alt="Grupo Estímulos" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Grupo Estímulos</h1>
              <p className="text-sm font-medium text-white/80">Neurodesenvolvimento</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div className="max-w-md">
              <Image className="mb-4" src={IconeEstimulos} alt="Ícone Estímulos" width={200} height={200} />
              <h2 className="mb-4 text-4xl font-bold">Geração de Frequência</h2>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-white/60">© 2025 Sistema. Sistema seguro e confiável.</div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 p-4 lg:w-2/5 lg:p-8 xl:w-1/3 xl:p-12">
        <div className="w-full max-w-lg space-y-8">
          {/* Mobile Brand */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistema</h1>
              <p className="text-sm text-gray-600">Gestão de Planilhas</p>
            </div>
          </div>

          {/* Welcome Header */}
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 lg:text-4xl">Acesso ao Sistema</h2>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            <Suspense
              fallback={
                <div className="space-y-4">
                  <div className="h-12 animate-pulse rounded-lg bg-gray-200"></div>
                  <div className="h-8 animate-pulse rounded-lg bg-gray-100"></div>
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
