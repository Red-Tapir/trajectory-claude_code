export default function CGUPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Conditions Générales d'Utilisation (CGU)</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir les
              modalités et conditions dans lesquelles Trajectory met à disposition de ses utilisateurs la plateforme
              SaaS Trajectory, accessible à l'adresse www.trajectory-app.com.
            </p>
            <p>
              L'utilisation de la plateforme Trajectory implique l'acceptation pleine et entière des présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Définitions</h2>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>« Plateforme »</strong> : désigne le logiciel SaaS Trajectory accessible via www.trajectory-app.com</li>
              <li><strong>« Utilisateur »</strong> : désigne toute personne physique ou morale utilisant la Plateforme</li>
              <li><strong>« Compte »</strong> : désigne l'espace personnel créé par l'Utilisateur sur la Plateforme</li>
              <li><strong>« Services »</strong> : désigne l'ensemble des fonctionnalités proposées par Trajectory (CRM, facturation, planification financière)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Accès à la Plateforme</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.1 Conditions d'accès</h3>
            <p>
              L'accès à la Plateforme est réservé :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Aux personnes physiques majeures disposant de la pleine capacité juridique</li>
              <li>Aux personnes morales dûment représentées</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.2 Création de compte</h3>
            <p>
              Pour utiliser les Services, l'Utilisateur doit créer un Compte en fournissant des informations exactes,
              complètes et à jour. L'Utilisateur s'engage à :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Fournir des informations véridiques lors de l'inscription</li>
              <li>Maintenir la confidentialité de ses identifiants de connexion</li>
              <li>Informer immédiatement Trajectory de toute utilisation non autorisée de son Compte</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.3 Période d'essai</h3>
            <p>
              Trajectory propose une période d'essai gratuite de 14 jours permettant de tester l'ensemble des
              fonctionnalités de la Plateforme. Aucune carte bancaire n'est requise pour bénéficier de l'essai gratuit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Utilisation des Services</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.1 Licence d'utilisation</h3>
            <p>
              Trajectory concède à l'Utilisateur une licence non exclusive, non transférable et révocable d'utilisation
              de la Plateforme, uniquement pour ses besoins professionnels internes.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Obligations de l'Utilisateur</h3>
            <p>L'Utilisateur s'engage à :</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Utiliser la Plateforme conformément à sa destination et aux présentes CGU</li>
              <li>Ne pas utiliser la Plateforme à des fins illégales ou non autorisées</li>
              <li>Ne pas tenter de contourner les mesures de sécurité de la Plateforme</li>
              <li>Ne pas porter atteinte aux droits de propriété intellectuelle de Trajectory</li>
              <li>Ne pas collecter ou extraire des données de la Plateforme par des moyens automatisés</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.3 Interdictions</h3>
            <p>Il est strictement interdit de :</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Revendre, louer ou céder l'accès à la Plateforme</li>
              <li>Décompiler, désassembler ou faire de l'ingénierie inverse</li>
              <li>Utiliser la Plateforme pour envoyer du spam ou du contenu malveillant</li>
              <li>Perturber le fonctionnement de la Plateforme ou des serveurs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Données et Propriété intellectuelle</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Données de l'Utilisateur</h3>
            <p>
              L'Utilisateur conserve l'entière propriété de ses données. Trajectory s'engage à ne pas utiliser,
              divulguer ou commercialiser les données de l'Utilisateur sans son consentement explicite.
            </p>
            <p>
              Pour plus d'informations, consultez notre{' '}
              <a href="/politique-confidentialite" className="text-primary hover:underline">
                Politique de confidentialité
              </a>.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.2 Propriété intellectuelle de Trajectory</h3>
            <p>
              La Plateforme, son contenu (textes, images, logos, etc.) et son code source sont la propriété exclusive
              de Trajectory et sont protégés par les lois relatives à la propriété intellectuelle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Disponibilité et maintenance</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">6.1 Disponibilité</h3>
            <p>
              Trajectory s'efforce de maintenir la Plateforme accessible 24h/24, 7j/7. Toutefois, la disponibilité
              de la Plateforme n'est pas garantie et peut être interrompue pour des raisons de maintenance,
              de mise à jour ou en cas de force majeure.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">6.2 Maintenance</h3>
            <p>
              Trajectory se réserve le droit d'effectuer des opérations de maintenance, avec ou sans préavis.
              Nous nous efforçons de planifier les maintenances en dehors des heures ouvrées.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Responsabilité</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">7.1 Limitation de responsabilité</h3>
            <p>
              Trajectory ne saurait être tenu responsable :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Des dommages indirects (perte de profits, de données, etc.)</li>
              <li>De l'utilisation inappropriée de la Plateforme par l'Utilisateur</li>
              <li>Des interruptions de service dues à des causes externes (force majeure, attaques, etc.)</li>
              <li>Des décisions prises par l'Utilisateur sur la base des informations fournies par la Plateforme</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">7.2 Responsabilité de l'Utilisateur</h3>
            <p>
              L'Utilisateur est seul responsable de l'utilisation qu'il fait de la Plateforme et des données qu'il y entre.
              Il garantit Trajectory contre toute réclamation de tiers résultant de son utilisation de la Plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Résiliation</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.1 Résiliation par l'Utilisateur</h3>
            <p>
              L'Utilisateur peut résilier son Compte à tout moment depuis les paramètres de son compte ou en
              contactant le support à l'adresse oguzhanbakar27@gmail.com.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.2 Résiliation par Trajectory</h3>
            <p>
              Trajectory se réserve le droit de suspendre ou de résilier l'accès à la Plateforme en cas de :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Violation des présentes CGU</li>
              <li>Utilisation frauduleuse de la Plateforme</li>
              <li>Non-paiement des sommes dues</li>
              <li>Comportement nuisible ou préjudiciable</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.3 Effets de la résiliation</h3>
            <p>
              En cas de résiliation, l'Utilisateur perd immédiatement l'accès à la Plateforme. Trajectory conservera
              les données de l'Utilisateur pendant 30 jours pour permettre leur récupération, puis les supprimera
              définitivement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Modification des CGU</h2>
            <p>
              Trajectory se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront
              informés de toute modification substantielle par email ou via la Plateforme.
            </p>
            <p>
              La poursuite de l'utilisation de la Plateforme après modification des CGU vaut acceptation des
              nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Droit applicable et litiges</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">10.1 Droit applicable</h3>
            <p>
              Les présentes CGU sont régies par le droit français.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">10.2 Règlement des litiges</h3>
            <p>
              En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut d'accord dans
              un délai de 30 jours, le litige sera porté devant les tribunaux compétents.
            </p>
            <p>
              Conformément à la réglementation européenne, l'Utilisateur dispose également de la possibilité de
              recourir à la plateforme de règlement en ligne des litiges disponible à l'adresse :
              {' '}<a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
            <p>
              Pour toute question concernant les présentes CGU, vous pouvez nous contacter :
            </p>
            <ul className="list-none space-y-1 ml-0">
              <li>Par email : oguzhanbakar27@gmail.com</li>
              <li>Par courrier : Trajectory, 11 TERRASSE Cesar Franck, 91240 Saint-Michel-sur-Orge, France</li>
            </ul>
          </section>

          <section className="mt-8 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
