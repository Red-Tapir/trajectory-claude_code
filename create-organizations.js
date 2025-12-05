const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createOrganizations() {
  console.log('🏗️  Création des organizations...\n')
  
  // Récupérer le rôle Owner
  const ownerRole = await prisma.role.findUnique({ where: { name: 'owner' } })
  if (!ownerRole) {
    throw new Error('❌ Rôle Owner introuvable!')
  }
  
  // Récupérer tous les utilisateurs
  const users = await prisma.user.findMany()
  console.log(`Trouvé ${users.length} utilisateurs\n`)
  
  for (const user of users) {
    console.log(`📝 Traitement de ${user.email} (${user.name})`)
    
    // Créer un slug depuis le nom ou email
    const baseName = user.name || user.email.split('@')[0]
    const baseSlug = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    let slug = baseSlug
    let counter = 1
    
    // Assurer l'unicité du slug
    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    
    // Créer l'organization
    const organization = await prisma.organization.create({
      data: {
        name: user.name || user.email.split('@')[0],
        slug: slug,
        plan: 'trial',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours
      }
    })
    
    console.log(`   ✅ Organization créée: ${organization.name} (${organization.slug})`)
    
    // Assigner l'utilisateur comme Owner
    await prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        roleId: ownerRole.id,
        status: 'active',
      }
    })
    
    console.log(`   ✅ ${user.email} assigné comme Owner`)
    
    // Définir comme organization active
    await prisma.user.update({
      where: { id: user.id },
      data: { currentOrganizationId: organization.id }
    })
    
    console.log(`   ✅ Organization définie comme active\n`)
  }
  
  console.log('✅ Toutes les organizations ont été créées!')
  
  // Résumé
  const orgCount = await prisma.organization.count()
  const memberCount = await prisma.organizationMember.count()
  
  console.log(`\n📊 Résumé:`)
  console.log(`   Organizations: ${orgCount}`)
  console.log(`   Members: ${memberCount}`)
}

createOrganizations()
  .catch(e => console.error('❌ Erreur:', e))
  .finally(() => prisma.$disconnect())
