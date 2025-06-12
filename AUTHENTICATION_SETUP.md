# Authentication Setup Guide

This guide explains how to set up Google authentication using Auth.js (NextAuth.js) in the Sheet Ledger application.

## Overview

The authentication system includes:
- **Auth.js (NextAuth.js)** for authentication management
- **Google OAuth** as the authentication provider
- **Drizzle ORM** for database integration
- **Session management** with database storage
- **Route protection** with middleware
- **UI components** for sign-in/sign-out functionality
- **Automatic redirects** for unauthenticated users

## Prerequisites

1. **Google OAuth Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

2. **Database Setup**
   - Ensure your database is running (PostgreSQL or Neon)
   - The authentication tables have been created via migration

## Configuration Steps

### 1. Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.local.example .env.local
```

Update your `.env.local` file with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sheetledger"

# Authentication Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 2. Generate NEXTAUTH_SECRET

Generate a secure secret key:

```bash
openssl rand -base64 32
```

### 3. Google OAuth Setup

1. **Create Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

2. **Copy the credentials:**
   - Client ID → `GOOGLE_CLIENT_ID`
   - Client Secret → `GOOGLE_CLIENT_SECRET`

### 4. Database Migration

The authentication tables have been created. If you need to recreate them:

```bash
npm run db:generate
npm run db:push
```

## Features Implemented

### Route Protection

1. **Middleware** (`middleware.ts`) - Protects all routes automatically
2. **Server-side protection** - Using `requireAuth()` utility
3. **Client-side protection** - Using `useRequireAuth()` hook
4. **Automatic redirects** - Unauthenticated users → sign-in page
5. **Return URL handling** - Redirects back to original page after login

### Authentication Components

1. **SignInButton** - Google sign-in button with callback URL support
2. **SignInForm** - Enhanced form with loading states and error handling
3. **SignOutButton** - Sign-out functionality
4. **UserAvatar** - User profile picture display
5. **UserMenu** - Dropdown menu with user options
6. **ProtectedPage** - Client-side page wrapper for protection

### Pages

1. **Sign-in page** (`/auth/signin`) - Enhanced with branding and UX
2. **Error page** (`/auth/error`) - Authentication error handling
3. **Auth layout** - Dedicated layout for authentication pages

### Integration Points

1. **Header** - User menu in the top navigation
2. **Sidebar** - User info in the sidebar footer
3. **Session Provider** - Wraps the entire application
4. **Middleware** - Global route protection

## Usage

### Route Protection Methods

#### 1. Automatic Protection (Recommended)
All routes are automatically protected by middleware. No additional code needed.

#### 2. Server-side Protection
For server components, use the `requireAuth()` utility:

```typescript
import { requireAuth } from '@/lib/auth-utils'

export default async function ProtectedPage() {
  const session = await requireAuth() // Automatically redirects if not authenticated

  return <div>Hello {session.user?.name}</div>
}
```

#### 3. Client-side Protection
For client components, use the `useRequireAuth()` hook:

```typescript
'use client'

import { useRequireAuth } from '@/hooks/use-auth-guard'

export default function ProtectedClientPage() {
  const { session, isLoading } = useRequireAuth()

  if (isLoading) return <div>Loading...</div>

  return <div>Hello {session?.user?.name}</div>
}
```

#### 4. Manual Protection (Legacy)
For custom logic, use the `auth` function:

```typescript
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function CustomProtectedPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return <div>Protected content</div>
}
```

### Using Session in Client Components

```typescript
'use client'

import { useSession } from 'next-auth/react'

export function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Not authenticated</div>
  
  return <div>Hello {session.user?.name}</div>
}
```

### Using Session in Server Components

```typescript
import { auth } from '@/lib/auth'

export default async function MyServerComponent() {
  const session = await auth()
  
  return (
    <div>
      {session ? `Hello ${session.user?.name}` : 'Not authenticated'}
    </div>
  )
}
```

## Testing

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test authentication flow:**
   - Visit `http://localhost:3000`
   - Click the "Entrar com Google" button
   - Complete Google OAuth flow
   - Verify user info appears in header and sidebar

3. **Test sign-out:**
   - Click on user avatar in header
   - Select "Sair" from dropdown menu
   - Verify user is signed out

## Troubleshooting

### Common Issues

1. **"Configuration" error:**
   - Check that all environment variables are set
   - Verify Google OAuth credentials are correct

2. **"AccessDenied" error:**
   - Check Google OAuth redirect URIs
   - Ensure the email domain is allowed (if restricted)

3. **Database connection errors:**
   - Verify DATABASE_URL is correct
   - Ensure database is running
   - Check that auth tables exist

### Debug Mode

Enable debug mode by adding to `.env.local`:

```bash
NEXTAUTH_DEBUG=true
```

This will provide detailed logs in the console.

## Security Considerations

1. **NEXTAUTH_SECRET** - Keep this secret and unique per environment
2. **HTTPS in Production** - Always use HTTPS in production
3. **Environment Variables** - Never commit secrets to version control
4. **OAuth Redirect URIs** - Only add trusted domains

## Next Steps

- Add role-based access control
- Implement user profile management
- Add additional OAuth providers
- Set up email verification
- Configure session expiration policies
