import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      '.next/**',
      '.next/*',
      'out/**',
      'build/**',
      'node_modules/**',
      '*.tsbuildinfo',
      'next-env.d.ts',
      '.vercel/**',
      'coverage/**',
      'drizzle/**',
      'src/generated/**',
    ],
  },
]

export default eslintConfig
