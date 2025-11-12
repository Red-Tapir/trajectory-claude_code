# 🚀 Guide de déploiement Vercel - Trajectory
## www.trajectory-app.com

---

## 📋 CHECKLIST COMPLÈTE DE DÉPLOIEMENT

### ✅ Étape 1 : Déployer sur Vercel

1. **Aller sur** : https://vercel.com/dashboard
2. **Connectez-vous** avec GitHub
3. **Import Project** → Sélectionner `trajectory-claude_code`
4. **Branch** : `claude/trajectory-saas-platform-011CUubhq3DwgGcLbX4gRsmW`
5. **Deploy** (première fois - échouera sans les variables d'environnement)

---

### ✅ Étape 2 : Configuration des variables d'environnement

Allez dans **Vercel Dashboard** → Votre projet → **Settings** → **Environment Variables**

**IMPORTANT** : Pour CHAQUE variable, cochez les 3 cases :
- ☑️ Production
- ☑️ Preview
- ☑️ Development

---

## 🔴 VARIABLES OBLIGATOIRES

### 1. Base de données PostgreSQL (Supabase)

**Créer la base de données** :
1. Aller sur https://supabase.com/dashboard
2. Créer un compte gratuit
3. **New Project** :
   - Name : `trajectory-production`
   - Password : Créez un mot de passe fort et **NOTEZ-LE**
   - Region : **Europe West (Ireland)**
4. Attendre 2 minutes que le projet se crée
5. Aller dans **Settings** → **Database**
6. Copier **Connection String** → **URI**
7. Remplacer `[YOUR-PASSWORD]` par votre vrai mot de passe dans l'URL

**Dans Vercel, ajouter** :
```
Name: DATABASE_URL
Value: postgresql://postgres.xxxxx:[VOTRE-MOT-DE-PASSE]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

---

### 2. NextAuth Configuration

**Générer le secret** :

Sur Windows (PowerShell ou Git Bash) :
```bash
openssl rand -base64 32
```

Vous obtiendrez quelque chose comme : `XkJ8vN3pQ7mR2dH9wL5tK1fY6sC0aB4eG8iU3jV7nM=`

**Dans Vercel, ajouter** :
```
Name: NEXTAUTH_URL
Value: https://www.trajectory-app.com

Name: NEXTAUTH_SECRET
Value: [RESULTAT DE LA COMMANDE OPENSSL]

Name: NEXT_PUBLIC_APP_URL
Value: https://www.trajectory-app.com
```

---

### 3. Stripe - Configuration MODE LIVE

**⚠️ VOS CLÉS STRIPE (déjà créées dans votre dashboard Stripe)**

Vous avez déjà créé vos produits et récupéré vos clés. Voici où les mettre :

**Dans Vercel, ajouter toutes ces variables** :

#### Secret Key
```
Name: STRIPE_SECRET_KEY
Value: sk_live_51SQscpGWO8fE6XBH... (commence par sk_live_)
```
👉 **Trouvez votre clé sur** : https://dashboard.stripe.com/apikeys

#### Webhook Secret
```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_... (votre signing secret)
```
👉 **Vous l'avez déjà** : `whsec_pLNDRj3ZnYGzD7lY1lDHfUdVzkAJQZbu`

#### Plan Starter (29€/mois)
```
Name: STRIPE_PRODUCT_ID_STARTER
Value: prod_TPS0IqnaWCnUZo

Name: STRIPE_PRICE_ID_STARTER
Value: price_1SSd6pGWO8fE6XBHUqVPUob3
```

#### Plan Pro (79€/mois)
```
Name: STRIPE_PRODUCT_ID_PRO
Value: prod_TPS2M84BrQ1lmO

Name: STRIPE_PRICE_ID_PRO
Value: price_1SSd8qGWO8fE6XBHisoB0yPa
```

#### Plan Enterprise (199€/mois)
```
Name: STRIPE_PRODUCT_ID_ENTERPRISE
Value: prod_TPS36HsHqvcjld

Name: STRIPE_PRICE_ID_ENTERPRISE
Value: price_1SSd9FGWO8fE6XBHcCGVWZjr
```

---

## 🟡 VARIABLES OPTIONNELLES (configurez plus tard)

### Email - Resend (pour envoi automatique de factures)
```
Name: RESEND_API_KEY
Value: (laissez vide pour l'instant)

Name: FROM_EMAIL
Value: noreply@trajectory-app.com
```

### Rate Limiting - Upstash Redis
```
Name: UPSTASH_REDIS_REST_URL
Value: (laissez vide pour l'instant)

Name: UPSTASH_REDIS_REST_TOKEN
Value: (laissez vide pour l'instant)
```

### OAuth (connexion Google/GitHub)
```
Name: GOOGLE_CLIENT_ID
Value: (laissez vide)

Name: GOOGLE_CLIENT_SECRET
Value: (laissez vide)

Name: GITHUB_ID
Value: (laissez vide)

Name: GITHUB_SECRET
Value: (laissez vide)
```

---

## ✅ Étape 3 : Configurer le webhook Stripe

**IMPORTANT** : À faire APRÈS que votre site soit déployé sur Vercel

1. Aller sur https://dashboard.stripe.com/webhooks
2. **Add endpoint**
3. **Endpoint URL** : `https://www.trajectory-app.com/api/stripe/webhook`
4. **Events to send** - Sélectionnez :
   - ☑️ `checkout.session.completed`
   - ☑️ `customer.subscription.created`
   - ☑️ `customer.subscription.updated`
   - ☑️ `customer.subscription.deleted`
   - ☑️ `invoice.payment_succeeded`
   - ☑️ `invoice.payment_failed`
5. **Add endpoint**
6. Le **Signing secret** devrait être : `whsec_pLNDRj3ZnYGzD7lY1lDHfUdVzkAJQZbu` (déjà configuré ci-dessus)

---

## ✅ Étape 4 : Configurer le domaine

1. **Vercel Dashboard** → **Settings** → **Domains**
2. **Add Domain** : `trajectory-app.com`
3. **Add Domain** : `www.trajectory-app.com`
4. **Configurer les DNS** chez votre registrar :
   - Vercel vous donnera les enregistrements DNS à ajouter
   - Type A ou CNAME selon les instructions

---

## ✅ Étape 5 : Redéployer

1. **Aller dans** : Deployments
2. **Cliquer sur "Redeploy"** du dernier déploiement
3. **Attendre** (~2 minutes)
4. ✅ **Site en ligne !**

---

## 🧪 Étape 6 : Tester

### Test 1 : Accéder au site
```
https://www.trajectory-app.com
```

### Test 2 : S'inscrire
1. Cliquer sur "Inscription"
2. Créer un compte
3. Se connecter au dashboard

### Test 3 : Tester un paiement
1. Aller sur `/pricing`
2. Cliquer sur "Choisir Pro"
3. **⚠️ MODE LIVE** - Utilisez une vraie carte !
4. Vérifier dans Stripe Dashboard que le paiement apparaît

---

## ⚠️ AVANT D'ACCEPTER DES PAIEMENTS

### Pages légales OBLIGATOIRES en France

Vous DEVEZ créer ces pages avant d'accepter le premier paiement :

- [ ] **CGU** (Conditions Générales d'Utilisation)
- [ ] **CGV** (Conditions Générales de Vente)
- [ ] **Mentions légales**
- [ ] **Politique de remboursement**

**Sans ces pages** :
- ❌ Illégal en France (amende DGCCRF)
- ❌ Risque de fermeture du compte Stripe
- ❌ Les clients peuvent annuler leurs paiements

### Informations à inclure dans les mentions légales :
- Nom de votre entreprise
- Numéro SIRET
- Adresse du siège social
- Email de contact
- Nom du directeur de publication
- Hébergeur : Vercel Inc.
- Numéro CNIL (si données personnelles)

---

## 🆘 Dépannage

### Erreur : "Database connection failed"
- Vérifiez que `DATABASE_URL` est correcte
- Vérifiez que le mot de passe dans l'URL est correct
- Redéployez après avoir changé

### Erreur : "Unauthorized" dans Stripe
- Vérifiez que `STRIPE_SECRET_KEY` commence par `sk_live_`
- Vérifiez que vous êtes en mode LIVE dans Stripe Dashboard

### Webhook ne fonctionne pas
- Vérifiez l'URL : `https://www.trajectory-app.com/api/stripe/webhook`
- Vérifiez le signing secret dans Stripe Dashboard et Vercel
- Consultez les logs dans Stripe Dashboard → Webhooks

### Site ne se charge pas
- Vérifiez les logs dans Vercel : Deployments → [votre déploiement] → Function Logs
- Vérifiez que toutes les variables obligatoires sont configurées

---

## 📞 Support

**Logs Vercel** : https://vercel.com/dashboard → Deployments → View Function Logs
**Stripe Dashboard** : https://dashboard.stripe.com
**Supabase Dashboard** : https://supabase.com/dashboard

---

## ✅ CHECKLIST FINALE

- [ ] Vercel projet créé et déployé
- [ ] PostgreSQL créé sur Supabase
- [ ] DATABASE_URL configurée dans Vercel
- [ ] NEXTAUTH_SECRET généré et configuré
- [ ] Toutes les variables Stripe configurées (9 variables)
- [ ] Webhook Stripe configuré avec la bonne URL
- [ ] Domaine trajectory-app.com configuré
- [ ] DNS pointent vers Vercel
- [ ] Site accessible sur https://www.trajectory-app.com
- [ ] Pages légales créées (CGU/CGV/Mentions)
- [ ] Test de paiement effectué
- [ ] Stripe en mode LIVE activé

---

**Félicitations ! Votre SaaS est en ligne ! 🎉**
