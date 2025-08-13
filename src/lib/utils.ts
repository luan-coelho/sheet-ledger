import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata uma string de CNPJ adicionando pontuação
 * @param value - String contendo apenas números do CNPJ
 * @returns String formatada como XX.XXX.XXX/XXXX-XX
 */
export function formatCNPJ(value: string): string {
  // Remove tudo que não for número
  const numbers = value.replace(/\D/g, '')

  // Aplica a máscara progressivamente conforme o usuário digita
  if (numbers.length <= 2) {
    return numbers
  } else if (numbers.length <= 5) {
    return numbers.replace(/(\d{2})(\d+)/, '$1.$2')
  } else if (numbers.length <= 8) {
    return numbers.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3')
  } else if (numbers.length <= 12) {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4')
  } else {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5')
  }
}

/**
 * Remove a formatação do CNPJ, deixando apenas números
 * @param value - String com CNPJ formatado
 * @returns String contendo apenas números
 */
export function unformatCNPJ(value: string): string {
  return value.replace(/\D/g, '')
}
