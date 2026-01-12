"use client"

import { Component, ReactNode } from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo)

    // Send to Sentry if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="bg-red-50 rounded-full p-4 mb-4">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Une erreur est survenue
          </h2>

          <p className="text-gray-600 mb-1 max-w-md">
            {this.state.error?.message || "Erreur inconnue"}
          </p>

          <p className="text-sm text-gray-500 mb-6">
            Nous avons été notifiés du problème et travaillons à le résoudre.
          </p>

          <div className="flex gap-3">
            <Button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              variant="outline"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>

            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Retour au dashboard
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-8 max-w-2xl w-full text-left">
              <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-2">
                Détails de l'erreur (dev only)
              </summary>
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
