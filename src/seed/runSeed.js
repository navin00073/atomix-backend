import dotenv from 'dotenv';
dotenv.config();

import { initDb } from '../db.js';

console.log('Initializing schema and seeding database (safe to re-run: skips tables that already have data)...');
initDb();
console.log('Done.');
