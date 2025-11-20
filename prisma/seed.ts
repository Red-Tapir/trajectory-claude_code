import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')

  // Créer un utilisateur de test
  const hashedPassword = await bcrypt.hash('password123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@trajectory.fr' },
    update: {},
    create: {
      email: 'demo@trajectory.fr',
      name: 'Demo User',
      password: hashedPassword,
    },
  })

  console.log('✅ Utilisateur créé:', user.email)

  // Créer une organisation (ou récupérer si existe)
  let organization = await prisma.organization.findFirst({
    where: {
      members: {
        some: {
          userId: user.id,
          role: 'OWNER'
        }
      }
    }
  })

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: 'Ma Super Entreprise',
        siret: '12345678901234',
        address: '123 Rue de la Demo',
        city: 'Paris',
        postalCode: '75001',
        country: 'France',
        phone: '+33 1 23 45 67 89',
        email: 'contact@masuperentreprise.fr',
        plan: 'pro',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          }
        }
      },
    })
  }

  console.log('✅ Organisation créée:', organization.name)

  // Update user's currentOrganizationId
  await prisma.user.update({
    where: { id: user.id },
    data: { currentOrganizationId: organization.id }
  })

  console.log('✅ Utilisateur lié à l\'organisation')

  // Créer des clients de démonstration
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        organizationId: organization.id,
        name: 'SARL Dupont',
        email: 'contact@dupont.fr',
        phone: '+33 6 12 34 56 78',
        address: '10 Avenue des Champs',
        city: 'Lyon',
        postalCode: '69001',
        country: 'France',
        siret: '98765432109876',
        type: 'company',
        status: 'active',
      },
    }),
    prisma.client.create({
      data: {
        organizationId: organization.id,
        name: 'Tech Solutions',
        email: 'contact@techsolutions.fr',
        phone: '+33 6 23 45 67 89',
        address: '45 Boulevard Innovation',
        city: 'Marseille',
        postalCode: '13001',
        country: 'France',
        siret: '11122233344455',
        type: 'company',
        status: 'active',
      },
    }),
    prisma.client.create({
      data: {
        organizationId: organization.id,
        name: 'Consulting Pro',
        email: 'contact@consultingpro.fr',
        phone: '+33 6 34 56 78 90',
        address: '78 Rue du Commerce',
        city: 'Toulouse',
        postalCode: '31000',
        country: 'France',
        type: 'company',
        status: 'prospect',
      },
    }),
  ])

  console.log(`✅ ${clients.length} clients créés`)

  // Créer des factures de démonstration
  const invoices = []
  for (let i = 0; i < 5; i++) {
    const client = clients[i % clients.length]
    const date = new Date(2024, 9 - i, 15)
    const dueDate = new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000)

    const invoice = await prisma.invoice.create({
      data: {
        organizationId: organization.id,
        clientId: client.id,
        number: `2024-${String(45 - i).padStart(3, '0')}`,
        date,
        dueDate,
        status: i === 0 ? 'sent' : i === 1 ? 'overdue' : 'paid',
        subtotal: 2000 + i * 500,
        taxRate: 20.0,
        taxAmount: (2000 + i * 500) * 0.2,
        total: (2000 + i * 500) * 1.2,
        currency: 'EUR',
        notes: 'Merci pour votre confiance',
        paymentTerms: 'Paiement à 30 jours',
        items: {
          create: [
            {
              description: 'Prestation de développement web',
              quantity: 5 + i,
              unitPrice: 400,
              taxRate: 20.0,
              total: (5 + i) * 400,
            },
          ],
        },
      },
    })
    invoices.push(invoice)
  }

  console.log(`✅ ${invoices.length} factures créées`)

  // Créer un budget de démonstration
  const budget = await prisma.budget.create({
    data: {
      organizationId: organization.id,
      name: 'Budget 2024',
      year: 2024,
      type: 'annual',
      status: 'active',
      categories: {
        create: [
          {
            name: 'Prestations de service',
            type: 'revenue',
            planned: 120000,
            actual: 98500,
          },
          {
            name: 'Ventes de produits',
            type: 'revenue',
            planned: 80000,
            actual: 72300,
          },
          {
            name: 'Salaires',
            type: 'expense',
            planned: 60000,
            actual: 58200,
          },
          {
            name: 'Marketing',
            type: 'expense',
            planned: 15000,
            actual: 12800,
          },
        ],
      },
    },
  })

  console.log('✅ Budget créé:', budget.name)

  console.log('\n🎉 Seeding terminé avec succès!')
  console.log('\n📧 Compte de test:')
  console.log('   Email: demo@trajectory.fr')
  console.log('   Mot de passe: password123')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
