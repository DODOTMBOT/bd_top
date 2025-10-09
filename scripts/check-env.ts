import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Загружаем .env.local явно
config({ path: resolve(process.cwd(), '.env.local') });

console.log('DATABASE_URL=', process.env.DATABASE_URL);
console.log('NEXTAUTH_URL=', process.env.NEXTAUTH_URL);
console.log('NEXTAUTH_SECRET=', process.env.NEXTAUTH_SECRET ? '<SET>' : '<MISSING>');