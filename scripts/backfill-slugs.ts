import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
import postgres from "postgres";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ DATABASE_URL is not set.");
  process.exit(1);
}

function slugify(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function main() {
  const sql = postgres(dbUrl as string, { prepare: false, ssl: { rejectUnauthorized: false } });
  console.log("⏳ Adding 'slug' column to tables if not exist...");

  const tables = [
    "authors",
    "plans",
    "movies",
    "categories",
    "characters",
    "actors",
    "episodes",
    "ai_galleries",
    "collections",
  ];

  for (const table of tables) {
    await sql.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS slug VARCHAR(255);`);
    console.log(`  - Table ${table}: 'slug' column verified/added.`);
  }

  console.log("\n⏳ Backfilling slugs for existing records...");

  for (const table of tables) {
    const rows = await sql.query(`SELECT id, name, slug FROM "${table}"`);
    console.log(`\nProcessing table '${table}' (${rows.length} rows total)...`);

    const usedSlugs = new Set<string>();
    for (const r of rows) {
      if (r.slug && r.slug.trim()) {
        usedSlugs.add(r.slug.trim());
      }
    }

    const toUpdate: { id: number; slug: string }[] = [];
    for (const r of rows) {
      if (!r.slug || !r.slug.trim()) {
        const rawName = r.name || `${table}-${r.id}`;
        let baseSlug = slugify(rawName) || `${table}-${r.id}`;
        let finalSlug = baseSlug;
        let counter = 1;

        while (usedSlugs.has(finalSlug)) {
          finalSlug = `${baseSlug}-${counter}`;
          counter++;
        }

        usedSlugs.add(finalSlug);
        toUpdate.push({ id: r.id, slug: finalSlug });
      }
    }

    if (toUpdate.length === 0) {
      console.log(`  ✅ Table '${table}': all rows already have slugs.`);
      continue;
    }

    console.log(`  Updating ${toUpdate.length} rows in parallel batches...`);
    const chunkSize = 25;
    for (let i = 0; i < toUpdate.length; i += chunkSize) {
      const chunk = toUpdate.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map((item) =>
          sql.query(`UPDATE "${table}" SET slug = $1 WHERE id = $2`, [item.slug, item.id])
        )
      );
    }

    console.log(`  ✅ Table '${table}': successfully updated ${toUpdate.length} rows.`);
  }

  console.log("\n🎉 Slug migration & backfill complete!");
}

main().catch(console.error);
