export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Mentions légales</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Éditeur du site</h2>
            <p>
              Le site www.trajectory-app.com est édité par :
            </p>
            <ul className="list-none space-y-1 ml-0">
              <li><strong>Raison sociale :</strong> Trajectory</li>
              <li><strong>Forme juridique :</strong> Entrepreneur Individuel</li>
              <li><strong>SIRET :</strong> 888 884 541 000 28</li>
              <li><strong>Siège social :</strong> 11 TERRASSE Cesar Franck, 91240 Saint-Michel-sur-Orge, France</li>
              <li><strong>Email :</strong> oguzhanbakar27@gmail.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Directeur de la publication</h2>
            <p>
              Le directeur de la publication du site est le représentant légal de Trajectory.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Hébergement</h2>
            <p>
              Le site www.trajectory-app.com est hébergé par :
            </p>
            <ul className="list-none space-y-1 ml-0">
              <li><strong>Hébergeur :</strong> Vercel Inc.</li>
              <li><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, United States</li>
              <li><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">vercel.com</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Données personnelles</h2>
            <p>
              Pour toute information concernant le traitement de vos données personnelles, veuillez consulter notre{' '}
              <a href="/politique-confidentialite" className="text-primary hover:underline">Politique de confidentialité</a>.
            </p>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés,
              vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles
              vous concernant.
            </p>
            <p>
              Pour exercer ces droits, contactez-nous à l'adresse : oguzhanbakar27@gmail.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu de ce site (textes, images, vidéos, etc.) est protégé par le droit d'auteur,
              le droit des marques et/ou tout autre droit de propriété intellectuelle.
            </p>
            <p>
              Toute reproduction, distribution, modification, adaptation, retransmission ou publication de ces
              différents éléments est strictement interdite sans l'accord exprès par écrit de Trajectory.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Limitation de responsabilité</h2>
            <p>
              Trajectory met tout en œuvre pour offrir aux utilisateurs des informations et/ou outils disponibles
              et vérifiés, mais ne saurait être tenu pour responsable des erreurs, d'une absence de disponibilité
              des informations et/ou de la présence de virus sur son site.
            </p>
            <p>
              Les informations fournies par Trajectory le sont à titre indicatif et ne sauraient dispenser l'utilisateur
              d'une analyse complémentaire et personnalisée.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Liens hypertextes</h2>
            <p>
              Le site peut contenir des liens hypertextes vers d'autres sites. Trajectory ne dispose d'aucun moyen
              pour contrôler ces sites et ne répond pas de la disponibilité de tels sites et sources externes,
              ni ne la garantit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Droit applicable et juridiction compétente</h2>
            <p>
              Les présentes mentions légales sont régies par le droit français.
            </p>
            <p>
              En cas de litige et à défaut d'accord amiable, le litige sera porté devant les tribunaux français
              conformément aux règles de compétence en vigueur.
            </p>
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
