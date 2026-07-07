require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const SQL_DIR = path.join(__dirname, '..', 'sql');

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase database');

    const sqlFiles = fs
      .readdirSync(SQL_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort(); // sort by filename (0_, 1_, 2_, ...)

    for (const file of sqlFiles) {
      const filePath = path.join(SQL_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`⏳ Running: ${file}`);
      await client.query(sql);
      console.log(`✔  Done:    ${file}`);
    }

    console.log('\n🎉 Migration completed successfully!');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
