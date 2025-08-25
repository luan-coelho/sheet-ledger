import { Code2 } from 'lucide-react'

export function AppFooter() {
  return (
    <footer className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-t px-4 py-3 backdrop-blur">
      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            © 2025 - Desenvolvido por{' '}
            <a
              href="https://github.com/luan-coelho"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary inline-flex items-center gap-1 hover:underline">
              <Code2 className="h-3 w-3" />
              Luan Coelho
            </a>
          </span>
          <span>•</span>
          <span>Versão 1.0.0</span>
        </div>
      </div>
    </footer>
  )
}
