export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Politique de confidentialité</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <p className="text-lg font-semibold text-primary">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Trajectory attache une grande importance à la protection de vos données personnelles. La présente
              Politique de confidentialité a pour objectif de vous informer de manière transparente sur la façon
              dont nous collectons, utilisons, partageons et protégeons vos données personnelles.
            </p>
            <p>
              Cette politique est conforme au Règlement Général sur la Protection des Données (RGPD) et à la
              loi Informatique et Libertés modifiée.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Responsable du traitement</h2>
            <p>
              Le responsable du traitement de vos données personnelles est :
            </p>
            <ul className="list-none space-y-1 ml-0">
              <li><strong>Raison sociale :</strong> Trajectory</li>
              <li><strong>Forme juridique :</strong> Entrepreneur Individuel</li>
              <li><strong>SIRET :</strong> 888 884 541 000 28</li>
              <li><strong>Adresse :</strong> 11 TERRASSE Cesar Franck, 91240 Saint-Michel-sur-Orge, France</li>
              <li><strong>Email :</strong> oguzhanbakar27@gmail.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Données personnelles collectées</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.1 Données collectées lors de l'inscription</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Nom de l'entreprise</li>
              <li>Numéro de téléphone (optionnel)</li>
              <li>Adresse de l'entreprise</li>
              <li>Mot de passe (stocké de manière cryptée)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.2 Données collectées lors de l'utilisation</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Données de connexion (adresse IP, navigateur, système d'exploitation)</li>
              <li>Données d'utilisation de la plateforme (pages visitées, fonctionnalités utilisées)</li>
              <li>Cookies et technologies similaires</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.3 Données commerciales</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Informations de paiement (via Stripe - nous ne stockons pas vos données bancaires)</li>
              <li>Historique des transactions</li>
              <li>Formule d'abonnement</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.4 Données métier</h3>
            <p>
              Les données que vous entrez dans la plateforme pour votre activité (clients, factures, budgets, etc.)
              restent votre propriété exclusive. Nous agissons uniquement en tant que sous-traitant pour le
              traitement de ces données.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Finalités et bases légales du traitement</h2>

            <div className="space-y-4">
              <div className="bg-secondary/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📝 Gestion de votre compte</h4>
                <p className="text-sm mb-1"><strong>Base légale :</strong> Exécution du contrat</p>
                <p className="text-sm">Création et gestion de votre compte utilisateur, authentification, support client</p>
              </div>

              <div className="bg-secondary/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">💳 Traitement des paiements</h4>
                <p className="text-sm mb-1"><strong>Base légale :</strong> Exécution du contrat</p>
                <p className="text-sm">Facturation, gestion des abonnements, traitement des paiements</p>
              </div>

              <div className="bg-secondary/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📧 Communications</h4>
                <p className="text-sm mb-1"><strong>Base légale :</strong> Intérêt légitime / Consentement</p>
                <p className="text-sm">Emails transactionnels (confirmations, factures) et communications marketing (avec votre consentement)</p>
              </div>

              <div className="bg-secondary/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📊 Amélioration de nos services</h4>
                <p className="text-sm mb-1"><strong>Base légale :</strong> Intérêt légitime</p>
                <p className="text-sm">Analyse d'utilisation, détection d'erreurs, amélioration de la performance</p>
              </div>

              <div className="bg-secondary/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">⚖️ Obligations légales</h4>
                <p className="text-sm mb-1"><strong>Base légale :</strong> Obligation légale</p>
                <p className="text-sm">Conservation des factures, lutte contre la fraude, réponse aux demandes des autorités</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Destinataires des données</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Accès interne</h3>
            <p>
              Vos données sont accessibles en interne uniquement aux personnes qui en ont besoin dans le cadre
              de leurs fonctions (support technique, comptabilité).
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.2 Prestataires tiers</h3>
            <p>
              Nous partageons vos données avec des prestataires de services tiers qui agissent en notre nom :
            </p>

            <ul className="list-disc ml-6 space-y-2 mt-4">
              <li>
                <strong>Vercel (États-Unis)</strong> : Hébergement de la plateforme
                <span className="block text-sm text-muted-foreground">
                  Vercel est certifié Privacy Shield et offre des garanties appropriées
                </span>
              </li>
              <li>
                <strong>Stripe (États-Unis)</strong> : Traitement des paiements
                <span className="block text-sm text-muted-foreground">
                  Stripe est certifié PCI-DSS et conforme au RGPD
                </span>
              </li>
              <li>
                <strong>Resend (États-Unis)</strong> : Envoi d'emails
                <span className="block text-sm text-muted-foreground">
                  Service conforme au RGPD pour l'envoi d'emails transactionnels
                </span>
              </li>
              <li>
                <strong>Supabase (Europe)</strong> : Base de données PostgreSQL
                <span className="block text-sm text-muted-foreground">
                  Données hébergées en Europe (Irlande)
                </span>
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.3 Transferts hors UE</h3>
            <p>
              Certains de nos prestataires sont situés aux États-Unis. Ces transferts sont encadrés par :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Des clauses contractuelles types approuvées par la Commission européenne</li>
              <li>Des certifications Privacy Shield ou équivalent</li>
              <li>Des garanties appropriées conformes au RGPD</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Durée de conservation</h2>

            <ul className="list-disc ml-6 space-y-2">
              <li>
                <strong>Données de compte actif :</strong> Pendant toute la durée de votre abonnement + 3 ans après résiliation
              </li>
              <li>
                <strong>Données de facturation :</strong> 10 ans (obligation légale comptable)
              </li>
              <li>
                <strong>Données de prospection :</strong> 3 ans à compter du dernier contact
              </li>
              <li>
                <strong>Logs de connexion :</strong> 1 an maximum
              </li>
              <li>
                <strong>Cookies :</strong> 13 mois maximum
              </li>
            </ul>

            <p className="mt-4">
              À l'issue de ces délais, vos données sont supprimées de manière sécurisée et définitive.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Sécurité des données</h2>

            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger
              vos données contre tout accès non autorisé, modification, divulgation ou destruction :
            </p>

            <ul className="list-disc ml-6 space-y-1 mt-4">
              <li>Chiffrement SSL/TLS pour toutes les communications</li>
              <li>Mots de passe cryptés avec algorithme bcrypt</li>
              <li>Authentification à deux facteurs (2FA) disponible</li>
              <li>Sauvegardes quotidiennes chiffrées</li>
              <li>Surveillance et détection des intrusions</li>
              <li>Accès aux données strictement contrôlé et journalisé</li>
              <li>Tests de sécurité réguliers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Vos droits RGPD</h2>

            <p className="mb-4">
              Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
            </p>

            <div className="space-y-3">
              <div className="bg-secondary/20 p-3 rounded-lg">
                <h4 className="font-semibold mb-1">🔍 Droit d'accès</h4>
                <p className="text-sm">Obtenir une copie de vos données personnelles</p>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg">
                <h4 className="font-semibold mb-1">✏️ Droit de rectification</h4>
                <p className="text-sm">Corriger des données inexactes ou incomplètes</p>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg">
                <h4 className="font-semibold mb-1">🗑️ Droit à l'effacement</h4>
                <p className="text-sm">Demander la suppression de vos données (sous certaines conditions)</p>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg">
                <h4 className="font-semibold mb-1">⏸️ Droit à la limitation</h4>
                <p className="text-sm">Limiter le traitement de vos données dans certains cas</p>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg">
                <h4 className="font-semibold mb-1">📦 Droit à la portabilité</h4>
                <p className="text-sm">Récupérer vos données dans un format structuré et lisible par machine</p>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg">
                <h4 className="font-semibold mb-1">🚫 Droit d'opposition</h4>
                <p className="text-sm">Vous opposer au traitement de vos données (marketing, profilage)</p>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg">
                <h4 className="font-semibold mb-1">👤 Décisions automatisées</h4>
                <p className="text-sm">Ne pas faire l'objet de décisions uniquement automatisées</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6">Comment exercer vos droits ?</h3>
            <p>
              Pour exercer l'un de ces droits, vous pouvez :
            </p>
            <ul className="list-disc ml-6 space-y-1 mt-2">
              <li>Nous contacter par email à : oguzhanbakar27@gmail.com</li>
              <li>Gérer certaines données directement depuis votre espace client</li>
              <li>Nous écrire à : Trajectory, 11 TERRASSE Cesar Franck, 91240 Saint-Michel-sur-Orge, France</li>
            </ul>
            <p className="mt-3">
              Nous nous engageons à répondre à votre demande dans un délai maximum d'un (1) mois.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Réclamation auprès de la CNIL</h3>
            <p>
              Si vous estimez que vos droits ne sont pas respectés, vous avez le droit d'introduire une
              réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) :
            </p>
            <ul className="list-none space-y-1 ml-0 mt-2">
              <li>Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a></li>
              <li>Adresse : 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07</li>
              <li>Téléphone : 01 53 73 22 22</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Cookies et technologies similaires</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">9.1 Qu'est-ce qu'un cookie ?</h3>
            <p>
              Un cookie est un petit fichier texte déposé sur votre terminal lors de la visite d'un site web.
              Il permet de reconnaître votre navigateur lors de vos prochaines visites.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">9.2 Cookies utilisés</h3>

            <div className="space-y-3 mt-4">
              <div className="bg-secondary/20 p-3 rounded-lg">
                <h4 className="font-semibold mb-1">🔐 Cookies strictement nécessaires</h4>
                <p className="text-sm mb-1">Indispensables au fonctionnement du site (session, authentification)</p>
                <p className="text-xs text-muted-foreground">Exemptés de consentement - Durée : session</p>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg">
                <h4 className="font-semibold mb-1">📊 Cookies analytiques</h4>
                <p className="text-sm mb-1">Nous aident à comprendre comment vous utilisez la plateforme</p>
                <p className="text-xs text-muted-foreground">Nécessitent votre consentement - Durée : 13 mois</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-4">9.3 Gestion des cookies</h3>
            <p>
              Vous pouvez à tout moment modifier vos préférences de cookies via :
            </p>
            <ul className="list-disc ml-6 space-y-1 mt-2">
              <li>Le bandeau de consentement (accessible en bas de page)</li>
              <li>Les paramètres de votre navigateur</li>
            </ul>
            <p className="mt-3">
              Note : Le refus de certains cookies peut limiter les fonctionnalités de la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Modifications de la politique</h2>
            <p>
              Nous nous réservons le droit de modifier cette Politique de confidentialité à tout moment.
              En cas de modification substantielle, nous vous en informerons par email ou via un avis visible
              sur la plateforme au moins 30 jours avant l'entrée en vigueur des modifications.
            </p>
            <p className="mt-3">
              La date de dernière mise à jour est indiquée en haut de cette page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
            <p>
              Pour toute question concernant cette Politique de confidentialité ou le traitement de vos
              données personnelles, vous pouvez nous contacter :
            </p>
            <ul className="list-none space-y-1 ml-0 mt-3">
              <li><strong>Email :</strong> oguzhanbakar27@gmail.com</li>
              <li><strong>Courrier :</strong> Trajectory, 11 TERRASSE Cesar Franck, 91240 Saint-Michel-sur-Orge, France</li>
            </ul>
          </section>

          <section className="mt-8 pt-8 border-t bg-primary/5 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">📌 En résumé</h3>
            <ul className="space-y-2 text-sm">
              <li>✅ Nous collectons uniquement les données nécessaires à la fourniture de nos services</li>
              <li>✅ Vos données métier restent votre propriété exclusive</li>
              <li>✅ Nous ne vendons jamais vos données à des tiers</li>
              <li>✅ Vos données sont sécurisées et hébergées conformément au RGPD</li>
              <li>✅ Vous pouvez exercer vos droits à tout moment</li>
              <li>✅ Vous pouvez exporter ou supprimer vos données quand vous le souhaitez</li>
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
