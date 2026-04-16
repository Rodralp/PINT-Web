import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectToDatabase, sequelize } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, '../../database/schema_postgresql.sql');

const normalizeSql = (sql) =>
  sql
    .split('\n')
    .map((line) => {
      const commentIndex = line.indexOf('--');
      return commentIndex >= 0 ? line.slice(0, commentIndex) : line;
    })
    .join('\n');

const splitStatements = (sql) =>
  normalizeSql(sql)
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);

const applySchema = async () => {
  const schemaSql = await readFile(schemaPath, 'utf8');
  const statements = splitStatements(schemaSql);

  await connectToDatabase();

  try {
    for (const statement of statements) {
      await sequelize.query(statement);
    }

    console.log(`Schema applied successfully with ${statements.length} statements.`);
  } finally {
    await sequelize.close();
  }
};

applySchema().catch((error) => {
  console.error('Failed to initialize schema:', error);
  globalThis.process?.exit(1);
});
