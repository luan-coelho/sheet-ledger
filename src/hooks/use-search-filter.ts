'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

interface UseSearchFilterOptions {
  paramName?: string
  resetPagination?: boolean
}

interface UseSearchFilterReturn {
  searchFilter: string
  setSearchFilter: (value: string) => void
  clearSearchFilter: () => void
}

export function useSearchFilter({
  paramName = 'search',
  resetPagination = true,
}: UseSearchFilterOptions = {}): UseSearchFilterReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  const searchFilter = useMemo(() => {
    return searchParams.get(paramName) || ''
  }, [searchParams, paramName])

  const updateURL = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())

      if (value) {
        params.set(paramName, value)
      } else {
        params.delete(paramName)
      }

      // Reset pagination when searching
      if (resetPagination) {
        params.delete('page')
      }

      const queryString = params.toString()
      const url = queryString ? `?${queryString}` : window.location.pathname

      router.push(url, { scroll: false })
    },
    [router, searchParams, paramName, resetPagination],
  )

  const setSearchFilter = useCallback(
    (value: string) => {
      updateURL(value)
    },
    [updateURL],
  )

  const clearSearchFilter = useCallback(() => {
    updateURL('')
  }, [updateURL])

  return {
    searchFilter,
    setSearchFilter,
    clearSearchFilter,
  }
}
