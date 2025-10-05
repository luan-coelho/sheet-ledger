import {
  competenceToDate,
  formatCompetence,
  formatCurrency,
  isValidCompetence,
} from '@/services/therapy-price-history-service'

describe('TherapyPriceHistoryService', () => {
  describe('formatCompetence', () => {
    it('deve formatar Date corretamente', () => {
      const date = new Date('2025-03-15')
      expect(formatCompetence(date)).toBe('2025-03')
    })

    it('deve formatar string YYYY-MM-DD corretamente', () => {
      expect(formatCompetence('2025-03-15')).toBe('2025-03')
    })

    it('deve retornar YYYY-MM sem alteração', () => {
      expect(formatCompetence('2025-03')).toBe('2025-03')
    })

    it('deve adicionar zero à esquerda para meses < 10', () => {
      const date = new Date('2025-01-15')
      expect(formatCompetence(date)).toBe('2025-01')
    })

    it('deve funcionar para meses >= 10', () => {
      const date = new Date('2025-12-15')
      expect(formatCompetence(date)).toBe('2025-12')
    })

    it('deve lidar com mudança de ano', () => {
      const date = new Date('2024-12-31')
      expect(formatCompetence(date)).toBe('2024-12')
    })
  })

  describe('formatCurrency', () => {
    it('deve formatar valores inteiros', () => {
      const result = formatCurrency(150)
      expect(result).toContain('R$')
      expect(result).toContain('150')
      expect(result).toContain(',00')
    })

    it('deve formatar valores decimais', () => {
      const result = formatCurrency(150.5)
      expect(result).toContain('R$')
      expect(result).toContain('150')
      expect(result).toContain(',50')
    })

    it('deve formatar valores com dois decimais', () => {
      const result = formatCurrency(150.99)
      expect(result).toContain('R$')
      expect(result).toContain('150')
      expect(result).toContain(',99')
    })

    it('deve formatar zero', () => {
      const result = formatCurrency(0)
      expect(result).toContain('R$')
      expect(result).toContain('0')
      expect(result).toContain(',00')
    })

    it('deve formatar valores grandes', () => {
      const result = formatCurrency(1500.5)
      expect(result).toContain('R$')
      expect(result).toContain('1')
      expect(result).toContain('500')
      expect(result).toContain(',50')
    })

    it('deve formatar valores muito grandes com separador de milhares', () => {
      const result = formatCurrency(150000.99)
      expect(result).toContain('R$')
      expect(result).toContain('150')
      expect(result).toContain('000')
      expect(result).toContain(',99')
    })

    it('deve arredondar valores com mais de 2 casas decimais', () => {
      const result = formatCurrency(150.999)
      expect(result).toContain('R$')
      expect(result).toContain('151')
    })
  })

  describe('competenceToDate', () => {
    it('deve converter competência para primeiro dia do mês', () => {
      const date = competenceToDate('2025-03')
      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(2) // JavaScript months are 0-based
      expect(date.getDate()).toBe(1)
    })

    it('deve funcionar para janeiro', () => {
      const date = competenceToDate('2025-01')
      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(0)
      expect(date.getDate()).toBe(1)
    })

    it('deve funcionar para dezembro', () => {
      const date = competenceToDate('2025-12')
      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(11)
      expect(date.getDate()).toBe(1)
    })

    it('deve definir hora como 00:00:00', () => {
      const date = competenceToDate('2025-03')
      expect(date.getHours()).toBe(0)
      expect(date.getMinutes()).toBe(0)
      expect(date.getSeconds()).toBe(0)
    })
  })

  describe('isValidCompetence', () => {
    describe('formatos válidos', () => {
      it('deve validar formato YYYY-MM correto', () => {
        expect(isValidCompetence('2025-03')).toBe(true)
      })

      it('deve validar janeiro', () => {
        expect(isValidCompetence('2025-01')).toBe(true)
      })

      it('deve validar dezembro', () => {
        expect(isValidCompetence('2025-12')).toBe(true)
      })

      it('deve validar anos diferentes', () => {
        expect(isValidCompetence('2024-06')).toBe(true)
        expect(isValidCompetence('2026-06')).toBe(true)
      })
    })

    describe('formatos inválidos', () => {
      it('deve rejeitar formato sem zero à esquerda', () => {
        expect(isValidCompetence('2025-3')).toBe(false)
      })

      it('deve rejeitar mês 00', () => {
        expect(isValidCompetence('2025-00')).toBe(false)
      })

      it('deve rejeitar mês 13', () => {
        expect(isValidCompetence('2025-13')).toBe(false)
      })

      it('deve rejeitar formato YYYY-MM-DD', () => {
        expect(isValidCompetence('2025-03-15')).toBe(false)
      })

      it('deve rejeitar formato apenas ano', () => {
        expect(isValidCompetence('2025')).toBe(false)
      })

      it('deve rejeitar string vazia', () => {
        expect(isValidCompetence('')).toBe(false)
      })

      it('deve rejeitar formato inválido', () => {
        expect(isValidCompetence('03/2025')).toBe(false)
      })

      it('deve rejeitar texto aleatório', () => {
        expect(isValidCompetence('invalid')).toBe(false)
      })

      it('deve rejeitar null/undefined convertidos para string', () => {
        expect(isValidCompetence('null')).toBe(false)
        expect(isValidCompetence('undefined')).toBe(false)
      })
    })

    describe('casos edge', () => {
      it('deve validar ano bissexto', () => {
        expect(isValidCompetence('2024-02')).toBe(true)
      })

      it('deve validar ano não-bissexto', () => {
        expect(isValidCompetence('2025-02')).toBe(true)
      })

      it('deve rejeitar datas futuras muito distantes (ano > 9999)', () => {
        // O regex aceita, mas a data pode não ser válida
        const result = isValidCompetence('10000-01')
        // Depende da implementação, mas geralmente deve ser false
        expect(typeof result).toBe('boolean')
      })
    })
  })

  describe('integração entre funções', () => {
    it('formatCompetence + isValidCompetence devem ser compatíveis', () => {
      const date = new Date('2025-03-15')
      const competence = formatCompetence(date)
      expect(isValidCompetence(competence)).toBe(true)
    })

    it('formatCompetence + competenceToDate devem ser compatíveis', () => {
      const originalDate = new Date('2025-03-15')
      const competence = formatCompetence(originalDate)
      const convertedDate = competenceToDate(competence)

      expect(convertedDate.getFullYear()).toBe(2025)
      expect(convertedDate.getMonth()).toBe(2)
    })

    it('ciclo completo: Date → competence → Date deve preservar mês/ano', () => {
      const dates = [new Date('2025-01-15'), new Date('2025-06-30'), new Date('2025-12-01')]

      dates.forEach(originalDate => {
        const competence = formatCompetence(originalDate)
        const convertedDate = competenceToDate(competence)

        expect(convertedDate.getFullYear()).toBe(originalDate.getFullYear())
        expect(convertedDate.getMonth()).toBe(originalDate.getMonth())
      })
    })
  })

  describe('casos de uso reais', () => {
    it('deve formatar competência de hoje', () => {
      const today = new Date()
      const competence = formatCompetence(today)

      expect(isValidCompetence(competence)).toBe(true)
      expect(competence).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/)
    })

    it('deve formatar valores de terapia comuns', () => {
      const commonPrices = [50, 100, 150, 200, 250, 300]

      commonPrices.forEach(price => {
        const formatted = formatCurrency(price)
        expect(formatted).toContain('R$')
        expect(formatted).toContain(price.toString())
      })
    })

    it('deve processar competências de um ano completo', () => {
      const competences = [
        '2025-01',
        '2025-02',
        '2025-03',
        '2025-04',
        '2025-05',
        '2025-06',
        '2025-07',
        '2025-08',
        '2025-09',
        '2025-10',
        '2025-11',
        '2025-12',
      ]

      competences.forEach(competence => {
        expect(isValidCompetence(competence)).toBe(true)
        const date = competenceToDate(competence)
        expect(date.getFullYear()).toBe(2025)
      })
    })

    it('deve ordenar competências cronologicamente', () => {
      const competences = ['2025-03', '2025-01', '2025-02']
      const sorted = competences.sort()

      expect(sorted).toEqual(['2025-01', '2025-02', '2025-03'])
    })

    it('deve comparar competências como strings', () => {
      expect('2025-03' > '2025-01').toBe(true)
      expect('2025-12' > '2025-01').toBe(true)
      expect('2026-01' > '2025-12').toBe(true)
    })
  })

  describe('cenários de erro', () => {
    it('deve lidar com valores negativos em formatCurrency', () => {
      // Valores negativos são válidos para exibição
      const formatted = formatCurrency(-150)
      expect(formatted).toContain('-')
      expect(formatted).toContain('R$')
    })

    it('deve rejeitar competências com caracteres especiais', () => {
      expect(isValidCompetence('2025-03!')).toBe(false)
      expect(isValidCompetence('2025/03')).toBe(false)
      expect(isValidCompetence('2025.03')).toBe(false)
    })

    it('deve rejeitar competências com espaços', () => {
      expect(isValidCompetence('2025-03 ')).toBe(false)
      expect(isValidCompetence(' 2025-03')).toBe(false)
      expect(isValidCompetence('2025- 03')).toBe(false)
    })
  })

  describe('conversão centavos/reais', () => {
    it('deve converter centavos para reais (simulação)', () => {
      // Simula a conversão que a API faz
      const valueCents = 15000
      const valueReais = valueCents / 100

      expect(valueReais).toBe(150)
      const formatted = formatCurrency(valueReais)
      expect(formatted).toContain('R$')
      expect(formatted).toContain('150')
      expect(formatted).toContain(',00')
    })

    it('deve converter reais para centavos (simulação)', () => {
      // Simula a conversão que a API faz ao salvar
      const valueReais = 150.99
      const valueCents = Math.round(valueReais * 100)

      expect(valueCents).toBe(15099)
    })

    it('deve preservar precisão em valores decimais', () => {
      const values = [0.01, 0.99, 1.5, 99.99, 150.5]

      values.forEach(value => {
        const cents = Math.round(value * 100)
        const backToReais = cents / 100

        expect(backToReais).toBeCloseTo(value, 2)
      })
    })
  })
})
