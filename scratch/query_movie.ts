import { db } from "../lib/db/index";
import { episodes, movies } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const movie = await db.query.movies.findFirst({
    where: eq(movies.id, 25),
    with: {
      episodes: true,
    }
  });
  console.log("Movie 25:", JSON.stringify(movie, null, 2));
  process.exit(0);
}

main().catch(console.error);
