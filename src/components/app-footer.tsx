export function AppFooter() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>© 2024 Sheet Ledger</span>
          <span>•</span>
          <span>Versão 1.0.0</span>
        </div>
        
        <div className="flex items-center gap-4">
          <a 
            href="/ajuda" 
            className="hover:text-foreground transition-colors"
          >
            Ajuda
          </a>
          <a 
            href="/suporte" 
            className="hover:text-foreground transition-colors"
          >
            Suporte
          </a>
          <a 
            href="/privacidade" 
            className="hover:text-foreground transition-colors"
          >
            Privacidade
          </a>
        </div>
      </div>
    </footer>
  )
}
