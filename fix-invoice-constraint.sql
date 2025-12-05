-- Supprimer l'ancienne contrainte d'unicité sur Invoice.number
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_number_key";

-- La nouvelle contrainte unique (organizationId, number) sera créée par Prisma
