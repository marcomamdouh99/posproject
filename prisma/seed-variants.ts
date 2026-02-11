import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding variant types and options...')

  // Create Variant Types
  const sizeType = await db.variantType.upsert({
    where: { name: 'Size' },
    update: {},
    create: {
      name: 'Size',
      description: 'Size variants (Regular, Large, etc.)',
      isActive: true,
    },
  })

  const weightType = await db.variantType.upsert({
    where: { name: 'Weight' },
    update: {},
    create: {
      name: 'Weight',
      description: 'Weight variants (250g, 500g, 1kg, etc.)',
      isActive: true,
    },
  })

  console.log('✅ Created variant types:', sizeType.name, weightType.name)

  // Create Size Options
  const regular = await db.variantOption.upsert({
    where: {
      variantTypeId_name: {
        variantTypeId: sizeType.id,
        name: 'Regular',
      },
    },
    update: {},
    create: {
      variantTypeId: sizeType.id,
      name: 'Regular',
      description: 'Standard size',
      sortOrder: 1,
      isActive: true,
    },
  })

  const large = await db.variantOption.upsert({
    where: {
      variantTypeId_name: {
        variantTypeId: sizeType.id,
        name: 'Large',
      },
    },
    update: {},
    create: {
      variantTypeId: sizeType.id,
      name: 'Large',
      description: 'Large size',
      sortOrder: 2,
      isActive: true,
    },
  })

  console.log('✅ Created size options:', regular.name, large.name)

  // Create Weight Options
  const w250g = await db.variantOption.upsert({
    where: {
      variantTypeId_name: {
        variantTypeId: weightType.id,
        name: '250g',
      },
    },
    update: {},
    create: {
      variantTypeId: weightType.id,
      name: '250g',
      description: '250 grams',
      sortOrder: 1,
      isActive: true,
    },
  })

  const w500g = await db.variantOption.upsert({
    where: {
      variantTypeId_name: {
        variantTypeId: weightType.id,
        name: '500g',
      },
    },
    update: {},
    create: {
      variantTypeId: weightType.id,
      name: '500g',
      description: '500 grams (half kilo)',
      sortOrder: 2,
      isActive: true,
    },
  })

  const w1kg = await db.variantOption.upsert({
    where: {
      variantTypeId_name: {
        variantTypeId: weightType.id,
        name: '1kg',
      },
    },
    update: {},
    create: {
      variantTypeId: weightType.id,
      name: '1kg',
      description: '1 kilogram',
      sortOrder: 3,
      isActive: true,
    },
  })

  console.log('✅ Created weight options:', w250g.name, w500g.name, w1kg.name)

  // Update categories with default variant types
  const icedDrinksCategory = await db.category.findUnique({
    where: { name: 'Iced Drinks' },
  })

  if (icedDrinksCategory) {
    await db.category.update({
      where: { id: icedDrinksCategory.id },
      data: { defaultVariantTypeId: sizeType.id },
    })
    console.log('✅ Updated Iced Drinks category with Size variant type')
  }

  // Update Coffee Beans category if it exists, otherwise create it
  const coffeeBeansCategory = await db.category.upsert({
    where: { name: 'Coffee Beans' },
    update: {},
    create: {
      name: 'Coffee Beans',
      description: 'Coffee beans for retail',
      sortOrder: 6,
      isActive: true,
      defaultVariantTypeId: weightType.id,
    },
  })

  if (coffeeBeansCategory) {
    await db.category.update({
      where: { id: coffeeBeansCategory.id },
      data: { defaultVariantTypeId: weightType.id },
    })
    console.log('✅ Updated Coffee Beans category with Weight variant type')
  }

  console.log('\n🎉 Variant seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
