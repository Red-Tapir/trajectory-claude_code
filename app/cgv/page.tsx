export default function CGVPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Conditions Générales de Vente (CGV)</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Préambule</h2>
            <p>
              Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent les relations contractuelles
              entre Trajectory et toute personne physique ou morale souhaitant souscrire à un abonnement payant
              à la plateforme Trajectory.
            </p>
            <p>
              Toute souscription à un abonnement implique l'acceptation sans réserve des présentes CGV.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Identification du vendeur</h2>
            <ul className="list-none space-y-1 ml-0">
              <li><strong>Raison sociale :</strong> Trajectory</li>
              <li><strong>Forme juridique :</strong> Entrepreneur Individuel</li>
              <li><strong>SIRET :</strong> 888 884 541 000 28</li>
              <li><strong>Siège social :</strong> 11 TERRASSE Cesar Franck, 91240 Saint-Michel-sur-Orge, France</li>
              <li><strong>Email :</strong> oguzhanbakar27@gmail.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Services proposés</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.1 Description des services</h3>
            <p>
              Trajectory propose une plateforme SaaS (Software as a Service) de gestion d'entreprise comprenant :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Un module CRM (gestion de la relation client)</li>
              <li>Un module de facturation et devis</li>
              <li>Un module de planification financière</li>
              <li>Un tableau de bord et des rapports d'analyse</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.2 Formules d'abonnement</h3>
            <p>
              Trajectory propose les formules d'abonnement suivantes :
            </p>

            <div className="bg-secondary/20 p-4 rounded-lg my-4">
              <h4 className="font-semibold mb-2">🎁 Essai gratuit (14 jours)</h4>
              <ul className="list-disc ml-6 space-y-1 text-sm">
                <li>Accès à toutes les fonctionnalités</li>
                <li>10 clients maximum</li>
                <li>20 factures maximum</li>
                <li>Sans carte bancaire</li>
              </ul>
            </div>

            <div className="bg-secondary/20 p-4 rounded-lg my-4">
              <h4 className="font-semibold mb-2">📦 Starter - 29€ HT/mois</h4>
              <ul className="list-disc ml-6 space-y-1 text-sm">
                <li>50 clients maximum</li>
                <li>100 factures par mois</li>
                <li>1 utilisateur</li>
                <li>500 MB de stockage</li>
              </ul>
            </div>

            <div className="bg-secondary/20 p-4 rounded-lg my-4">
              <h4 className="font-semibold mb-2">🚀 Pro - 79€ HT/mois</h4>
              <ul className="list-disc ml-6 space-y-1 text-sm">
                <li>Clients illimités</li>
                <li>Factures illimitées</li>
                <li>5 utilisateurs</li>
                <li>5 GB de stockage</li>
                <li>Support prioritaire</li>
              </ul>
            </div>

            <div className="bg-secondary/20 p-4 rounded-lg my-4">
              <h4 className="font-semibold mb-2">🏢 Enterprise - 199€ HT/mois</h4>
              <ul className="list-disc ml-6 space-y-1 text-sm">
                <li>Tout illimité</li>
                <li>Utilisateurs illimités</li>
                <li>50 GB de stockage</li>
                <li>Support 24/7</li>
                <li>Account manager dédié</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Prix et paiement</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.1 Prix</h3>
            <p>
              Les prix sont indiqués en euros (€) hors taxes. La TVA applicable sera ajoutée au montant HT
              selon la législation en vigueur.
            </p>
            <p>
              Trajectory se réserve le droit de modifier ses tarifs à tout moment. Les nouveaux tarifs ne
              s'appliqueront pas aux abonnements en cours, sauf information préalable de 30 jours.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Modalités de paiement</h3>
            <p>
              Le paiement s'effectue par carte bancaire via notre prestataire de paiement sécurisé Stripe.
              Les moyens de paiement acceptés sont :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Carte Visa</li>
              <li>Carte Mastercard</li>
              <li>American Express</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.3 Facturation</h3>
            <p>
              La facturation est mensuelle et s'effectue automatiquement à date anniversaire de la souscription.
              Les factures sont mises à disposition dans l'espace client et envoyées par email.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.4 Retard ou défaut de paiement</h3>
            <p>
              En cas de retard de paiement, Trajectory se réserve le droit de suspendre l'accès à la plateforme
              jusqu'à régularisation complète. En cas de non-paiement dans un délai de 15 jours après mise en demeure,
              l'abonnement pourra être résilié de plein droit.
            </p>
            <p>
              Tout retard de paiement entraînera l'application de pénalités de retard au taux de 3 fois le taux
              d'intérêt légal, ainsi qu'une indemnité forfaitaire de 40€ pour frais de recouvrement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Durée et renouvellement</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Durée de l'abonnement</h3>
            <p>
              Les abonnements sont souscrits pour une durée d'un (1) mois, renouvelable tacitement par périodes
              successives d'un mois, sauf résiliation dans les conditions prévues à l'article 6.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.2 Renouvellement automatique</h3>
            <p>
              L'abonnement se renouvelle automatiquement chaque mois à la date anniversaire de la souscription,
              sauf résiliation préalable par le client.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Résiliation et remboursement</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">6.1 Résiliation par le client</h3>
            <p>
              Le client peut résilier son abonnement à tout moment, sans préavis et sans frais, depuis son
              espace client ou en contactant le support. La résiliation prend effet à la fin de la période
              de facturation en cours.
            </p>
            <p>
              Aucun remboursement au prorata ne sera effectué pour la période en cours.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">6.2 Résiliation par Trajectory</h3>
            <p>
              Trajectory se réserve le droit de résilier un abonnement en cas de :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Violation des CGU ou CGV</li>
              <li>Non-paiement après mise en demeure</li>
              <li>Utilisation frauduleuse ou abusive de la plateforme</li>
              <li>Atteinte à la sécurité ou à la réputation de Trajectory</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">6.3 Politique de remboursement</h3>
            <p>
              Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation n'est pas
              applicable aux contrats de fourniture de services pleinement exécutés avant la fin du délai de
              rétractation.
            </p>
            <p>
              Toutefois, en cas d'insatisfaction, vous pouvez nous contacter dans les 14 jours suivant votre
              première souscription pour demander un remboursement. Chaque demande sera étudiée au cas par cas.
            </p>
            <p>
              Pour plus de détails, consultez notre{' '}
              <a href="/politique-remboursement" className="text-primary hover:underline">
                Politique de remboursement
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Modifications et changements de formule</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">7.1 Upgrade (passage à une formule supérieure)</h3>
            <p>
              Le client peut à tout moment passer à une formule supérieure. Le changement est immédiat et le
              montant de l'ancienne formule sera déduit au prorata de la nouvelle facture.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">7.2 Downgrade (passage à une formule inférieure)</h3>
            <p>
              Le client peut passer à une formule inférieure. Le changement prendra effet à la prochaine date
              de facturation. Aucun remboursement ne sera effectué pour la période en cours.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Garanties et responsabilité</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.1 Garanties</h3>
            <p>
              Trajectory garantit que :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>La plateforme sera conforme à la description des services</li>
              <li>Les données du client seront sécurisées et protégées</li>
              <li>Le service sera fourni avec le soin et la compétence raisonnables</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.2 Limitation de responsabilité</h3>
            <p>
              La responsabilité de Trajectory est limitée au montant total payé par le client au cours des
              12 derniers mois précédant l'événement donnant lieu à responsabilité.
            </p>
            <p>
              Trajectory ne saurait être tenu responsable des dommages indirects tels que perte de chiffre
              d'affaires, perte de clientèle, perte de données, etc.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Protection des données personnelles</h2>
            <p>
              Trajectory s'engage à protéger les données personnelles de ses clients conformément au RGPD.
              Pour plus d'informations, consultez notre{' '}
              <a href="/politique-confidentialite" className="text-primary hover:underline">
                Politique de confidentialité
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Force majeure</h2>
            <p>
              Trajectory ne pourra être tenu responsable de l'inexécution de ses obligations en cas de force majeure
              telle que définie par la jurisprudence française, notamment : catastrophe naturelle, incendie, panne
              informatique majeure, acte de guerre, grève, etc.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Droit applicable et litiges</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">11.1 Droit applicable</h3>
            <p>
              Les présentes CGV sont soumises au droit français.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">11.2 Médiation</h3>
            <p>
              Conformément aux articles L.612-1 et suivants du Code de la consommation, le client a le droit
              de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable du
              litige qui l'oppose à Trajectory.
            </p>
            <p>
              Le client peut également recourir à la plateforme de règlement en ligne des litiges de l'Union
              européenne accessible à l'adresse suivante :{' '}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://ec.europa.eu/consumers/odr
              </a>
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">11.3 Juridiction compétente</h3>
            <p>
              À défaut de résolution amiable, tout litige relatif à l'interprétation ou à l'exécution des
              présentes CGV sera soumis aux tribunaux compétents dans les conditions de droit commun.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact</h2>
            <p>
              Pour toute question concernant les présentes CGV ou votre abonnement :
            </p>
            <ul className="list-none space-y-1 ml-0">
              <li>Email : oguzhanbakar27@gmail.com</li>
              <li>Adresse : Trajectory, 11 TERRASSE Cesar Franck, 91240 Saint-Michel-sur-Orge, France</li>
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
