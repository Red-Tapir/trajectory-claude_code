#!/usr/bin/env tsx
/**
 * Environment Variables Validation Script
 *
 * This script validates that all required environment variables are set
 * and provides helpful error messages for missing or invalid values.
 *
 * Usage: npm run check-env
 */

import * as fs from 'fs'
import * as path from 'path'

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

// Required environment variables
const REQUIRED_VARS = [
  {
    name: 'DATABASE_URL',
    description: 'PostgreSQL connection string',
    validation: (val: string) => val.startsWith('postgresql://') || val.startsWith('file:'),
    example: 'postgresql://user:password@host:5432/dbname',
  },
  {
    name: 'NEXTAUTH_URL',
    description: 'Application URL for NextAuth',
    validation: (val: string) => val.startsWith('http://') || val.startsWith('https://'),
    example: 'https://trajectory.app',
  },
  {
    name: 'NEXTAUTH_SECRET',
    description: 'Secret key for NextAuth JWT signing',
    validation: (val: string) => val.length >= 32,
    example: 'Generate with: openssl rand -base64 32',
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    description: 'Public application URL',
    validation: (val: string) => val.startsWith('http://') || val.startsWith('https://'),
    example: 'https://trajectory.app',
  },
]

// Optional but recommended for production
const RECOMMENDED_VARS = [
  {
    name: 'RESEND_API_KEY',
    description: 'Resend API key for transactional emails',
    docs: 'https://resend.com/api-keys',
  },
  {
    name: 'UPSTASH_REDIS_REST_URL',
    description: 'Upstash Redis URL for rate limiting',
    docs: 'https://console.upstash.com/redis',
  },
  {
    name: 'UPSTASH_REDIS_REST_TOKEN',
    description: 'Upstash Redis token',
    docs: 'https://console.upstash.com/redis',
  },
  {
    name: 'NEXT_PUBLIC_SENTRY_DSN',
    description: 'Sentry DSN for error monitoring',
    docs: 'https://sentry.io/',
  },
  {
    name: 'STRIPE_SECRET_KEY',
    description: 'Stripe secret key for payments',
    docs: 'https://dashboard.stripe.com/apikeys',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    description: 'Stripe webhook signing secret',
    docs: 'https://dashboard.stripe.com/webhooks',
  },
]

// Optional OAuth providers
const OPTIONAL_VARS = [
  {
    name: 'GOOGLE_CLIENT_ID',
    description: 'Google OAuth client ID',
    docs: 'https://console.cloud.google.com/apis/credentials',
  },
  {
    name: 'GOOGLE_CLIENT_SECRET',
    description: 'Google OAuth client secret',
    docs: 'https://console.cloud.google.com/apis/credentials',
  },
  {
    name: 'GITHUB_ID',
    description: 'GitHub OAuth app ID',
    docs: 'https://github.com/settings/developers',
  },
  {
    name: 'GITHUB_SECRET',
    description: 'GitHub OAuth app secret',
    docs: 'https://github.com/settings/developers',
  },
]

interface ValidationResult {
  name: string
  present: boolean
  valid: boolean
  message?: string
}

function checkEnvVar(envVar: typeof REQUIRED_VARS[0]): ValidationResult {
  const value = process.env[envVar.name]

  if (!value) {
    return {
      name: envVar.name,
      present: false,
      valid: false,
      message: `Missing required variable: ${envVar.description}`,
    }
  }

  if (envVar.validation && !envVar.validation(value)) {
    return {
      name: envVar.name,
      present: true,
      valid: false,
      message: `Invalid format. Example: ${envVar.example}`,
    }
  }

  return {
    name: envVar.name,
    present: true,
    valid: true,
  }
}

function checkRecommendedVar(envVar: typeof RECOMMENDED_VARS[0]): ValidationResult {
  const value = process.env[envVar.name]

  return {
    name: envVar.name,
    present: !!value,
    valid: true,
    message: value ? undefined : `${envVar.description} - ${envVar.docs}`,
  }
}

function main() {
  console.log(`${colors.cyan}╔═══════════════════════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.cyan}║       Trajectory Environment Variables Check        ║${colors.reset}`)
  console.log(`${colors.cyan}╚═══════════════════════════════════════════════════════╝${colors.reset}\n`)

  // Check if .env file exists
  const envPath = path.join(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) {
    console.log(`${colors.yellow}⚠️  Warning: .env file not found${colors.reset}`)
    console.log(`   Create one by copying .env.example: cp .env.example .env\n`)
  }

  let hasErrors = false
  let missingRecommended: string[] = []

  // Check required variables
  console.log(`${colors.blue}📋 Required Variables:${colors.reset}\n`)

  for (const envVar of REQUIRED_VARS) {
    const result = checkEnvVar(envVar)

    if (result.valid) {
      console.log(`${colors.green}✓${colors.reset} ${result.name}`)
    } else {
      hasErrors = true
      console.log(`${colors.red}✗${colors.reset} ${result.name}`)
      console.log(`  ${colors.red}${result.message}${colors.reset}`)
      if (envVar.example) {
        console.log(`  ${colors.yellow}Example: ${envVar.example}${colors.reset}`)
      }
    }
  }

  // Check recommended variables
  console.log(`\n${colors.blue}🔧 Recommended Variables (for production):${colors.reset}\n`)

  for (const envVar of RECOMMENDED_VARS) {
    const result = checkRecommendedVar(envVar)

    if (result.present) {
      console.log(`${colors.green}✓${colors.reset} ${result.name}`)
    } else {
      missingRecommended.push(result.name)
      console.log(`${colors.yellow}⚠${colors.reset} ${result.name}`)
      console.log(`  ${colors.yellow}${result.message}${colors.reset}`)
    }
  }

  // Check optional variables
  console.log(`\n${colors.blue}🔐 Optional OAuth Variables:${colors.reset}\n`)

  const oauthConfigured = OPTIONAL_VARS.map(envVar => ({
    name: envVar.name,
    present: !!process.env[envVar.name],
  }))

  const googleConfigured = oauthConfigured.filter(v => v.name.includes('GOOGLE')).every(v => v.present)
  const githubConfigured = oauthConfigured.filter(v => v.name.includes('GITHUB')).every(v => v.present)

  console.log(`  Google OAuth: ${googleConfigured ? `${colors.green}Configured${colors.reset}` : `${colors.yellow}Not configured${colors.reset}`}`)
  console.log(`  GitHub OAuth: ${githubConfigured ? `${colors.green}Configured${colors.reset}` : `${colors.yellow}Not configured${colors.reset}`}`)

  // Security checks
  console.log(`\n${colors.blue}🔒 Security Checks:${colors.reset}\n`)

  const nextAuthSecret = process.env.NEXTAUTH_SECRET
  if (nextAuthSecret) {
    if (nextAuthSecret.includes('your-secret-key') || nextAuthSecret.includes('change')) {
      console.log(`${colors.red}✗${colors.reset} NEXTAUTH_SECRET appears to be a default value`)
      console.log(`  ${colors.red}⚠️  CRITICAL: Generate a secure secret with: openssl rand -base64 32${colors.reset}`)
      hasErrors = true
    } else if (nextAuthSecret.length < 32) {
      console.log(`${colors.red}✗${colors.reset} NEXTAUTH_SECRET is too short (must be at least 32 characters)`)
      hasErrors = true
    } else {
      console.log(`${colors.green}✓${colors.reset} NEXTAUTH_SECRET is properly configured`)
    }
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (stripeKey) {
    const isTestMode = stripeKey.startsWith('sk_test_')
    const isLiveMode = stripeKey.startsWith('sk_live_')
    const nodeEnv = process.env.NODE_ENV

    if (isTestMode) {
      console.log(`${colors.yellow}⚠${colors.reset} Stripe is in TEST mode`)
      if (nodeEnv === 'production') {
        console.log(`  ${colors.yellow}⚠️  Warning: Using test keys in production${colors.reset}`)
      }
    } else if (isLiveMode) {
      console.log(`${colors.green}✓${colors.reset} Stripe is in LIVE mode`)
      if (nodeEnv !== 'production') {
        console.log(`  ${colors.yellow}⚠️  Warning: Using live keys in development${colors.reset}`)
      }
    } else {
      console.log(`${colors.red}✗${colors.reset} Stripe key format is invalid`)
      hasErrors = true
    }
  }

  // Summary
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`)

  if (hasErrors) {
    console.log(`${colors.red}❌ Validation Failed${colors.reset}`)
    console.log(`   Fix the errors above before running the application.\n`)
    process.exit(1)
  } else if (missingRecommended.length > 0) {
    console.log(`${colors.yellow}⚠️  Warnings Present${colors.reset}`)
    console.log(`   ${missingRecommended.length} recommended variables are missing.`)
    console.log(`   The app will run but some features may be limited.\n`)
    process.exit(0)
  } else {
    console.log(`${colors.green}✅ All Checks Passed${colors.reset}`)
    console.log(`   Your environment is properly configured!\n`)
    process.exit(0)
  }
}

// Run the validation
main()
