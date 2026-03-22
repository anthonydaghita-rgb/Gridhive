import { PrismaClient } from '@prisma/client'
import { SYSTEM_TEMPLATES } from '../../packages/shared/src/index.js'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding system templates...')

  for (const template of SYSTEM_TEMPLATES) {
    await prisma.template.upsert({
      where: { slug: template.slug },
      update: {
        name: template.meta.name,
        description: template.meta.description,
        category: template.meta.category,
        topology: template.topology as object,
        difficulty: template.meta.difficulty,
        tags: template.meta.tags,
        validationExpected: template.meta.validationExpected,
        simTestSuite: template.simTestSuite as object,
        version: template.version,
      },
      create: {
        id: template.id,
        slug: template.slug,
        name: template.meta.name,
        description: template.meta.description,
        category: template.meta.category,
        isSystem: true,
        topology: template.topology as object,
        difficulty: template.meta.difficulty,
        tags: template.meta.tags,
        validationExpected: template.meta.validationExpected,
        simTestSuite: template.simTestSuite as object,
        version: template.version,
      },
    })
  }

  console.log('Seeding complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
