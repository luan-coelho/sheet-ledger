#!/usr/bin/env tsx

/**
 * Script para criar usuários de teste no sistema
 *
 * Execute com: npx tsx scripts/create-test-users.ts
 */

import { db } from '../src/app/db'
import { usersTable } from '../src/app/db/schemas/user-schema'
import { eq } from 'drizzle-orm'

// Usuários de teste
const testUsers = [
  {
    name: 'Administrador',
    email: 'admin@teste.com',
    active: true,
  },
  {
    name: 'João Silva',
    email: 'joao@teste.com',
    active: true,
  },
  {
    name: 'Maria Santos',
    email: 'maria@teste.com',
    active: true,
  },
  {
    name: 'Pedro Oliveira',
    email: 'pedro@teste.com',
    active: false, // Usuário inativo para testar
  },
]

async function createTestUsers() {
  console.log('🔄 Criando usuários de teste...')

  try {
    for (const userData of testUsers) {
      // Verificar se o usuário já existe
      const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, userData.email)).limit(1)

      if (existingUser.length > 0) {
        console.log(`⚠️  Usuário com email ${userData.email} já existe, pulando...`)
        continue
      }

      // Criar usuário
      const [newUser] = await db
        .insert(usersTable)
        .values({
          name: userData.name,
          email: userData.email,
          active: userData.active,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      console.log(`✅ Usuário criado: ${newUser.name} (${newUser.email})`)
    }

    console.log('🎉 Usuários de teste criados com sucesso!')

    // Listar todos os usuários
    const allUsers = await db.select().from(usersTable)
    console.log('\n📋 Usuários no sistema:')
    allUsers.forEach(user => {
      const status = user.active ? '✅ Ativo' : '❌ Inativo'
      console.log(`   • ${user.name} (${user.email}) - ${status}`)
    })
  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

// Executar o script
createTestUsers()
