import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const postgres = require("postgres");

const dbUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres.qgvklbzwwbzswpivvgsm:149162536Ti%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

async function main() {
  const sql = postgres(dbUrl, { prepare: false, ssl: { rejectUnauthorized: false } });
  console.log("⏳ Creating comments table if not exists...");
  
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "comments" (
      "id" SERIAL PRIMARY KEY,
      "id_movie" INTEGER REFERENCES "movies"("id") ON DELETE CASCADE,
      "id_episode" INTEGER REFERENCES "episodes"("id") ON DELETE SET NULL,
      "id_account" INTEGER REFERENCES "accounts"("id") ON DELETE SET NULL,
      "parent_id" INTEGER REFERENCES "comments"("id") ON DELETE CASCADE,
      "author_name" VARCHAR(255),
      "author_avatar" VARCHAR(500),
      "content" TEXT NOT NULL,
      "likes" INTEGER DEFAULT 0,
      "status" INTEGER DEFAULT 1,
      "created_at" TIMESTAMP DEFAULT NOW(),
      "updated_at" TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS "idx_comments_movie" ON "comments"("id_movie");
    CREATE INDEX IF NOT EXISTS "idx_comments_episode" ON "comments"("id_episode");
    CREATE INDEX IF NOT EXISTS "idx_comments_parent" ON "comments"("parent_id");
    CREATE INDEX IF NOT EXISTS "idx_comments_created_at" ON "comments"("created_at" DESC);
  `);

  console.log("✅ Comments table and indexes created successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Failed to create comments table:", err);
  process.exit(1);
});
