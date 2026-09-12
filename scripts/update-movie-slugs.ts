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
  
  console.log("⏳ Checking 'slug' column in movies table...");
  await sql.unsafe(`ALTER TABLE "movies" ADD COLUMN IF NOT EXISTS slug VARCHAR(255);`);

  console.log("⏳ Fetching all movies from database...");
  const movies = await sql.unsafe(`SELECT id, name, slug, status FROM "movies" ORDER BY id ASC`);
  console.log(`Found ${movies.length} movies.`);

  const usedSlugs = new Set<string>();
  const toUpdate: { id: number; name: string; oldSlug: string | null; newSlug: string }[] = [];

  for (const m of movies) {
    let baseSlug = slugify(m.name) || `movie-${m.id}`;
    let finalSlug = baseSlug;
    let counter = 1;

    while (usedSlugs.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    usedSlugs.add(finalSlug);

    if (!m.slug || m.slug.trim() !== finalSlug) {
      toUpdate.push({
        id: m.id,
        name: m.name,
        oldSlug: m.slug,
        newSlug: finalSlug,
      });
    }
  }

  console.log(`\nFound ${toUpdate.length} movies that need slug update / assignment.`);
  
  for (const item of toUpdate.slice(0, 10)) {
    console.log(`  - [ID ${item.id}] "${item.name}": '${item.oldSlug || "NULL"}' -> '${item.newSlug}'`);
  }
  if (toUpdate.length > 10) {
    console.log(`  ... and ${toUpdate.length - 10} more.`);
  }

  if (toUpdate.length > 0) {
    console.log(`\n⏳ Updating ${toUpdate.length} movie slugs in database...`);
    const chunkSize = 25;
    for (let i = 0; i < toUpdate.length; i += chunkSize) {
      const chunk = toUpdate.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map((item) =>
          sql.unsafe(`UPDATE "movies" SET slug = $1 WHERE id = $2`, [item.newSlug, item.id])
        )
      );
    }
    console.log(`✅ Successfully updated ${toUpdate.length} movie slugs!`);
  } else {
    console.log(`✅ All movies already have accurate unique slugs.`);
  }

  // Verify
  const sample = await sql.unsafe(`SELECT id, name, slug FROM "movies" LIMIT 10`);
  console.log("\nSample movie records after update:");
  console.table(sample);

  // Check if any movie still has null slug
  const nullSlugs = await sql.unsafe(`SELECT COUNT(*) as count FROM "movies" WHERE slug IS NULL OR slug = ''`);
  console.log(`\nMovies with NULL or empty slug: ${nullSlugs[0].count}`);

  await sql.end();
}

main().catch((err) => {
  console.error("Error in update-movie-slugs:", err);
  process.exit(1);
});
