#!/usr/bin/env node
/**
 * Prepares the database before dev/build: generates the Prisma client, creates the tables and loads the sample
 * store if the database is empty.   node scripts/db-prepare.mjs [--reset]
 */
import { spawnSync } from "child_process";

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile?.(file);
  } catch {
    // file not present
  }
}

// Keep in sync with lib/db-url.ts
const isPg = (v) => !!v && /^postgres(ql)?:\/\//i.test(v.trim());
const url = [process.env.DATABASE_URL, process.env.POSTGRES_URL, process.env.POSTGRES_PRISMA_URL, process.env.POSTGRES_URL_NON_POOLING].find(isPg)?.trim();

if (!url) {
  console.error(
    "\nNo PostgreSQL connection string found.\nSet DATABASE_URL to a postgres:// URL (see .env.example). On Vercel, add a Postgres database from the Storage tab and redeploy.\n",
  );
  process.exit(1);
}

const env = { ...process.env, DATABASE_URL: url };
const reset = process.argv.includes("--reset");
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { stdio: "inherit", env, shell: process.platform === "win32" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

run("npx", ["prisma", "generate"]);
run("npx", ["prisma", "db", "push", "--skip-generate", ...(reset ? ["--force-reset"] : [])]);
run("npx", ["tsx", "prisma/seed.ts", ...(reset ? [] : ["--if-empty"])]);
