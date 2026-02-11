import { db } from './src/lib/db'

async function checkDatabase() {
  console.log('=== Checking Database Content ===\n')

  // Check users
  const users = await db.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      role: true,
      branchId: true,
      isActive: true,
    },
    orderBy: { createdAt: 'asc' },
  })
  console.log(`\n📊 Users (${users.length}):`)
  if (users.length === 0) {
    console.log('  ⚠️  No users found in database!')
  } else {
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.role}) - ${user.email} - Active: ${user.isActive}`)
    })
  }

  // Check branches
  const branches = await db.branch.findMany({
    select: {
      id: true,
      branchName: true,
      isActive: true,
      licenseKey: true,
    },
  })
  console.log(`\n📊 Branches (${branches.length}):`)
  if (branches.length === 0) {
    console.log('  ⚠️  No branches found in database!')
  } else {
    branches.forEach(branch => {
      console.log(`  - ${branch.branchName} (${branch.isActive ? 'Active' : 'Inactive'}) - Key: ${branch.licenseKey.substring(0, 8)}...`)
    })
  }

  // Check menu items
  const menuItems = await db.menuItem.findMany({ select: { id: true, name: true, isActive: true } })
  console.log(`\n📊 Menu Items (${menuItems.length}):`)
  if (menuItems.length === 0) {
    console.log('  ⚠️  No menu items found in database!')
  } else {
    menuItems.slice(0, 5).forEach(item => {
      console.log(`  - ${item.name} (${item.isActive ? 'Active' : 'Inactive'})`)
    })
    if (menuItems.length > 5) {
      console.log(`  ... and ${menuItems.length - 5} more`)
    }
  }

  // Check categories
  const categories = await db.category.findMany({ select: { id: true, name: true, isActive: true } })
  console.log(`\n📊 Categories (${categories.length}):`)
  if (categories.length === 0) {
    console.log('  ⚠️  No categories found in database!')
  } else {
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.isActive ? 'Active' : 'Inactive'})`)
    })
  }

  await db.$disconnect()
  console.log('\n✅ Database check complete!')
}

checkDatabase().catch(console.error)
