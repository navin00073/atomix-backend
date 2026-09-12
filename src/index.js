import dotenv from 'dotenv';
dotenv.config();

import { initDb } from './db.js';
import { createApp } from './app.js';

initDb();

const app = createApp();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`\n🏥 AtomiX Hospital Backend running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
