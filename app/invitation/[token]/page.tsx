'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CheckCircle, XCircle, Clock, Building2, UserCheck, AlertCircle } from 'lucide-react'

interface Invitation {
  id: string
  email: string
  status: string
  expiresAt: string
  createdAt: string
  organization: {
    id: string
    name: string
    logo?: string
  }
  role: {
    id: string
    displayName: string
    description?: string
  }
}

export default function InvitationPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const token = params.token as string

  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchInvitation()
  }, [token])

  async function fetchInvitation() {
    try {
      const res = await fetch(`/api/invitations/${token}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invitation invalide')
        setLoading(false)
        return
      }

      setInvitation(data.invitation)
      setLoading(false)
    } catch (err) {
      setError('Erreur lors du chargement de l\'invitation')
      setLoading(false)
    }
  }

  async function acceptInvitation() {
    if (!session?.user) {
      // Redirect to login with return URL
      router.push(`/connexion?callbackUrl=${encodeURIComponent(window.location.href)}`)
      return
    }

    setAccepting(true)
    setError(null)

    try {
      const res = await fetch(`/api/invitations/${token}/accept`, {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de l\'acceptation')
        setAccepting(false)
        return
      }

      setSuccess(true)
      setAccepting(false)

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 2000)
    } catch (err) {
      setError('Erreur lors de l\'acceptation de l\'invitation')
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'invitation...</p>
        </div>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invitation invalide
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'Cette invitation n\'existe pas ou a expiré.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  if (invitation.status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Clock className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invitation expirée
          </h1>
          <p className="text-gray-600 mb-6">
            Cette invitation a expiré. Contactez l'administrateur de <strong>{invitation.organization.name}</strong> pour en demander une nouvelle.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  if (invitation.status === 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invitation déjà acceptée
          </h1>
          <p className="text-gray-600 mb-6">
            Vous êtes déjà membre de <strong>{invitation.organization.name}</strong>.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Accéder au dashboard
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invitation acceptée !
          </h1>
          <p className="text-gray-600 mb-6">
            Bienvenue dans <strong>{invitation.organization.name}</strong> !
            <br />
            Redirection vers le dashboard...
          </p>
        </div>
      </div>
    )
  }

  // Check if user is logged in and email matches
  const emailMismatch = session?.user?.email &&
                        invitation.email.toLowerCase() !== session.user.email.toLowerCase()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">
            🎉 Vous êtes invité !
          </h1>
          <p className="text-purple-100">
            Rejoignez votre équipe sur Trajectory
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Organization Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 rounded-lg p-3">
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {invitation.organization.name}
                </h2>
                <p className="text-gray-600">
                  Vous invite à rejoindre leur organisation
                </p>
              </div>
            </div>
          </div>

          {/* Invitation Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-gray-700">
              <UserCheck className="h-5 w-5 text-purple-600" />
              <div>
                <span className="text-sm text-gray-500">Rôle attribué :</span>
                <span className="ml-2 font-semibold">{invitation.role.displayName}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <span className="text-sm text-gray-500">Expire le :</span>
                <span className="ml-2 font-semibold">
                  {new Date(invitation.expiresAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Email Mismatch Warning */}
          {emailMismatch && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-orange-900 mb-1">
                    Attention : Email différent
                  </p>
                  <p className="text-orange-700">
                    Cette invitation a été envoyée à <strong>{invitation.email}</strong> mais vous êtes connecté avec <strong>{session.user.email}</strong>.
                    <br />
                    Vous ne pourrez pas accepter cette invitation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {!session?.user ? (
              <>
                <button
                  onClick={acceptInvitation}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02]"
                >
                  Se connecter pour accepter l'invitation
                </button>
                <p className="text-center text-sm text-gray-600">
                  Pas encore de compte ?{' '}
                  <a
                    href={`/inscription?callbackUrl=${encodeURIComponent(window.location.href)}`}
                    className="text-purple-600 hover:underline font-semibold"
                  >
                    Créer un compte
                  </a>
                </p>
              </>
            ) : emailMismatch ? (
              <div className="text-center">
                <button
                  onClick={() => router.push('/api/auth/signout')}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Se déconnecter et se connecter avec {invitation.email}
                </button>
              </div>
            ) : (
              <button
                onClick={acceptInvitation}
                disabled={accepting}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {accepting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Acceptation en cours...
                  </span>
                ) : (
                  '✨ Accepter l\'invitation'
                )}
              </button>
            )}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-500">
            En acceptant cette invitation, vous rejoindrez l'organisation et aurez accès à ses données selon les permissions de votre rôle.
          </p>
        </div>
      </div>
    </div>
  )
}
