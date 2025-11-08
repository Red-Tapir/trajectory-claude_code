'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full p-8 space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-destructive">Oups !</h1>
          <h2 className="text-xl font-semibold text-foreground">
            Une erreur est survenue
          </h2>
          <p className="text-sm text-muted-foreground">
            Nous sommes désolés pour la gêne occasionnée. Veuillez réessayer.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-left">
            <p className="text-xs font-mono text-red-800 break-words">
              {error.message}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button onClick={reset} className="w-full" size="lg">
            Réessayer
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
            className="w-full"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  )
}
