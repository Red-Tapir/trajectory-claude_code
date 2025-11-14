# Guide de Dépannage - Erreur d'Inscription

## Erreur: "Une erreur est survenue lors de la création du compte"

Cette erreur se produit généralement lorsque **DIRECT_DATABASE_URL** n'est pas configuré dans Vercel.

---

## 🔍 Étape 1: Diagnostic

Visitez cette URL pour vérifier la configuration de votre base de données:

```
https://www.trajectory-app.com/api/debug/db-connection
```

Vous verrez un rapport JSON avec plusieurs vérifications:
- ✅ **databaseConnection**: La connexion poolée fonctionne
- ✅ **databaseQuery**: Les requêtes simples fonctionnent
- ❌ **databaseTransaction**: Les transactions échouent (si DIRECT_DATABASE_URL manque)

Si `databaseTransaction` affiche une erreur, passez à l'Étape 2.

---

## ⚙️ Étape 2: Configuration de DIRECT_DATABASE_URL dans Vercel

### 2.1 Récupérer la connection string depuis Supabase

1. Allez sur **Supabase Dashboard**
2. Sélectionnez votre projet (`trajectory`)
3. Allez dans **Settings** → **Database**
4. Descendez à la section **Connection string**
5. Sélectionnez **Transaction Mode** dans le dropdown
6. Copiez la connection string qui apparaît

Elle devrait ressembler à:
```
postgresql://postgres.oldqqjoledhllbsokexa:[YOUR-PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:5432/postgres
```

**⚠️ IMPORTANT**: Remplacez `[YOUR-PASSWORD]` par votre vrai mot de passe de base de données!

---

### 2.2 Ajouter DIRECT_DATABASE_URL dans Vercel

1. Allez sur **Vercel Dashboard** (https://vercel.com)
2. Cliquez sur votre projet **trajectory-claude-code**
3. Allez dans **Settings** (en haut)
4. Dans le menu de gauche, cliquez sur **Environment Variables**
5. Cliquez sur **Add New**

Remplissez:
- **Key**: `DIRECT_DATABASE_URL`
- **Value**: La connection string que vous avez copiée depuis Supabase (Transaction Mode, port 5432)
- **Environments**: Cochez **Production**, **Preview**, et **Development**

6. Cliquez sur **Save**

---

### 2.3 Mettre à jour DATABASE_URL (ajouter le paramètre pgbouncer)

Pendant que vous êtes dans Environment Variables:

1. Trouvez la variable **DATABASE_URL**
2. Cliquez sur les **3 points** à droite → **Edit**
3. Ajoutez `?pgbouncer=true&connection_limit=1` à la fin de l'URL

**Avant:**
```
postgresql://postgres.oldqqjoledhllbsokexa:PASSWORD@aws-0-eu-north-1.pooler.supabase.com:6543/postgres
```

**Après:**
```
postgresql://postgres.oldqqjoledhllbsokexa:PASSWORD@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

4. Cliquez sur **Save**

---

## 🚀 Étape 3: Redéploiement

Vercel va automatiquement redéployer quand vous modifiez les variables d'environnement.

Pour vérifier:
1. Allez dans l'onglet **Deployments**
2. Vous devriez voir un nouveau déploiement en cours
3. Attendez qu'il soit marqué **Ready** (généralement 2-3 minutes)

---

## ✅ Étape 4: Test

1. Revisitez `https://www.trajectory-app.com/api/debug/db-connection`
   - Toutes les vérifications devraient être ✅ (success)

2. Allez sur `https://www.trajectory-app.com/inscription`
   - Remplissez le formulaire d'inscription
   - Cliquez sur **S'inscrire**

Si tout est correct, vous devriez:
- ✅ Être redirigé vers le dashboard
- ✅ Recevoir un email de bienvenue
- ✅ Voir votre compte créé dans Supabase

---

## 🐛 En cas de problème persistant

### Vérifier les Runtime Logs

1. Dans Vercel, allez dans **Deployments**
2. Cliquez sur le dernier déploiement
3. Allez dans l'onglet **Functions**
4. Tentez de vous inscrire à nouveau
5. Cliquez sur **Refresh** pour voir les nouveaux logs
6. Cherchez les lignes qui commencent par:
   ```
   Registration error:
   Error type:
   Prisma error code:
   ```

### Erreurs courantes et solutions

| Erreur | Cause | Solution |
|--------|-------|----------|
| `P1001: Can't reach database server` | URL incorrecte ou credentials invalides | Vérifiez DATABASE_URL et DIRECT_DATABASE_URL |
| `P1002: The database server timeout` | Problème réseau ou Supabase inaccessible | Attendez quelques minutes et réessayez |
| `P2002: Unique constraint failed` | Email déjà utilisé | Utilisez un autre email ou supprimez l'utilisateur existant dans Supabase |
| `Prepared statements not supported` | DIRECT_DATABASE_URL manquante | Ajoutez DIRECT_DATABASE_URL (étape 2) |
| `Cannot use transactions with pgBouncer` | DATABASE_URL utilisée pour les transactions | Assurez-vous que DIRECT_DATABASE_URL est configurée |

---

## 📋 Checklist Complète

Avant de tester l'inscription, vérifiez que:

- [ ] `DATABASE_URL` est configurée dans Vercel avec port **6543** et `?pgbouncer=true&connection_limit=1`
- [ ] `DIRECT_DATABASE_URL` est configurée dans Vercel avec port **5432** (SANS pgbouncer)
- [ ] Les deux URLs utilisent le même mot de passe
- [ ] Les deux URLs incluent la référence du projet: `postgres.oldqqjoledhllbsokexa`
- [ ] Le déploiement Vercel est terminé et marque **Ready**
- [ ] `/api/debug/db-connection` retourne toutes les vérifications en ✅
- [ ] Les tables existent dans Supabase (User, Company, CompanyMember, etc.)

---

## 🆘 Support

Si après avoir suivi tous ces steps l'erreur persiste:

1. Capturez une capture d'écran de `/api/debug/db-connection`
2. Capturez les Runtime Logs de Vercel lors de la tentative d'inscription
3. Vérifiez les logs de Supabase (Supabase → Logs → Postgres Logs)

Ces informations permettront de diagnostiquer le problème exact.
