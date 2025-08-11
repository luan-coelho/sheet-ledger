// Tipos para melhor suporte TypeScript
export type RouteParams = Record<string, string | number>

/**
 * Rotas centralizadas da aplicação
 *
 * Este arquivo centraliza todas as rotas da aplicação (frontend e API) para facilitar
 * manutenção e refatoração. Sempre use estas rotas em vez de strings hardcoded.
 */

// Função utilitária para validar IDs
const validateId = (id: string): string => {
  if (!id || id.trim() === '') {
    throw new Error('ID é obrigatório')
  }
  return id.trim()
}

export const routes = {
  // Rotas do Frontend (páginas)
  frontend: {
    admin: {
      home: '/admin',
      sheets: '/admin/sheets',
      settings: '/admin/settings',
      professionals: {
        index: '/admin/professionals',
        create: '/admin/professionals/novo',
        edit: (id: string) => `/admin/professionals/${validateId(id)}/editar`,
      },
      patients: {
        index: '/admin/patients',
        create: '/admin/patients/novo',
        edit: (id: string) => `/admin/patients/${validateId(id)}/editar`,
      },
      guardians: {
        index: '/admin/guardians',
        create: '/admin/guardians/novo',
        edit: (id: string) => `/admin/guardians/${validateId(id)}/editar`,
      },
      companies: {
        index: '/admin/companies',
        create: '/admin/companies/novo',
        edit: (id: string) => `/admin/companies/${validateId(id)}/editar`,
      },
      healthPlans: {
        index: '/admin/health-plans',
        create: '/admin/health-plans/novo',
        edit: (id: string) => `/admin/health-plans/${validateId(id)}/editar`,
      },
      therapies: {
        index: '/admin/therapies',
        create: '/admin/therapies/novo',
        edit: (id: string) => `/admin/therapies/${validateId(id)}/editar`,
      },
      googleDrive: {
        index: '/admin/google-drive',
        folder: (folderId: string) => `/admin/google-drive/pasta/${validateId(folderId)}`,
      },
      users: {
        index: '/admin/users',
        create: '/admin/users/novo',
        edit: (id: string) => `/admin/users/${validateId(id)}/editar`,
      },
    },

    // Autenticação
    auth: {
      signIn: '/auth/signin',
    },
  },

  // Rotas da API (backend)
  api: {
    professionals: {
      base: '/api/professionals',
      byId: (id: string) => `/api/professionals/${validateId(id)}`,
    },
    patients: {
      base: '/api/patients',
      byId: (id: string) => `/api/patients/${validateId(id)}`,
    },
    guardians: {
      base: '/api/guardians',
      byId: (id: string) => `/api/guardians/${validateId(id)}`,
    },
    companies: {
      base: '/api/companies',
      byId: (id: string) => `/api/companies/${validateId(id)}`,
    },
    healthPlans: {
      base: '/api/health-plans',
      byId: (id: string) => `/api/health-plans/${validateId(id)}`,
    },
    therapies: {
      base: '/api/therapies',
      byId: (id: string) => `/api/therapies/${validateId(id)}`,
    },
    users: {
      base: '/api/users',
      byId: (id: string) => `/api/users/${validateId(id)}`,
    },
    googleDrive: {
      base: '/api/google-drive',
      files: '/api/google-drive/files',
      folders: '/api/google-drive/folders',
      search: '/api/google-drive/search',
      upload: '/api/google-drive/upload',
      download: (fileId: string) => `/api/google-drive/download/${validateId(fileId)}`,
      share: '/api/google-drive/share',
      permissions: (fileId: string) => `/api/google-drive/permissions/${validateId(fileId)}`,
    },
  },
}

export type FrontendRoutes = typeof routes.frontend
export type ApiRoutes = typeof routes.api
