import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="flex flex-col items-center space-y-2 md:flex-row md:space-y-0 md:space-x-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Computer Society of Sri Lanka (CSSL). All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <a href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="/support" className="hover:text-primary transition-colors">
              Support
            </a>
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>Developed with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>by</span>
            <a
              href="https://veloce.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline transition-colors"
            >
              VELOCE
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
