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

### 🧾 Facturation
- Création et envoi de factures professionnelles
- Conformité e-invoicing 2026 (Factur-X)
- Gestion des statuts (brouillon, envoyée, payée, en retard)
- Factures récurrentes et rappels automatiques
- Suivi des paiements et relances

### 📈 Rapports et analyses
- Tableaux de bord personnalisables
- Exports PDF, Excel et CSV
- Analyses de performance et croissance
- Rapports mensuels, trimestriels et annuels

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
- **Prisma** - ORM moderne pour la base de données
- **SQLite** (développement) / **PostgreSQL** (production)
- **NextAuth.js** - Authentification sécurisée

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
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-unique"
```

4. **Initialiser la base de données**
```bash
npx prisma generate
npx prisma db push
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

6. **Ouvrir l'application**
```
http://localhost:3000
```

## 🏗 Structure du projet

```
trajectory/
├── app/                      # Pages et routes Next.js
│   ├── dashboard/           # Module tableau de bord
│   │   ├── page.tsx        # Dashboard principal
│   │   ├── crm/            # Module CRM
│   │   ├── invoices/       # Module facturation
│   │   ├── planning/       # Module planification
│   │   └── reports/        # Module rapports
│   ├── connexion/          # Page de connexion
│   ├── inscription/        # Page d'inscription
│   ├── layout.tsx          # Layout racine
│   ├── page.tsx            # Landing page
│   └── globals.css         # Styles globaux
├── components/              # Composants réutilisables
│   ├── dashboard/          # Composants dashboard
│   ├── ui/                 # Composants UI de base
│   ├── header.tsx          # Header navigation
│   ├── hero.tsx            # Section hero
│   ├── features.tsx        # Section fonctionnalités
│   ├── pricing.tsx         # Section tarifs
│   └── footer.tsx          # Footer
├── lib/                     # Utilitaires
│   ├── utils.ts            # Fonctions utilitaires
│   └── prisma.ts           # Client Prisma
├── prisma/                  # Configuration Prisma
│   └── schema.prisma       # Schéma de base de données
└── public/                  # Assets statiques
```

## 🎨 Modules principaux

### Landing Page
- Header avec navigation fixe
- Hero section avec CTA
- Présentation des fonctionnalités
- Grille de tarifs
- Footer complet

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

### Facturation
- Création de factures
- Liste et filtrage
- Statuts et suivi
- Exports PDF
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
- Hashage des mots de passe
- Protection CSRF
- Sessions sécurisées
- Conformité RGPD
- Hébergement en France

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour:
- **Mobile** (320px+)
- **Tablette** (768px+)
- **Desktop** (1024px+)
- **Large screens** (1440px+)

## 🎯 Conformité

### E-invoicing 2026
- Format Factur-X supporté
- Normes françaises de facturation électronique
- Prêt pour l'obligation 2026

### Accessibilité
- Conformité WCAG 2.1 niveau AA
- Navigation au clavier
- Lecteurs d'écran compatibles
- Contrastes optimisés

## 🚀 Déploiement

### Vercel (recommandé)
```bash
npm run build
vercel deploy
```

### Docker
```bash
docker build -t trajectory .
docker run -p 3000:3000 trajectory
```

## 📄 Scripts disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Linter ESLint
```

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
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)

---

Fait avec ❤️ en France pour les entrepreneurs français
