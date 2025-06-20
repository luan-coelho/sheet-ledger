'use client'

import { useEffect, useState } from 'react'
import { useThemeConfig, useHasHydrated } from '@/lib/theme-config'

interface ThemeConfigProviderProps {
  children: React.ReactNode
}

export function ThemeConfigProvider({ children }: ThemeConfigProviderProps) {
  const { config } = useThemeConfig()
  const [mounted, setMounted] = useState(false)
  const hasHydrated = useHasHydrated()

  // Garantir que o componente só aplique mudanças após a hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Só aplicar configurações após montagem do componente e hidratação completa
    if (!mounted || !hasHydrated) return

    // Aplicar configurações de tamanho de fonte
    const htmlElement = document.documentElement

    // Remover classes anteriores de tamanho de fonte
    htmlElement.classList.remove('text-size-small', 'text-size-medium', 'text-size-large')

    // Adicionar classe de tamanho de fonte atual
    htmlElement.classList.add(`text-size-${config.fontSize}`)

    // Aplicar configuração de movimento reduzido
    if (config.reducedMotion) {
      htmlElement.classList.add('reduce-motion')
    } else {
      htmlElement.classList.remove('reduce-motion')
    }

    // Aplicar configuração de alto contraste
    if (config.highContrast) {
      htmlElement.classList.add('high-contrast')
    } else {
      htmlElement.classList.remove('high-contrast')
    }
  }, [config, mounted, hasHydrated])

  // Passe os filhos diretamente, não queremos bloquear a renderização
  return <>{children}</>
}
