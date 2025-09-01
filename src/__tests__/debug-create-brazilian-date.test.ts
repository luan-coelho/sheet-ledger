import { createBrazilianDate } from '../lib/date-utils'

describe('Debug createBrazilianDate', () => {
  it('deve investigar como createBrazilianDate funciona em diferentes ambientes', () => {
    const originalTZ = process.env.TZ

    try {
      // Simula timezone UTC (como na Vercel)
      process.env.TZ = 'UTC'

      const startStr = '2025-09-01'
      const endStr = '2025-09-30'

      const startDate = createBrazilianDate(startStr)
      const endDate = createBrazilianDate(endStr)

      console.log('=== DEBUGGING createBrazilianDate ===')
      console.log('Input strings:', { startStr, endStr })
      console.log('Output dates:')
      console.log('  startDate:', startDate.toISOString(), '| Local:', startDate.toLocaleDateString())
      console.log('  endDate:', endDate.toISOString(), '| Local:', endDate.toLocaleDateString())
      console.log('  startDate.getTime():', startDate.getTime())
      console.log('  endDate.getTime():', endDate.getTime())

      // Simula o loop do ExcelService
      const currentDate = new Date(startDate)
      const dates = []
      let iterations = 0
      const maxIterations = 50

      console.log('=== LOOP SIMULATION ===')
      console.log('Initial currentDate:', currentDate.toISOString())
      console.log('Comparison: currentDate <= endDate:', currentDate <= endDate)

      while (currentDate <= endDate && iterations < maxIterations) {
        const dateStr = currentDate.toLocaleDateString('pt-BR')
        dates.push(dateStr)
        console.log(`Iteration ${iterations + 1}: ${currentDate.toISOString()} -> ${dateStr}`)

        currentDate.setDate(currentDate.getDate() + 1)
        console.log(`  After increment: ${currentDate.toISOString()}, comparison: ${currentDate <= endDate}`)

        iterations++
      }

      console.log('Final dates:', dates)
      console.log('Total iterations:', iterations)
      console.log('Has 30/09/2025:', dates.includes('30/09/2025'))

      expect(dates).toContain('30/09/2025')
    } finally {
      if (originalTZ) {
        process.env.TZ = originalTZ
      } else {
        delete process.env.TZ
      }
    }
  })
})
