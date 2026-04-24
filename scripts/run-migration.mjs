import { readFileSync, readdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = resolve(__dirname, '../db/migrations');

const url = process.env.NEON_DATABASE_URL;
if (!url) {
  console.error('NEON_DATABASE_URL missing from .env');
  process.exit(1);
}

const sql = neon(url);

function splitStatements(source) {
  const cleaned = source
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
  return cleaned
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort();

for (const file of files) {
  const content = readFileSync(join(migrationsDir, file), 'utf8');
  const statements = splitStatements(content);
  console.log(`-- applying ${file} (${statements.length} statements) --`);
  for (const stmt of statements) {
    try {
      await sql.query(stmt);
    } catch (err) {
      console.error(`Failed on statement:\n${stmt}\n`);
      throw err;
    }
  }
  console.log(`✓ ${file} applied`);
}

console.log('\nAll migrations applied. Verifying schema:');
const tables = await sql`
  select table_name from information_schema.tables
  where table_schema = 'public' order by table_name
`;
console.log(tables.map((t) => t.table_name).join(', '));
