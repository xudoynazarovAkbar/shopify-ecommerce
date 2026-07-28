const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Load DATABASE_URL from environment variable first, falling back to .env file
  let databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('DATABASE_URL=')) {
          databaseUrl = trimmed.substring('DATABASE_URL='.length).replace(/^["']|["']$/g, '');
          break;
        }
      }
    }
  }

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment or .env');
    process.exit(1);
  }

  console.log('Using DATABASE_URL:', databaseUrl.replace(/:([^:@]+)@/, ':***@'));

  // Parse URL and append _test to the database name
  const url = new URL(databaseUrl);
  if (!url.pathname.endsWith('_test')) {
    url.pathname = url.pathname + '_test';
  }
  const testDatabaseUrl = url.toString();
  console.log('Targeting Test DATABASE_URL:', testDatabaseUrl);

  console.log('🔄 Setting up E2E test database schema...');
  
  // Execute prisma db push
  execSync('npx prisma db push', {
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
    },
    stdio: 'inherit',
  });

  console.log('🌱 Seeding E2E test database...');
  
  // Execute prisma db seed
  execSync('npx prisma db seed', {
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
    },
    stdio: 'inherit',
  });

  console.log('✅ E2E test database schema and seed data are ready!');
} catch (error) {
  console.error('❌ Failed to set up E2E test database:', error.message);
  process.exit(1);
}
