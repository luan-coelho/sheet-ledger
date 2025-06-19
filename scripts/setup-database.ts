import { db, testConnection } from '../src/app/db'
import { getDatabaseInfo } from '../src/lib/db-health'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

async function setupDatabase() {
  console.log('🚀 Configurando banco de dados Supabase...')
  
  // Testar conexão
  const isConnected = await testConnection()
  if (!isConnected) {
    console.error('❌ Falha na conexão com o banco de dados')
    process.exit(1)
  }

  try {
    // Verificar estado atual do banco
    console.log('📋 Verificando estado do banco de dados...')
    const dbInfo = await getDatabaseInfo()
    
    console.log(`📊 Status: ${dbInfo.status}`)
    console.log(`📝 ${dbInfo.message}`)
    
    if (dbInfo.info) {
      console.log(`📈 Tabelas: ${dbInfo.info.tablesCount}`)
      console.log(`🗄️ Versão: ${dbInfo.info.version?.split(' ')[0] || 'N/A'}`)
    }
    
    // Executar migrações se necessário
    if (dbInfo.status === 'warning' || dbInfo.status === 'error') {
      console.log('🔄 Executando migrações...')
      await migrate(db, { migrationsFolder: './drizzle' })
      
      // Verificar novamente após migrações
      const updatedInfo = await getDatabaseInfo()
      console.log(`✅ Status após migrações: ${updatedInfo.status}`)
    }
    
    console.log('✅ Banco de dados configurado com sucesso!')
    
    if (dbInfo.suggestion) {
      console.log(`💡 Sugestão: ${dbInfo.suggestion}`)
    }
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error)
    process.exit(1)
  }
  
  process.exit(0)
}

setupDatabase().catch(console.error) 