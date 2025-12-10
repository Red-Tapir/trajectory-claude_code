# Trajectory - Guide de Déploiement Vercel

## Prérequis

- Compte [Vercel](https://vercel.com)
- Compte [Supabase](https://supabase.com) (pour PostgreSQL)
- Compte [Stripe](https://stripe.com) (pour les paiements)
- Compte [Resend](https://resend.com) (pour les emails)
- (Optionnel) Compte [Upstash](https://upstash.com) pour le rate limiting
- (Optionnel) Compte [Sentry](https://sentry.io) pour le monitoring

## Étape 1: Configurer Supabase

1. Créer un nouveau projet sur [Supabase](https://supabase.com)
2. Récupérer les informations de connexion dans **Settings > Database**
3. Noter :
   - `DATABASE_URL` : URI de connexion avec pooler (port 6543)
   - `DIRECT_URL` : URI de connexion directe (port 5432)

Format des URLs:
```
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres
```

## Étape 2: Déployer sur Vercel

### Option A: Via l'interface Vercel

1. Aller sur [vercel.com/new](https://vercel.com/new)
2. Importer votre repository GitHub
3. Configurer les variables d'environnement (voir ci-dessous)
4. Cliquer sur **Deploy**

### Option B: Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Pour la production
vercel --prod
```

## Étape 3: Variables d'Environnement

Dans les paramètres du projet Vercel, ajouter ces variables :

### Obligatoires

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL Supabase avec pgbouncer |
| `DIRECT_URL` | URL Supabase directe |
| `NEXTAUTH_URL` | URL de votre app (ex: https://trajectory-app.com) |
| `NEXTAUTH_SECRET` | Générer avec: `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Même URL que NEXTAUTH_URL |

### Stripe (Paiements)

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (sk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Secret du webhook (whsec_...) |
| `STRIPE_PRICE_ID_STARTER` | ID du prix Starter (price_...) |
| `STRIPE_PRICE_ID_PRO` | ID du prix Pro (price_...) |
| `STRIPE_PRICE_ID_ENTERPRISE` | ID du prix Enterprise (price_...) |

### Email (Resend)

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Clé API Resend |
| `FROM_EMAIL` | Email d'envoi (ex: noreply@trajectory-app.com) |

### Optionnelles

| Variable | Description |
|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | URL Redis Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | Token Redis Upstash |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN Sentry |
| `SENTRY_AUTH_TOKEN` | Token d'auth Sentry |
| `SENTRY_ORG` | Nom de l'organisation Sentry |
| `SENTRY_PROJECT` | Nom du projet Sentry |

## Étape 4: Configurer Stripe Webhook

1. Aller dans [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Ajouter un endpoint:
   - URL: `https://votre-domaine.com/api/stripe/webhook`
   - Événements à écouter:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
3. Copier le **Signing secret** dans `STRIPE_WEBHOOK_SECRET`

## Étape 5: Configurer le domaine personnalisé

1. Dans Vercel: **Settings > Domains**
2. Ajouter `trajectory-app.com`
3. Configurer les DNS chez OVH:
   - Type A: `@` → `76.76.19.19`
   - Type CNAME: `www` → `cname.vercel-dns.com`

## Étape 6: Initialiser la base de données

Après le premier déploiement, exécuter les migrations Prisma:

```bash
# Option 1: Via Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed

# Option 2: Manuellement depuis Supabase SQL Editor
# Copier le contenu de prisma/init-schema.sql
```

## Commandes utiles

```bash
# Voir les logs en temps réel
vercel logs --follow

# Redéployer
vercel --prod

# Voir les variables d'environnement
vercel env ls

# Ajouter une variable
vercel env add VARIABLE_NAME
```

## Troubleshooting

### Erreur de build Prisma
Si erreur `Prisma Client is not generated`:
- Vérifier que `prisma generate` est dans le build command
- Le `postinstall` script dans package.json devrait le gérer automatiquement

### Erreur de connexion DB
- Vérifier que `DATABASE_URL` utilise le port 6543 (pooler)
- Vérifier que `DIRECT_URL` utilise le port 5432

### Erreur NextAuth
- Vérifier que `NEXTAUTH_URL` correspond exactement à votre domaine
- Vérifier que `NEXTAUTH_SECRET` est bien défini

### Erreur Stripe Webhook
- Vérifier que l'URL du webhook est correcte
- Vérifier que le `STRIPE_WEBHOOK_SECRET` est le bon
- Tester avec Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## Architecture de déploiement

```
┌─────────────────┐     ┌─────────────────┐
│   Vercel CDN    │────▶│   Next.js App   │
│   (Edge Cache)  │     │   (Serverless)  │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ Supabase │ │  Stripe  │ │  Resend  │
              │(Postgres)│ │(Payments)│ │ (Email)  │
              └──────────┘ └──────────┘ └──────────┘
```

## Support

Pour toute question:
- Documentation Vercel: https://vercel.com/docs
- Documentation Supabase: https://supabase.com/docs
- Documentation Prisma: https://www.prisma.io/docs
