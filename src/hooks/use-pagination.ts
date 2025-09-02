'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

interface UsePaginationOptions {
  itemsPerPage?: number
  totalItems: number
}

interface UsePaginationReturn {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  startIndex: number
  endIndex: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  setPage: (page: number) => void
  setItemsPerPage: (itemsPerPage: number) => void
  nextPage: () => void
  previousPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
  getVisiblePages: () => (number | 'ellipsis')[]
}

export function usePagination({ itemsPerPage = 10, totalItems }: UsePaginationOptions): UsePaginationReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Obter itemsPerPage da query param "size" se disponível
  const actualItemsPerPage = useMemo(() => {
    const sizeParam = searchParams.get('size')
    if (sizeParam) {
      const parsedSize = parseInt(sizeParam, 10)
      // Validar se é um número positivo e razoável (entre 1 e 100)
      if (!isNaN(parsedSize) && parsedSize > 0 && parsedSize <= 100) {
        return parsedSize
      }
    }
    return itemsPerPage
  }, [searchParams, itemsPerPage])

  const currentPage = useMemo(() => {
    const page = parseInt(searchParams.get('page') || '1', 10)
    return Math.max(1, page)
  }, [searchParams])

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / actualItemsPerPage)
  }, [totalItems, actualItemsPerPage])

  const startIndex = useMemo(() => {
    return (currentPage - 1) * actualItemsPerPage
  }, [currentPage, actualItemsPerPage])

  const endIndex = useMemo(() => {
    return Math.min(startIndex + actualItemsPerPage, totalItems)
  }, [startIndex, actualItemsPerPage, totalItems])

  const hasNextPage = useMemo(() => {
    return currentPage < totalPages
  }, [currentPage, totalPages])

  const hasPreviousPage = useMemo(() => {
    return currentPage > 1
  }, [currentPage])

  const updateURL = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString())

      if (page === 1) {
        params.delete('page')
      } else {
        params.set('page', page.toString())
      }

      const queryString = params.toString()
      const url = queryString ? `?${queryString}` : window.location.pathname

      router.push(url, { scroll: false })
    },
    [router, searchParams],
  )

  const setPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages))
      if (validPage !== currentPage) {
        updateURL(validPage)
      }
    },
    [currentPage, totalPages, updateURL],
  )

  const setItemsPerPage = useCallback(
    (newItemsPerPage: number) => {
      const params = new URLSearchParams(searchParams.toString())

      // Validar se é um número positivo e razoável
      if (newItemsPerPage > 0 && newItemsPerPage <= 100) {
        params.set('size', newItemsPerPage.toString())
        // Reset para a primeira página quando mudar o tamanho
        params.delete('page')
      } else {
        params.delete('size')
        params.delete('page')
      }

      const queryString = params.toString()
      const url = queryString ? `?${queryString}` : window.location.pathname

      router.push(url, { scroll: false })
    },
    [router, searchParams],
  )

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage(currentPage + 1)
    }
  }, [hasNextPage, currentPage, setPage])

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPage(currentPage - 1)
    }
  }, [hasPreviousPage, currentPage, setPage])

  const goToFirstPage = useCallback(() => {
    setPage(1)
  }, [setPage])

  const goToLastPage = useCallback(() => {
    setPage(totalPages)
  }, [setPage, totalPages])

  const getVisiblePages = useCallback((): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Se temos poucas páginas, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Lógica para páginas com ellipsis
      if (currentPage <= 3) {
        // Início: 1, 2, 3, 4, ..., last
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Fim: 1, ..., last-3, last-2, last-1, last
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Meio: 1, ..., current-1, current, current+1, ..., last
        pages.push(1)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }, [currentPage, totalPages])

  return {
    currentPage,
    totalPages,
    itemsPerPage: actualItemsPerPage,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    setPage,
    setItemsPerPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    getVisiblePages,
  }
}
