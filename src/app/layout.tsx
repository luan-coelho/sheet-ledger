import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { QueryProvider } from '@/components/query-provider'
import { SessionProvider } from '@/components/session-provider'
import { ThemeConfigProvider } from '@/components/theme-config-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Sistema - Gestão de Planilhas',
  description: 'Sistema de gestão de planilhas para profissionais de saúde',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
      </body>
    </html>
  )
}
