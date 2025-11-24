const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixAllConstraints() {
  console.log('🔧 Suppression des anciennes contraintes...\n')
  
  const constraints = [
    'ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_number_key"',
    'ALTER TABLE "Subscription" DROP CONSTRAINT IF EXISTS "Subscription_companyId_key"',
    'ALTER TABLE "Company" DROP CONSTRAINT IF EXISTS "Company_siret_key"',
    'ALTER TABLE "Company" DROP CONSTRAINT IF EXISTS "Company_stripeCustomerId_key"',
  ]
  
  for (const sql of constraints) {
    try {
      await prisma.$executeRawUnsafe(sql)
      console.log(`✅ ${sql.match(/DROP CONSTRAINT IF EXISTS "(.+?)"/)[1]}`)
    } catch (e) {
      console.log(`⚠️  ${e.message}`)
    }
  }
  
  console.log('\n✅ Toutes les contraintes ont été traitées!')
}

fixAllConstraints()
  .catch(e => console.error('❌ Erreur:', e))
  .finally(() => prisma.$disconnect())
