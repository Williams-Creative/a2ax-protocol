import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pool } from "./postgres.js";

export async function runMigrations(): Promise<void> {
  const migrationPath = resolve(process.cwd(), "src/db/migrations/001_init.sql");
  const sql = await readFile(migrationPath, "utf8");
  await pool.query(sql);
}
