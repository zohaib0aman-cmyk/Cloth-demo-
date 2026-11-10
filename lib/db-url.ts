/**
 * Picks the PostgreSQL connection string. DATABASE_URL is used when it is a Postgres URL; otherwise the variables
 * that Vercel's Postgres integrations add (POSTGRES_URL, POSTGRES_PRISMA_URL) are tried.
 * Keep in sync with scripts/db-prepare.mjs.
 */
export function resolveDatabaseUrl(env: Record<string, string | undefined> = process.env): string | undefined {
  const isPg = (v?: string) => !!v && /^postgres(ql)?:\/\//i.test(v.trim());
  return [env.DATABASE_URL, env.POSTGRES_URL, env.POSTGRES_PRISMA_URL, env.POSTGRES_URL_NON_POOLING].find(isPg)?.trim();
}
