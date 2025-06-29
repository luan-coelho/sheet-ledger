#!/usr/bin/env tsx

/**
 * Script para importar pacientes em lote
 * Usage:
 *   tsx scripts/import-patients.ts                    - Usar dados do arquivo data.txt
 *   tsx scripts/import-patients.ts --input="dados"    - Usar dados inline
 *   tsx scripts/import-patients.ts --file=arquivo.txt - Usar arquivo específico
 */
import 'dotenv/config'

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

import { eq } from 'drizzle-orm'

import { db } from '../src/app/db'
import { healthPlansTable, patientsTable, type NewHealthPlan, type NewPatient } from '../src/app/db/schemas'

interface PatientData {
  name: string
  company: string
  healthPlan: string
}

/**
 * Parse dos dados no formato:
 * NOME PACIENTE	EMPRESA 	PLANO
 */
function parsePatientData(rawData: string): PatientData[] {
  const lines = rawData
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .filter(line => !line.includes('NOME PACIENTE')) // Remove header se existir

  const patients: PatientData[] = []

  for (const line of lines) {
    // Split por tab ou múltiplos espaços
    const parts = line
      .split(/\t+|\s{2,}/)
      .map(part => part.trim())
      .filter(part => part.length > 0)

    if (parts.length >= 3) {
      const name = parts[0]
      const company = parts[1]
      const healthPlan = parts[2]

      patients.push({
        name: name.toUpperCase(), // Normalizar para maiúsculas
        company: company.toUpperCase(),
        healthPlan: healthPlan.toUpperCase(),
      })
    } else {
      console.warn(`⚠️  Linha ignorada (formato inválido): ${line}`)
    }
  }

  return patients
}

async function importPatients(patientsData: PatientData[]) {
  console.log(`🏥 Importando ${patientsData.length} pacientes na base de dados...\n`)

  try {
    // 1. Primeiro, garantir que os planos de saúde existem
    console.log('📋 Verificando/criando planos de saúde...')

    const uniqueHealthPlans = [...new Set(patientsData.map(p => p.healthPlan))]
    const healthPlanIds: Record<string, string> = {}

    for (const planName of uniqueHealthPlans) {
      // Verificar se o plano já existe
      const existingPlan = await db.select().from(healthPlansTable).where(eq(healthPlansTable.name, planName)).limit(1)

      if (existingPlan.length > 0) {
        healthPlanIds[planName] = existingPlan[0].id
        console.log(`  ✓ Plano de saúde já existe: ${planName}`)
      } else {
        // Criar novo plano de saúde
        const newPlan: NewHealthPlan = { name: planName }
        const [created] = await db.insert(healthPlansTable).values(newPlan).returning()
        healthPlanIds[planName] = created.id
        console.log(`  ✓ Plano de saúde criado: ${planName}`)
      }
    }

    // 2. Inserir os pacientes
    console.log('\n👥 Inserindo pacientes...')

    let patientsCreated = 0
    let patientsSkipped = 0
    const duplicates: string[] = []

    for (const patientData of patientsData) {
      // Verificar se o paciente já existe
      const existingPatient = await db
        .select()
        .from(patientsTable)
        .where(eq(patientsTable.name, patientData.name))
        .limit(1)

      if (existingPatient.length > 0) {
        console.log(`  ⚠ Paciente já existe: ${patientData.name}`)
        duplicates.push(patientData.name)
        patientsSkipped++
      } else {
        // Criar novo paciente
        const newPatient: NewPatient = {
          name: patientData.name,
        }

        await db.insert(patientsTable).values(newPatient)
        patientsCreated++
        console.log(`  ✓ Paciente criado: ${patientData.name} (Plano: ${patientData.healthPlan})`)
      }
    }

    // 3. Resumo detalhado
    console.log('\n📊 Resumo da importação:')
    console.log(`  Pacientes processados: ${patientsData.length}`)
    console.log(`  Pacientes criados: ${patientsCreated}`)
    console.log(`  Pacientes já existentes: ${patientsSkipped}`)
    console.log(`  Planos de saúde únicos: ${uniqueHealthPlans.length}`)

    if (duplicates.length > 0) {
      console.log('\n📝 Pacientes duplicados encontrados:')
      duplicates.forEach(name => console.log(`  - ${name}`))
    }

    console.log('\n🎉 Importação concluída com sucesso!')

    return {
      success: true,
      processed: patientsData.length,
      created: patientsCreated,
      skipped: patientsSkipped,
      duplicates: duplicates,
    }
  } catch (error) {
    console.error('❌ Erro ao importar pacientes:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

async function main() {
  console.log('📥 Script de Importação de Pacientes')
  console.log('===================================\n')

  const args = process.argv.slice(2)
  let rawData = ''

  // Verificar argumentos
  const inputArg = args.find(arg => arg.startsWith('--input='))
  const fileArg = args.find(arg => arg.startsWith('--file='))

  if (inputArg) {
    // Dados inline
    rawData = inputArg.split('=')[1]
    console.log('📄 Usando dados fornecidos inline')
  } else if (fileArg) {
    // Arquivo específico
    const filename = fileArg.split('=')[1]
    const filePath = join(process.cwd(), filename)

    if (!existsSync(filePath)) {
      console.error(`❌ Arquivo não encontrado: ${filename}`)
      process.exit(1)
    }

    rawData = readFileSync(filePath, 'utf-8')
    console.log(`📄 Lendo dados do arquivo: ${filename}`)
  } else {
    // Arquivo padrão: data.txt
    const defaultFile = join(process.cwd(), 'data.txt')

    if (existsSync(defaultFile)) {
      rawData = readFileSync(defaultFile, 'utf-8')
      console.log('📄 Lendo dados do arquivo padrão: data.txt')
    } else {
      console.log('📋 Nenhum arquivo ou dados fornecidos.')
      console.log('\nComo usar:')
      console.log('  tsx scripts/import-patients.ts                     # Lê de data.txt')
      console.log('  tsx scripts/import-patients.ts --file=meus-dados.txt  # Lê de arquivo específico')
      console.log('  tsx scripts/import-patients.ts --input="NOME..."      # Dados inline')
      console.log('\nCrie um arquivo data.txt na raiz do projeto com os dados no formato:')
      console.log('NOME PACIENTE\\tEMPRESA\\tPLANO')
      process.exit(1)
    }
  }

  // Parse dos dados
  const patientsData = parsePatientData(rawData)

  if (patientsData.length === 0) {
    console.log('⚠️  Nenhum dado válido encontrado para processar.')
    process.exit(1)
  }

  console.log(`✅ ${patientsData.length} pacientes encontrados para processar\n`)

  // Importar os dados
  const result = await importPatients(patientsData)

  if (result.success) {
    process.exit(0)
  } else {
    console.error('\n❌ Importação falhou:', result.error)
    process.exit(1)
  }
}

// Tratamento de sinais
process.on('SIGINT', () => {
  console.log('\n\n👋 Operação cancelada pelo usuário')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n\n👋 Operação terminada')
  process.exit(0)
})

main()
