# Authentication Setup Guide

This guide explains how to set up Google authentication using Auth.js (NextAuth.js) in the Sheet Ledger application.

## Overview

The authentication system includes:
- **Auth.js (NextAuth.js)** for authentication management
- **Google OAuth** as the authentication provider
- **Drizzle ORM** for database integration
- **Session management** with database storage
- **UI components** for sign-in/sign-out functionality

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

### Authentication Components

1. **SignInButton** - Google sign-in button
2. **SignOutButton** - Sign-out functionality
3. **UserAvatar** - User profile picture display
4. **UserMenu** - Dropdown menu with user options

### Pages

1. **Sign-in page** (`/auth/signin`) - Custom sign-in page
2. **Error page** (`/auth/error`) - Authentication error handling

### Integration Points

1. **Header** - User menu in the top navigation
2. **Sidebar** - User info in the sidebar footer
3. **Session Provider** - Wraps the entire application

## Usage

### Protecting Routes

To protect routes, use the `auth` function:

```typescript
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
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
