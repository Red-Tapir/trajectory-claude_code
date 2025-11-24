# 🚂 Guide de Déploiement Railway - Trajectory

Ce guide vous explique comment déployer votre application Trajectory sur **Railway**.
Railway est la solution recommandée car elle héberge à la fois votre site (Next.js) et votre base de données (PostgreSQL) au même endroit, simplifiant grandement la configuration.

---

## 📋 Pré-requis

1.  Un compte [GitHub](https://github.com) avec ce projet.
2.  Un compte [Railway](https://railway.app) (création gratuite).
3.  Un compte [Stripe](https://stripe.com) (pour les paiements).

---

## 🚀 Étape 1 : Créer le projet sur Railway

1.  Allez sur [Railway Dashboard](https://railway.app/dashboard).
2.  Cliquez sur **+ New Project** > **Deploy from GitHub repo**.
3.  Sélectionnez votre dépôt `trajectory-claude_code`.
4.  Cliquez sur **Deploy Now**.

⚠️ **Le premier déploiement va probablement échouer** car les variables d'environnement ne sont pas encore configurées. C'est normal.

---

## 🗄️ Étape 2 : Ajouter la Base de Données

1.  Dans votre projet Railway, cliquez sur **+ New** (bouton en haut à droite ou sur le canvas).
2.  Sélectionnez **Database** > **PostgreSQL**.
3.  Attendez quelques secondes que la base de données soit créée.
4.  Une fois créée, Railway ajoute automatiquement une variable `DATABASE_URL` à votre projet. **Vous n'avez rien à faire de plus pour la connexion DB !**

---

## 🔑 Étape 3 : Configurer les Variables d'Environnement

Allez dans l'onglet **Variables** de votre service **Next.js** (pas la base de données) sur Railway.
Ajoutez les variables suivantes (copiez-collez les valeurs ci-dessous) :

### 1. Configuration Générale
```env
# URL de votre site (Railway vous en donnera une, ou votre domaine perso)
# Pour l'instant, mettez l'URL fournie par Railway (ex: https://trajectory-production.up.railway.app)
NEXT_PUBLIC_APP_URL=https://[VOTRE-URL-RAILWAY]
NEXTAUTH_URL=https://[VOTRE-URL-RAILWAY]

# Secret pour l'authentification (Généré aléatoirement)
NEXTAUTH_SECRET=XkJ8vN3pQ7mR2dH9wL5tK1fY6sC0aB4eG8iU3jV7nM=
```

### 2. Stripe (Paiements) - MODE LIVE
Ces clés proviennent de votre configuration existante.

```env
# Clés API Stripe
STRIPE_SECRET_KEY=sk_live_51SQscpGWO8fE6XBH...
STRIPE_WEBHOOK_SECRET=whsec_pLNDRj3ZnYGzD7lY1lDHfUdVzkAJQZbu

# Plan Starter (29€/mois)
STRIPE_PRODUCT_ID_STARTER=prod_TPS0IqnaWCnUZo
STRIPE_PRICE_ID_STARTER=price_1SSd6pGWO8fE6XBHUqVPUob3

# Plan Pro (79€/mois)
STRIPE_PRODUCT_ID_PRO=prod_TPS2M84BrQ1lmO
STRIPE_PRICE_ID_PRO=price_1SSd8qGWO8fE6XBHisoB0yPa

# Plan Enterprise (199€/mois)
STRIPE_PRODUCT_ID_ENTERPRISE=prod_TPS36HsHqvcjld
STRIPE_PRICE_ID_ENTERPRISE=price_1SSd9FGWO8fE6XBHcCGVWZjr
```

> **Note importante sur `STRIPE_SECRET_KEY`** : La valeur ci-dessus semble tronquée (`...`). Assurez-vous de récupérer la clé complète depuis votre [Dashboard Stripe](https://dashboard.stripe.com/apikeys) si celle-ci ne fonctionne pas.

### 3. Variables Optionnelles (à configurer plus tard si besoin)
```env
# Email (Resend)
RESEND_API_KEY=
FROM_EMAIL=noreply@trajectory-app.com

# OAuth (Google/GitHub)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=
```

---

## 🔄 Étape 4 : Initialiser la Base de Données

Une fois les variables ajoutées, Railway va redéployer automatiquement. Cependant, la base de données est vide. Il faut pousser le schéma.

1.  Dans Railway, cliquez sur votre service **Next.js**.
2.  Allez dans l'onglet **Settings** > **Deploy** > **Build Command**.
3.  Vérifiez que la commande de build est bien :
    ```bash
    prisma generate && next build
    ```
    *(C'est la configuration par défaut dans `package.json`, donc ça devrait être bon)*.

4.  Pour créer les tables, le plus simple est d'utiliser le CLI Railway en local ou d'ajouter une commande de start personnalisée, mais **la méthode recommandée** est d'utiliser votre machine locale pour pousser le schéma vers la DB Railway :

    **Depuis votre terminal local :**
    a. Installez Railway CLI : `npm i -g @railway/cli`
    b. Connectez-vous : `railway login`
    c. Liez votre projet : `railway link` (sélectionnez le projet Trajectory)
    d. Poussez le schéma :
       ```bash
       railway run prisma db push
       ```

---

## 🔌 Étape 5 : Configurer le Webhook Stripe

1.  Allez sur [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks).
2.  Ajoutez un endpoint : `https://[VOTRE-URL-RAILWAY]/api/stripe/webhook`
3.  Sélectionnez les événements :
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.payment_succeeded`
    - `invoice.payment_failed`
4.  Si votre `STRIPE_WEBHOOK_SECRET` change, mettez à jour la variable dans Railway.

---

## 🌐 Étape 6 : Domaine Personnalisé (Optionnel)

1.  Dans Railway, service **Next.js** > **Settings** > **Networking**.
2.  Custom Domain > Connect Domain.
3.  Entrez `www.trajectory-app.com`.
4.  Suivez les instructions DNS fournies par Railway.

---

## ✅ Checklist de Vérification

- [ ] Projet créé sur Railway
- [ ] Base de données PostgreSQL ajoutée
- [ ] Variables d'environnement configurées (DATABASE_URL est auto, Stripe, NextAuth)
- [ ] Schéma de base de données poussé (`prisma db push`)
- [ ] Déploiement réussi (vert)
- [ ] Site accessible via l'URL Railway
