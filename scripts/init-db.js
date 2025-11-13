#!/usr/bin/env node

/**
 * Script to initialize the database schema
 * This script connects directly to PostgreSQL and creates all tables
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  // Read connection string from .env
  require('dotenv').config();

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env file');
    process.exit(1);
  }

  console.log('🔄 Connecting to database...');

  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'prisma', 'init-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🔄 Creating database schema...');
    await client.query(sql);

    console.log('✅ Database schema created successfully!');
    console.log('\n📋 Next steps:');
    console.log('  1. Run: npm run db:seed');
    console.log('  2. Run: npm run dev');
    console.log('  3. Try to register at http://localhost:3000/inscription');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDatabase();
