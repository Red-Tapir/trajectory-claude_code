import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            ← Retour à l'accueil
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Politique de cookies</h1>

        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Qu'est-ce qu'un cookie ?</h2>
            <p className="text-gray-600">
              Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, tablette,
              smartphone) lors de la visite d'un site web. Il permet de mémoriser des informations
              sur votre navigation et de reconnaître votre appareil lors de vos prochaines visites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Types de cookies utilisés</h2>

            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">Cookies essentiels</h3>
                <p className="text-gray-600">
                  Ces cookies sont nécessaires au fonctionnement du site. Ils vous permettent
                  de naviguer sur le site et d'utiliser ses fonctionnalités essentielles.
                </p>
                <ul className="list-disc pl-6 text-gray-600 mt-2 space-y-1">
                  <li>Cookie de session (authentification)</li>
                  <li>Cookie de consentement aux cookies</li>
                  <li>Cookies de sécurité (protection CSRF)</li>
                </ul>
                <p className="text-sm text-gray-500 mt-2">
                  Ces cookies ne peuvent pas être désactivés.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-xl font-semibold mb-2">Cookies analytiques</h3>
                <p className="text-gray-600">
                  Ces cookies nous aident à comprendre comment les visiteurs interagissent
                  avec notre site en collectant des informations de manière anonyme.
                </p>
                <ul className="list-disc pl-6 text-gray-600 mt-2 space-y-1">
                  <li>Google Analytics (analyse du trafic)</li>
                  <li>Statistiques d'utilisation</li>
                </ul>
                <p className="text-sm text-gray-500 mt-2">
                  Vous pouvez désactiver ces cookies via le bandeau de consentement.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-xl font-semibold mb-2">Cookies de fonctionnalité</h3>
                <p className="text-gray-600">
                  Ces cookies permettent de mémoriser vos préférences et de personnaliser
                  votre expérience sur le site.
                </p>
                <ul className="list-disc pl-6 text-gray-600 mt-2 space-y-1">
                  <li>Préférences de langue</li>
                  <li>Paramètres d'affichage</li>
                  <li>Préférences d'interface</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Durée de conservation</h2>
            <p className="text-gray-600 mb-3">
              La durée de conservation des cookies varie selon leur type :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Cookies de session :</strong> Supprimés à la fermeture du navigateur</li>
              <li><strong>Cookies de consentement :</strong> 12 mois</li>
              <li><strong>Cookies analytiques :</strong> 13 mois</li>
              <li><strong>Cookies de préférences :</strong> 12 mois</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Gestion des cookies</h2>
            <p className="text-gray-600 mb-3">
              Vous pouvez gérer vos préférences de cookies de plusieurs façons :
            </p>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-2">Via le bandeau de consentement</h4>
              <p className="text-gray-600 text-sm">
                Lors de votre première visite, un bandeau vous permet d'accepter ou de refuser
                les cookies non essentiels.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Via votre navigateur</h4>
              <p className="text-gray-600 text-sm mb-2">
                Vous pouvez configurer votre navigateur pour refuser tous les cookies ou pour
                être informé lorsqu'un cookie est déposé :
              </p>
              <ul className="list-disc pl-6 text-gray-600 text-sm space-y-1">
                <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
                <li><strong>Firefox :</strong> Paramètres → Vie privée et sécurité</li>
                <li><strong>Safari :</strong> Préférences → Confidentialité</li>
                <li><strong>Edge :</strong> Paramètres → Cookies et autorisations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Cookies tiers</h2>
            <p className="text-gray-600">
              Certains cookies sont déposés par des services tiers que nous utilisons :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-2">
              <li><strong>Google Analytics :</strong> Analyse du trafic et du comportement utilisateur</li>
              <li><strong>Authentification OAuth :</strong> Google, GitHub (si vous utilisez la connexion sociale)</li>
            </ul>
            <p className="text-gray-600 mt-3">
              Ces services tiers ont leurs propres politiques de confidentialité et de cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Impact du refus des cookies</h2>
            <p className="text-gray-600">
              Si vous refusez les cookies non essentiels :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-2">
              <li>✅ Vous pourrez toujours utiliser les fonctionnalités principales du site</li>
              <li>⚠️ Certaines fonctionnalités de personnalisation peuvent ne pas fonctionner</li>
              <li>⚠️ Nous ne pourrons pas améliorer le site en fonction de votre utilisation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
            <p className="text-gray-600">
              Pour toute question concernant notre utilisation des cookies, contactez-nous à :
            </p>
            <p className="text-gray-600 mt-2">
              <strong>Email :</strong> privacy@trajectory.fr
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-12">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
    </div>
  )
}
