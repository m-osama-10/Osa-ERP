// This script runs after deployment to set up the database
// It creates all tables and seeds initial data
import { db } from '../src/lib/db'

async function main() {
  console.log('🔧 Setting up database...')

  // The tables are created by prisma db push (run in build)
  // This script only seeds the data

  // Check if already seeded
  const userCount = await db.user.count()
  if (userCount > 0) {
    console.log('✅ Database already seeded, skipping...')
    return
  }

  console.log('🌱 Seeding database...')
  // Import and run seed
  await import('../scripts/seed')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
