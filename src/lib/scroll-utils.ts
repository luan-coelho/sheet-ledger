import { RefObject } from 'react'

/**
 * Opções para configurar o comportamento do scroll automático
 */
export interface ScrollOptions {
  /** Delay em milissegundos antes de executar o scroll (padrão: 100) */
  delay?: number
  /** Comportamento do scroll (padrão: 'smooth') */
  behavior?: ScrollBehavior
  /** Posição do bloco (padrão: 'center') */
  block?: ScrollLogicalPosition
  /** Posição inline (padrão: 'nearest') */
  inline?: ScrollLogicalPosition
}

/**
 * Utilitário para scroll automático com delay
 * @param elementRef Referência do elemento React
 * @param options Opções de configuração do scroll
 */
export function scrollToElement(elementRef: RefObject<HTMLElement | null>, options: ScrollOptions = {}): void {
  const { delay = 100, behavior = 'smooth', block = 'center', inline = 'nearest' } = options

  setTimeout(() => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({
        behavior,
        block,
        inline,
      })
    }
  }, delay)
}

/**
 * Hook para criar uma função de scroll automático configurada
 * @param elementRef Referência do elemento React
 * @param options Opções de configuração do scroll
 * @returns Função para executar o scroll
 */
export function createScrollHandler(elementRef: RefObject<HTMLElement | null>, options: ScrollOptions = {}) {
  return () => scrollToElement(elementRef, options)
}

/**
 * Executa scroll para múltiplos elementos em sequência
 * @param refs Array de referências de elementos
 * @param options Opções de configuração do scroll
 */
export function scrollToElements(refs: RefObject<HTMLElement | null>[], options: ScrollOptions = {}): void {
  refs.forEach((ref, index) => {
    const delay = (options.delay || 100) + index * 50 // Adiciona delay progressivo
    scrollToElement(ref, { ...options, delay })
  })
}
