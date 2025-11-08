import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            ← Retour à l'accueil
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Politique de confidentialité</h1>

        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-600">
              Trajectory s'engage à protéger la confidentialité de vos données personnelles.
              Cette politique de confidentialité explique comment nous collectons, utilisons,
              divulguons et protégeons vos informations lorsque vous utilisez notre plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Données collectées</h2>
            <p className="text-gray-600 mb-3">Nous collectons les types de données suivants :</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Informations d'identification (nom, prénom, email)</li>
              <li>Informations sur votre entreprise (nom, SIRET, adresse)</li>
              <li>Données financières (factures, budgets, transactions)</li>
              <li>Données de connexion (adresse IP, logs)</li>
              <li>Cookies et technologies similaires</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Utilisation des données</h2>
            <p className="text-gray-600 mb-3">Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Fournir et améliorer nos services</li>
              <li>Gérer votre compte et vos abonnements</li>
              <li>Communiquer avec vous (support, mises à jour)</li>
              <li>Analyser l'utilisation de la plateforme</li>
              <li>Assurer la sécurité et prévenir la fraude</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Partage des données</h2>
            <p className="text-gray-600">
              Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos données
              uniquement avec :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Nos prestataires de services (hébergement, paiement, email)</li>
              <li>Les autorités légales si requis par la loi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Vos droits (RGPD)</h2>
            <p className="text-gray-600 mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification de vos données</li>
              <li>Droit à l'effacement (« droit à l'oubli »)</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité des données</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
            <p className="text-gray-600 mt-3">
              Pour exercer vos droits, contactez-nous à : <strong>privacy@trajectory.fr</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Sécurité des données</h2>
            <p className="text-gray-600">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles
              appropriées pour protéger vos données contre tout accès non autorisé, perte ou
              destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Conservation des données</h2>
            <p className="text-gray-600">
              Nous conservons vos données personnelles aussi longtemps que nécessaire pour
              fournir nos services et respecter nos obligations légales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Cookies</h2>
            <p className="text-gray-600">
              Notre site utilise des cookies. Consultez notre{" "}
              <Link href="/cookies" className="text-primary hover:underline">
                Politique de cookies
              </Link>{" "}
              pour plus d'informations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Modifications</h2>
            <p className="text-gray-600">
              Nous pouvons modifier cette politique de confidentialité à tout moment.
              Les modifications seront publiées sur cette page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
            <p className="text-gray-600">
              Pour toute question concernant cette politique de confidentialité, contactez-nous à :
            </p>
            <p className="text-gray-600 mt-2">
              <strong>Email :</strong> privacy@trajectory.fr<br />
              <strong>Responsable de la protection des données :</strong> DPO Trajectory
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
