const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkDatabase() {
  console.log('📊 État de la base de données :\n')
  
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true } })
  const organizations = await prisma.organization.findMany()
  const clients = await prisma.client.findMany({ select: { id: true, name: true, organizationId: true } })
  const invoices = await prisma.invoice.findMany({ select: { id: true, number: true, organizationId: true } })
  
  console.log(`👥 Users: ${users.length}`)
  users.forEach(u => console.log(`   - ${u.email} (${u.name || 'Sans nom'})`))
  
  console.log(`\n🏢 Organizations: ${organizations.length}`)
  organizations.forEach(o => console.log(`   - ${o.name} (slug: ${o.slug})`))
  
  console.log(`\n👤 Clients: ${clients.length}`)
  if (clients.length > 0) {
    console.log(`   ⚠️  ${clients.filter(c => !c.organizationId).length} clients sans organization`)
  }
  
  console.log(`\n📄 Invoices: ${invoices.length}`)
  if (invoices.length > 0) {
    console.log(`   ⚠️  ${invoices.filter(i => !i.organizationId).length} factures sans organization`)
  }
}

checkDatabase()
  .catch(e => console.error('❌ Erreur:', e))
  .finally(() => prisma.$disconnect())
