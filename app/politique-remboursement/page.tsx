export default function PolitiqueRemboursementPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Politique de remboursement</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <p className="text-lg">
              Chez Trajectory, nous souhaitons que vous soyez pleinement satisfait de notre service.
              Cette politique de remboursement explique dans quelles conditions vous pouvez obtenir un remboursement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Période d'essai gratuite</h2>

            <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg my-4">
              <p className="font-semibold mb-2">🎁 14 jours d'essai gratuit</p>
              <p className="text-sm">
                Nous offrons une période d'essai gratuite de 14 jours sans carte bancaire requise.
                Cela vous permet de tester toutes les fonctionnalités de Trajectory avant de souscrire
                à un abonnement payant.
              </p>
            </div>

            <p>
              Nous vous encourageons à profiter pleinement de cette période d'essai pour vous assurer que
              Trajectory répond à vos besoins avant tout engagement financier.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Droit de rétractation (consommateurs uniquement)</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Principe général</h3>
            <p>
              Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation de
              14 jours ne s'applique pas aux contrats de fourniture de services pleinement exécutés avant
              la fin du délai de rétractation et dont l'exécution a commencé après accord préalable exprès
              du consommateur et renoncement exprès à son droit de rétractation.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Application à Trajectory</h3>
            <p>
              En souscrivant à un abonnement Trajectory et en accédant immédiatement aux services,
              vous acceptez expressément que :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>L'exécution du service commence immédiatement après votre paiement</li>
              <li>Vous renoncez à votre droit de rétractation légal de 14 jours</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Garantie de satisfaction (14 jours)</h2>

            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg my-4">
              <p className="font-semibold mb-2">✅ Garantie satisfait ou remboursé</p>
              <p className="text-sm">
                Bien que le droit de rétractation légal ne s'applique pas, nous offrons une garantie
                de satisfaction de 14 jours après votre première souscription à un abonnement payant.
              </p>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.1 Conditions</h3>
            <p>
              Vous pouvez demander un remboursement complet dans les 14 jours suivant votre premier paiement si :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>C'est votre première souscription (nouveau client)</li>
              <li>Vous n'avez pas abusé du service (utilisation frauduleuse, violation des CGU)</li>
              <li>Vous faites votre demande dans les 14 jours suivant le paiement</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.2 Comment demander un remboursement ?</h3>
            <p>
              Pour demander un remboursement dans le cadre de notre garantie de satisfaction :
            </p>
            <ol className="list-decimal ml-6 space-y-2 mt-3">
              <li>
                Contactez-nous par email à <strong>oguzhanbakar27@gmail.com</strong>
              </li>
              <li>
                Indiquez l'objet : "Demande de remboursement - Garantie 14 jours"
              </li>
              <li>
                Précisez :
                <ul className="list-disc ml-6 mt-1 text-sm">
                  <li>Votre nom et l'email associé à votre compte</li>
                  <li>La raison de votre demande (optionnel mais apprécié pour améliorer nos services)</li>
                  <li>Votre numéro de transaction ou de facture</li>
                </ul>
              </li>
            </ol>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.3 Traitement de la demande</h3>
            <p>
              Nous étudions chaque demande individuellement et nous nous engageons à :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Vous répondre dans les 48 heures ouvrées</li>
              <li>Traiter votre remboursement dans les 14 jours suivant l'acceptation</li>
              <li>Effectuer le remboursement sur le même moyen de paiement utilisé lors de l'achat</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Remboursements après la période de garantie</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.1 Principe général</h3>
            <p>
              Après la période de garantie de 14 jours, aucun remboursement ne sera effectué en cas de :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Changement d'avis</li>
              <li>Non-utilisation du service</li>
              <li>Annulation en cours de période de facturation</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Exceptions</h3>
            <p>
              Un remboursement pourra exceptionnellement être accordé en cas de :
            </p>

            <div className="space-y-3 mt-4">
              <div className="bg-secondary/20 p-3 rounded-lg">
                <h4 className="font-semibold mb-1">🐛 Problème technique majeur</h4>
                <p className="text-sm">
                  Si la plateforme a été indisponible pendant plus de 48 heures consécutives ou a subi
                  des dysfonctionnements majeurs nous rendant responsables
                </p>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg">
                <h4 className="font-semibold mb-1">💳 Erreur de facturation</h4>
                <p className="text-sm">
                  En cas de double facturation ou d'erreur de notre part dans le traitement de votre paiement
                </p>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg">
                <h4 className="font-semibold mb-1">🔄 Changement de formule (au prorata)</h4>
                <p className="text-sm">
                  En cas de passage à une formule inférieure, un crédit au prorata pourra être appliqué
                  sur la prochaine facture (pas de remboursement en espèces)
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Annulation d'abonnement</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Comment annuler ?</h3>
            <p>
              Vous pouvez annuler votre abonnement à tout moment :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Depuis votre espace client : Paramètres → Abonnement → Annuler</li>
              <li>Par email : oguzhanbakar27@gmail.com</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.2 Effets de l'annulation</h3>
            <p>
              Lors de l'annulation de votre abonnement :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                <strong>Accès jusqu'à la fin de la période payée :</strong> Vous conservez l'accès à la plateforme
                jusqu'à la fin de votre période de facturation en cours
              </li>
              <li>
                <strong>Pas de remboursement au prorata :</strong> Aucun remboursement ne sera effectué pour
                la période en cours déjà payée
              </li>
              <li>
                <strong>Pas de renouvellement automatique :</strong> Votre abonnement ne sera pas renouvelé
                à la prochaine échéance
              </li>
              <li>
                <strong>Données conservées 30 jours :</strong> Vos données seront conservées pendant 30 jours
                pour vous permettre de réactiver votre compte si vous changez d'avis
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Modalités de remboursement</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">6.1 Délais</h3>
            <p>
              En cas de remboursement accepté :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Traitement de la demande : 2 à 5 jours ouvrés</li>
              <li>Remboursement effectif : 5 à 14 jours ouvrés selon votre banque</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">6.2 Méthode de remboursement</h3>
            <p>
              Les remboursements sont effectués :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Sur le même moyen de paiement utilisé lors de l'achat</li>
              <li>Via notre prestataire de paiement Stripe</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">6.3 Notification</h3>
            <p>
              Vous recevrez un email de confirmation lorsque :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Votre demande de remboursement est acceptée</li>
              <li>Le remboursement a été traité</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Cas particuliers</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">7.1 Comptes suspendus ou résiliés</h3>
            <p>
              Aucun remboursement ne sera accordé si votre compte a été suspendu ou résilié pour :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Violation des Conditions Générales d'Utilisation</li>
              <li>Utilisation frauduleuse de la plateforme</li>
              <li>Non-paiement de factures antérieures</li>
              <li>Comportement abusif envers notre équipe ou d'autres utilisateurs</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">7.2 Changements de tarification</h3>
            <p>
              En cas d'augmentation de nos tarifs :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Vous serez informé au moins 30 jours avant l'application des nouveaux tarifs</li>
              <li>Les abonnements en cours ne seront pas affectés jusqu'à leur renouvellement</li>
              <li>Vous pourrez annuler avant le renouvellement sans pénalité</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Litiges</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.1 Réclamation</h3>
            <p>
              Si vous n'êtes pas satisfait de notre réponse concernant une demande de remboursement,
              vous pouvez :
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Nous envoyer une réclamation écrite à : oguzhanbakar27@gmail.com</li>
              <li>
                Nous écrire par courrier à : Trajectory, 11 TERRASSE Cesar Franck,
                91240 Saint-Michel-sur-Orge, France
              </li>
            </ul>
            <p className="mt-3">
              Nous nous engageons à vous répondre dans les 10 jours ouvrés.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.2 Médiation</h3>
            <p>
              En cas de litige persistant, vous pouvez recourir gratuitement à un médiateur de la consommation
              conformément aux articles L.612-1 et suivants du Code de la consommation.
            </p>
            <p className="mt-3">
              Vous pouvez également utiliser la plateforme de règlement en ligne des litiges de l'Union européenne :
              {' '}<a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Modifications de la politique</h2>
            <p>
              Trajectory se réserve le droit de modifier cette politique de remboursement à tout moment.
              Les modifications entreront en vigueur immédiatement pour les nouveaux abonnements et
              à la prochaine date de renouvellement pour les abonnements existants.
            </p>
            <p className="mt-3">
              Vous serez informé de toute modification substantielle par email au moins 30 jours avant son entrée en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
            <p>
              Pour toute question concernant cette politique de remboursement ou pour demander un remboursement :
            </p>
            <ul className="list-none space-y-1 ml-0 mt-3">
              <li><strong>Email :</strong> oguzhanbakar27@gmail.com</li>
              <li><strong>Courrier :</strong> Trajectory, 11 TERRASSE Cesar Franck, 91240 Saint-Michel-sur-Orge, France</li>
            </ul>
          </section>

          <section className="mt-8 pt-8 border-t bg-primary/5 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">📌 En résumé</h3>
            <ul className="space-y-2 text-sm">
              <li>✅ Essai gratuit de 14 jours sans carte bancaire</li>
              <li>✅ Garantie de satisfaction de 14 jours pour les nouveaux clients</li>
              <li>✅ Annulation possible à tout moment, sans frais</li>
              <li>✅ Accès maintenu jusqu'à la fin de la période payée</li>
              <li>✅ Remboursement possible en cas de problème technique majeur</li>
              <li>❌ Pas de remboursement au prorata après la période de garantie</li>
              <li>❌ Pas de remboursement en cas de non-utilisation ou changement d'avis</li>
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
