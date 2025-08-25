/**
 * Script para testar o relacionamento entre pacientes e profissionais
 * Este script pode ser executado para verificar se a implementação está funcionando corretamente
 */

import { eq } from 'drizzle-orm'

import { db } from '../src/app/db'
import { patientsTable } from '../src/app/db/schemas/patient-schema'
import { professionalsTable } from '../src/app/db/schemas/professional-schema'

async function testPatientProfessionalRelationship() {
  console.log('🧪 Testando relacionamento Paciente -> Profissional...\n')

  try {
    // 1. Verificar se há profissionais cadastrados
    const professionals = await db.select().from(professionalsTable).limit(5)
    console.log(`📋 Profissionais encontrados: ${professionals.length}`)

    if (professionals.length === 0) {
      console.log('⚠️ Nenhum profissional encontrado. Criando um para teste...')

      const [newProfessional] = await db
        .insert(professionalsTable)
        .values({
          name: 'Dr. João Silva',
          councilNumber: 'CRP-123456',
        })
        .returning()

      console.log(`✅ Profissional criado: ${newProfessional.name} (ID: ${newProfessional.id})`)
      professionals.push(newProfessional)
    }

    // 2. Verificar se há pacientes cadastrados
    const patients = await db.select().from(patientsTable).limit(5)
    console.log(`🏥 Pacientes encontrados: ${patients.length}`)

    // 3. Criar um paciente de teste se necessário
    if (patients.length === 0) {
      console.log('⚠️ Nenhum paciente encontrado. Criando um para teste...')

      const [newPatient] = await db
        .insert(patientsTable)
        .values({
          name: 'Maria Santos',
          professionalId: professionals[0].id,
        })
        .returning()

      console.log(`✅ Paciente criado: ${newPatient.name} (ID: ${newPatient.id})`)
      console.log(`🔗 Vinculado ao profissional: ${professionals[0].name}`)
    }

    // 4. Testar query com JOIN para listar pacientes com profissionais
    console.log('\n🔍 Testando query com JOIN...')

    const patientsWithProfessionals = await db
      .select({
        patient: {
          id: patientsTable.id,
          name: patientsTable.name,
          professionalId: patientsTable.professionalId,
        },
        professional: {
          id: professionalsTable.id,
          name: professionalsTable.name,
          councilNumber: professionalsTable.councilNumber,
        },
      })
      .from(patientsTable)
      .leftJoin(professionalsTable, eq(patientsTable.professionalId, professionalsTable.id))
      .limit(5)

    console.log(`📊 Pacientes com profissionais: ${patientsWithProfessionals.length}`)

    patientsWithProfessionals.forEach((row, index) => {
      console.log(`${index + 1}. Paciente: ${row.patient.name}`)
      console.log(`   Profissional: ${row.professional?.name || 'Não definido'}`)
      console.log(`   Conselho: ${row.professional?.councilNumber || 'N/A'}`)
      console.log('')
    })

    console.log('✅ Teste concluído com sucesso!')
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  }
}

// Executar o teste se o script for chamado diretamente
if (require.main === module) {
  testPatientProfessionalRelationship()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

export { testPatientProfessionalRelationship }
