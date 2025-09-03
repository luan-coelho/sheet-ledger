import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'

import { QueryProvider } from './query-provider'
import { SessionProvider } from './session-provider'
import { ThemeConfigProvider } from './theme-config-provider'
import { ThemeProvider } from './theme-provider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="sheet-ledger-theme">
      <ThemeConfigProvider>
        <SessionProvider>
          <QueryProvider>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
            <Toaster
              expand
              richColors
              toastOptions={{
                duration: 5000,
              }}
            />
          </QueryProvider>
        </SessionProvider>
      </ThemeConfigProvider>
    </ThemeProvider>
  )
}
