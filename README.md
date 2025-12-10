# Trajectory - Plateforme SaaS de Gestion Financière

**Pilotez votre croissance financière, simplement.**

Trajectory est une plateforme tout-en-un de planification financière, CRM et facturation conçue spécifiquement pour les PME et freelances français.

## 🚀 Fonctionnalités

### 📊 Tableau de bord
- Visualisation en temps réel des KPIs (CA, trésorerie, factures, clients)
- Graphiques interactifs de revenus, dépenses et cashflow
- Prévisions et alertes intelligentes
- Activité récente et notifications

### 💰 Planification financière
- Création et suivi de budgets annuels, trimestriels et mensuels
- Comparaison budget vs réalisé avec analyses d'écarts
- Simulations de scénarios (optimiste, réaliste, pessimiste)
- Suivi d'objectifs et indicateurs de performance

### 👥 CRM intégré
- Gestion complète de la base clients
- Statuts clients (actif, prospect, inactif)
- Historique des interactions et factures
- Pipeline commercial et suivi des opportunités
- **API REST complète** pour CRUD clients

### 🧾 Facturation
- Création et envoi de factures professionnelles
- Conformité e-invoicing 2026 (Factur-X)
- Gestion des statuts (brouillon, envoyée, payée, en retard)
- **Génération automatique de PDF** pour toutes les factures
- **Envoi d'emails automatique** avec templates professionnels
- Factures récurrentes et rappels automatiques
- Suivi des paiements et relances
- **API REST complète** pour CRUD factures
- **Rate limiting** pour protection anti-spam

### 📈 Rapports et analyses
- Tableaux de bord personnalisables
- Exports PDF, Excel et CSV
- Analyses de performance et croissance
- Rapports mensuels, trimestriels et annuels

### 🔐 Authentification & Sécurité
- **NextAuth.js** - Authentification complète
- Connexion par email/mot de passe
- OAuth social (Google, GitHub)
- Sessions sécurisées JWT
- Protection des routes avec middleware
- Hashage bcrypt des mots de passe
- Conformité RGPD

## 🛠 Stack technique

### Frontend
- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling moderne et responsive
- **shadcn/ui** - Composants UI accessibles
- **Recharts** - Visualisations de données
- **Framer Motion** - Animations fluides
- **Lucide React** - Icônes

### Backend
- **Next.js API Routes** - API REST complète
- **NextAuth.js** - Authentification sécurisée
- **Prisma** - ORM moderne pour la base de données
- **PostgreSQL** - Base de données production
- **bcryptjs** - Hashage de mots de passe
- **Zod** - Validation de schémas
- **Resend** - Envoi d'emails transactionnels
- **Upstash Redis** - Rate limiting et caching
- **Sentry** - Monitoring d'erreurs

### PDF & Documents
- **jsPDF** - Génération de factures PDF
- **@react-pdf/renderer** - Templates PDF React

### Design
- Thème clair et moderne
- Couleur principale: Vert (#00876c)
- Typographie: Inter
- Design responsive (mobile, tablette, desktop)
- Accessibilité WCAG 2.1 AA

## 📦 Installation

### Prérequis
- Node.js 18+
- npm ou yarn

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/trajectory.git
cd trajectory
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Éditer `.env` avec vos configurations:
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
# Pour dev: DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-unique-changez-moi-minimum-32-caracteres"

# OAuth Providers (optionnel)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""

# Email (Resend)
RESEND_API_KEY=""
FROM_EMAIL="noreply@trajectory.fr"

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Monitoring (Sentry - optionnel)
NEXT_PUBLIC_SENTRY_DSN=""
SENTRY_AUTH_TOKEN=""
SENTRY_ORG=""
SENTRY_PROJECT=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Initialiser la base de données**
```bash
npm run db:push
```

5. **Seeder la base de données avec des données de test**
```bash
npm run db:seed
```

Cela créera un compte de test:
- **Email**: demo@trajectory.fr
- **Mot de passe**: password123

6. **Lancer le serveur de développement**
```bash
npm run dev
```

7. **Ouvrir l'application**
```
http://localhost:3000
```

## 🏗 Structure du projet

```
trajectory/
├── app/                      # Pages et routes Next.js
│   ├── api/                 # API Routes
│   │   ├── auth/           # Authentification (NextAuth, register)
│   │   ├── clients/        # CRUD Clients
│   │   ├── invoices/       # CRUD Factures + PDF
│   │   └── budgets/        # CRUD Budgets
│   ├── dashboard/          # Module tableau de bord
│   │   ├── page.tsx       # Dashboard principal
│   │   ├── crm/           # Module CRM
│   │   ├── invoices/      # Module facturation
│   │   ├── planning/      # Module planification
│   │   └── reports/       # Module rapports
│   ├── connexion/         # Page de connexion
│   ├── inscription/       # Page d'inscription
│   ├── layout.tsx         # Layout racine
│   ├── page.tsx           # Landing page
│   └── globals.css        # Styles globaux
├── components/             # Composants réutilisables
│   ├── dashboard/         # Composants dashboard
│   ├── ui/                # Composants UI de base
│   ├── header.tsx         # Header navigation
│   ├── hero.tsx           # Section hero
│   ├── features.tsx       # Section fonctionnalités
│   ├── pricing.tsx        # Section tarifs
│   └── footer.tsx         # Footer
├── lib/                    # Utilitaires
│   ├── utils.ts           # Fonctions utilitaires
│   ├── prisma.ts          # Client Prisma
│   ├── auth.ts            # Configuration NextAuth
│   └── pdf-generator.ts   # Générateur de PDF
├── prisma/                 # Configuration Prisma
│   ├── schema.prisma      # Schéma de base de données
│   └── seed.ts            # Script de seed
├── types/                  # Types TypeScript
│   └── next-auth.d.ts     # Types NextAuth
├── middleware.ts           # Middleware Next.js
└── public/                 # Assets statiques
```

## 🔌 API Routes

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/[...nextauth]` - NextAuth endpoints (login, logout, session)

### Clients
- `GET /api/clients` - Liste tous les clients
- `POST /api/clients` - Créer un client
- `GET /api/clients/[id]` - Récupérer un client
- `PUT /api/clients/[id]` - Modifier un client
- `DELETE /api/clients/[id]` - Supprimer un client

### Factures
- `GET /api/invoices` - Liste toutes les factures
- `POST /api/invoices` - Créer une facture
- `GET /api/invoices/[id]` - Récupérer une facture
- `PUT /api/invoices/[id]` - Modifier une facture
- `DELETE /api/invoices/[id]` - Supprimer une facture
- `GET /api/invoices/[id]/pdf` - Télécharger la facture en PDF
- `POST /api/invoices/[id]/send` - Envoyer la facture par email (avec rate limiting)

### Budgets
- `GET /api/budgets` - Liste tous les budgets
- `POST /api/budgets` - Créer un budget

## 🎨 Modules principaux

### Landing Page
- Header avec navigation fixe
- Hero section avec CTA
- Présentation des fonctionnalités
- Grille de tarifs
- Footer complet

### Authentification
- Page de connexion avec email/password et OAuth
- Page d'inscription avec création automatique d'entreprise
- Protection des routes privées
- Sessions sécurisées

### Dashboard
- Vue d'ensemble avec KPIs
- Graphiques revenus/dépenses/trésorerie
- Activité récente
- Raccourcis actions rapides

### CRM
- Liste des clients avec recherche
- Détails client et historique
- Statistiques par client
- Gestion du pipeline
- **API REST fonctionnelle**

### Facturation
- Création de factures
- Liste et filtrage
- Statuts et suivi
- **Génération automatique de PDF**
- **API REST fonctionnelle**
- Conformité réglementaire française

### Planification
- Budgets annuels/mensuels
- Suivi des objectifs
- Simulations de scénarios
- Analyses d'écarts

### Rapports
- Dashboards personnalisés
- Exports multiformats
- Analyses de performance
- Graphiques avancés

## 🔐 Sécurité

- Authentification sécurisée avec NextAuth.js
- Hashage des mots de passe avec bcryptjs
- Protection CSRF
- Sessions JWT sécurisées
- Middleware de protection des routes
- Validation des données avec Zod
- Conformité RGPD
- Hébergement en France recommandé

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour:
- **Mobile** (320px+)
- **Tablette** (768px+)
- **Desktop** (1024px+)
- **Large screens** (1440px+)

## 🎯 Conformité

### E-invoicing 2026
- Format Factur-X supporté
- Génération de PDF conforme
- Normes françaises de facturation électronique
- Prêt pour l'obligation 2026

### Accessibilité
- Conformité WCAG 2.1 niveau AA
- Navigation au clavier
- Lecteurs d'écran compatibles
- Contrastes optimisés

## 🚀 Déploiement

### Railway (Recommandé)

Nous recommandons **Railway** pour le déploiement car il simplifie la gestion de la base de données et du site web en un seul endroit.

👉 **[Voir le Guide de Déploiement Railway](./RAILWAY_DEPLOYMENT_GUIDE.md)**

Ce guide contient toutes les étapes pour :
1. Déployer le projet depuis GitHub
2. Configurer la base de données PostgreSQL gérée par Railway
3. Configurer les variables d'environnement (Stripe, NextAuth, etc.)
4. Initialiser la base de données

### Docker

```bash
docker build -t trajectory .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_URL="https://..." \
  -e NEXTAUTH_SECRET="..." \
  trajectory
```

### ⚠️ Checklist avant déploiement

- [ ] PostgreSQL configuré et accessible
- [ ] Variables d'environnement configurées
- [ ] Domaine d'envoi vérifié dans Resend
- [ ] OAuth credentials configurés (si utilisé)
- [ ] NEXTAUTH_SECRET généré
- [ ] Tests passent (`npm run test`)
- [ ] Build réussit (`npm run build`)

## 📄 Scripts disponibles

```bash
npm run dev           # Serveur de développement
npm run build         # Build de production
npm run start         # Serveur de production
npm run lint          # Linter ESLint
npm run test          # Lancer les tests (Vitest)
npm run test:ui       # Interface graphique de tests
npm run db:push       # Pusher le schéma Prisma vers la DB
npm run db:seed       # Seeder la base de données
npm run db:migrate    # Créer une migration Prisma
```

## 🧪 Compte de test

Après avoir exécuté `npm run db:seed`, utilisez ce compte pour tester:

```
Email: demo@trajectory.fr
Mot de passe: password123
```

Le compte de test inclut:
- 3 clients de démonstration
- 5 factures avec différents statuts
- 1 budget annuel avec catégories
- Données complètes pour tester toutes les fonctionnalités

## ✨ Fonctionnalités implémentées

### ✅ Backend complet
- API REST pour clients, factures, budgets
- Authentification NextAuth.js avec OAuth (Google, GitHub)
- Base de données PostgreSQL avec Prisma
- Validation Zod pour toutes les entrées
- Gestion d'erreurs centralisée
- Rate limiting avec Upstash Redis
- Envoi d'emails avec Resend

### ✅ Frontend fonctionnel
- Landing page responsive et moderne
- Dashboard avec graphiques interactifs
- Pages CRM, Facturation, Planning, Rapports
- Connexion/Inscription opérationnelles
- Navigation fluide avec loading states
- Bandeau de consentement GDPR
- Pages de politique de confidentialité et cookies

### ✅ Génération de PDF
- Templates professionnels de factures
- Informations complètes (entreprise, client, items)
- Téléchargement direct
- Format conforme e-invoicing 2026

### ✅ Emails automatiques
- Email de bienvenue lors de l'inscription
- Envoi automatique de factures par email
- Templates HTML responsive
- Rate limiting anti-spam

### ✅ Sécurité et conformité
- Protection des routes avec middleware
- Sessions JWT sécurisées
- Validation des données avec Zod
- Hashage des mots de passe avec bcrypt
- Rate limiting sur API et auth
- Monitoring avec Sentry
- Conformité RGPD (bandeau cookies, politique de confidentialité)
- Protection CSRF intégrée

### ✅ Performance
- Optimisation des images Next.js
- Lazy loading des composants
- Caching intelligent des API responses
- Loading states et error boundaries
- Font optimization avec display: swap

### ✅ Tests
- Tests unitaires avec Vitest
- Tests d'authentification
- Tests de calculs de factures
- Tests de rate limiting
- Interface de tests graphique

## 🔜 Fonctionnalités avancées (roadmap)

Pour aller encore plus loin:

1. **Paiements**
   - Intégration Stripe pour paiements en ligne
   - Gestion des abonnements automatique
   - Webhooks pour synchronisation des paiements
   - Prélèvements SEPA

2. **Tests E2E**
   - Tests end-to-end avec Playwright
   - Tests de régression automatiques
   - Tests de performance

3. **Intégrations tierces**
   - Intégrations bancaires (Open Banking)
   - Synchronisation comptable (QuickBooks, Sage)
   - CRM externes (HubSpot, Salesforce)
   - Outils de facturation (Stripe Billing)

4. **Fonctionnalités métier avancées**
   - Gestion multi-devises
   - Multi-entreprises pour comptables
   - Notifications push en temps réel
   - Rapports personnalisés avancés
   - Export Excel/CSV enrichis
   - Devis et bons de commande
   - Gestion des stocks
   - Time tracking et projets

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📧 Contact

Pour toute question ou suggestion:
- Email: contact@trajectory.fr
- Site web: https://trajectory.fr

## 🙏 Remerciements

- [Next.js](https://nextjs.org/)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
- [jsPDF](https://github.com/parallax/jsPDF)

---

Fait avec ❤️ en France pour les entrepreneurs français

<!-- Deployment: 2025-11-14 -->
