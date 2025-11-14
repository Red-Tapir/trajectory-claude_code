# Deployment Guide - Trajectory SaaS

## Configuration Supabase pour Vercel

### Problème: Transactions Prisma avec Supabase Connection Pooling

Lorsque vous utilisez Supabase avec Prisma sur Vercel, vous devez configurer **deux URLs de base de données**:

1. **DATABASE_URL** (pooled) - Pour les requêtes normales
2. **DIRECT_DATABASE_URL** (direct) - Pour les migrations et les transactions

### Configuration dans Vercel

Allez dans **Vercel → Votre Projet → Settings → Environment Variables** et ajoutez:

#### 1. DATABASE_URL (Connection Pooler)
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Important:**
- Port: `6543` (pooler)
- Paramètre obligatoire: `?pgbouncer=true`
- `connection_limit=1` recommandé pour les environnements serverless

#### 2. DIRECT_DATABASE_URL (Direct Connection)
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

**Important:**
- Port: `5432` (direct connection)
- Utilisé automatiquement par Prisma pour les transactions (comme dans `/api/auth/register`)
- Ne pas ajouter `?pgbouncer=true`

### Comment obtenir vos URLs Supabase

1. Allez sur **Supabase Dashboard → Votre Projet → Settings → Database**
2. Dans la section "Connection string", sélectionnez:
   - **Transaction Mode** pour DIRECT_DATABASE_URL (port 5432)
   - **Session Mode** pour DATABASE_URL (port 6543) et ajoutez `?pgbouncer=true`

### Exemple Complet

Remplacez:
- `[PROJECT_REF]` par votre référence de projet (ex: `oldqqjoledhllbsokexa`)
- `[PASSWORD]` par votre mot de passe de base de données
- `[REGION]` par votre région (ex: `eu-north-1`)

```bash
# DATABASE_URL (pooled - pour les queries)
postgresql://postgres.oldqqjoledhllbsokexa:VotreMotDePasse@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# DIRECT_DATABASE_URL (direct - pour les transactions)
postgresql://postgres.oldqqjoledhllbsokexa:VotreMotDePasse@aws-0-eu-north-1.pooler.supabase.com:5432/postgres
```

### Autres Variables d'Environnement Requises

Voir le fichier `.env.production.example` pour la liste complète.

### Après Configuration

1. Redéployez votre application sur Vercel
2. Les tables seront automatiquement créées via le script `build` dans package.json
3. Testez l'inscription sur votre site

## Vérification

Pour vérifier que tout fonctionne:

1. Ouvrez **Vercel → Runtime Logs**
2. Tentez de vous inscrire sur votre site
3. Vérifiez les logs - vous devriez voir le succès de la création du compte
4. Si erreur, les logs détailleront le code d'erreur Prisma

## Codes d'Erreur Prisma Courants

- **P1001**: Can't reach database server
  - → Vérifiez vos URLs et credentials
- **P1002**: Database server timeout
  - → Problème de connexion réseau
- **P2002**: Unique constraint violation
  - → L'email existe déjà
- **P2003**: Foreign key constraint failed
  - → Problème de relation dans la base de données

## Support

En cas de problème, vérifiez:
1. Les URLs de base de données dans Vercel
2. Les Runtime Logs de Vercel
3. L'onglet Logs dans Supabase Dashboard
