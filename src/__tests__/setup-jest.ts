// Setup para testes Jest
import 'jest'

// Mock de console.log para testes mais limpos
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock do fuso horário brasileiro
process.env.TZ = 'America/Sao_Paulo'
