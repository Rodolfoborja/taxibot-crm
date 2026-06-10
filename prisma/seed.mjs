import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@rodolfoborja.com'
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin123'
  const nombre = process.env.SEED_ADMIN_NOMBRE ?? 'Administrador'

  const hash = await bcrypt.hash(password, 10)

  const admin = await prisma.adminPMA.upsert({
    where: { email },
    update: {},
    create: { email, nombre, password: hash, rol: 'ADMIN' },
  })

  console.log(`✅ Admin listo: ${admin.email}`)
  if (password === 'admin123') {
    console.log('⚠️  Estás usando la contraseña por defecto (admin123). Cámbiala en producción.')
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed falló:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
