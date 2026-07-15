/**
 * Seed script: npx tsx lib/db/seed.ts
 * Imports static mock movie data into Neon PostgreSQL via Drizzle ORM.
 */
import "dotenv/config";
import { db } from "./index";
import {
  authors,
  categories,
  movies,
  movieCategory,
  actors,
  episodesActor,
  episodesCharacter,
  episodes,
  plans,
  features,
} from "./schema";
import { staticMovies } from "../data/seed-data";

async function seed() {
  if (!db) {
    console.error("❌ DATABASE_URL is not set. Cannot seed.");
    process.exit(1);
  }

  console.log("🌱 Wiping existing database data...");
  await db.delete(movieCategory);
  await db.delete(episodesActor);
  await db.delete(episodesCharacter);
  await db.delete(episodes);
  await db.delete(movies);
  await db.delete(categories);
  await db.delete(actors);
  await db.delete(features);
  await db.delete(plans);
  await db.delete(authors);

  console.log("🌱 Starting database seed…");

  // 1. Insert default plans
  const planRows = await db
    .insert(plans)
    .values([
      { level: 0, priceMonth: "0.00", name: "Miễn Phí", status: 1 },
      { level: 1, priceMonth: "49000.00", name: "VIP", status: 1 },
      { level: 2, priceMonth: "99000.00", name: "VIP+", status: 1 },
    ])
    .onConflictDoNothing()
    .returning({ id: plans.id, level: plans.level });

  const freePlanId = planRows.find((p) => p.level === 0)?.id ?? 1;

  // 2. Insert plan features
  await db
    .insert(features)
    .values([
      { idPlan: freePlanId, name: "Xem phim miễn phí", available: true },
      { idPlan: freePlanId, name: "Chất lượng HD", available: true },
      { idPlan: freePlanId, name: "Không quảng cáo", available: false },
    ])
    .onConflictDoNothing();

  // 3. Insert unique categories
  const uniqueCategories = Array.from(
    new Set(staticMovies.map((m) => m.category))
  );

  const catRows = await db
    .insert(categories)
    .values(
      uniqueCategories.map((cat) => ({
        name: cat,
        description: `Danh mục phim ${cat}`,
        status: 1,
      }))
    )
    .onConflictDoNothing()
    .returning({ id: categories.id, name: categories.name });

  const catMap = Object.fromEntries(catRows.map((c) => [c.name, c.id]));

  // 4. Insert a default author
  const [authorRow] = await db
    .insert(authors)
    .values({ name: "Vam3D Official", description: "Biên tập viên chính thức", status: 1 })
    .onConflictDoNothing()
    .returning({ id: authors.id });

  const defaultAuthorId = authorRow?.id ?? 1;

  // Helper function to parse duration strings like "166 phút" or "9 tập" to integers
  function parseDuration(durationStr: string): number {
    const match = durationStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  // 5. Insert movies
  const movieValues = staticMovies.map((m) => ({
    name: m.title,
    description: m.description,
    idAuthor: defaultAuthorId,
    imgUrl: m.thumbnail,
    bannerUrl: m.banner,
    idPlan: freePlanId,
    status: 1,
  }));

  const insertedMovies = await db
    .insert(movies)
    .values(movieValues)
    .returning({ id: movies.id, name: movies.name });

  // Map static movie string IDs to generated database integer IDs
  const movieMap = new Map<string, number>();
  for (const m of staticMovies) {
    const matched = insertedMovies.find((row) => row.name === m.title);
    if (matched) {
      movieMap.set(m.id, matched.id);
    } else {
      console.warn(`⚠️ Could not map static movie title "${m.title}" to database ID`);
    }
  }

  // 6. Insert movieCategory junction rows
  const mcValues: { idCategory: number; idMovie: number }[] = [];
  for (const m of staticMovies) {
    const catId = catMap[m.category];
    const movieId = movieMap.get(m.id);
    if (catId && movieId) {
      mcValues.push({ idCategory: catId, idMovie: movieId });
    }
  }
  if (mcValues.length > 0)
    await db.insert(movieCategory).values(mcValues).onConflictDoNothing();

  // 7. Insert actors & movieActor junction
  const actorNames = Array.from(
    new Set(staticMovies.flatMap((m) => m.cast))
  );

  const actorRows = await db
    .insert(actors)
    .values(actorNames.map((name) => ({ name, status: 1 })))
    .onConflictDoNothing()
    .returning({ id: actors.id, name: actors.name });

  const actorMap = Object.fromEntries(actorRows.map((a) => [a.name, a.id]));

  // 7. Insert episodes
  const epValues: {
    name: string;
    url: string;
    idMovie: number;
    status: number;
    views: number;
  }[] = [];

  for (const m of staticMovies) {
    const movieId = movieMap.get(m.id);
    if (!movieId) continue;

    if (m.episodes && m.episodes.length > 0) {
      m.episodes.forEach((ep, idx) => {
        epValues.push({
          name: ep.name || `Tập ${idx + 1}`,
          url: ep.url,
          idMovie: movieId,
          status: 1,
          views: Math.floor(Math.random() * 500),
        });
      });
    } else {
      // Single-episode movies (films)
      epValues.push({
        name: "Tập 1",
        url: m.videoUrl,
        idMovie: movieId,
        status: 1,
        views: Math.floor(Math.random() * 1000),
      });
    }
  }

  let insertedEpisodes: any[] = [];
  if (epValues.length > 0) {
    insertedEpisodes = await db
      .insert(episodes)
      .values(epValues)
      .onConflictDoNothing()
      .returning({ id: episodes.id, idMovie: episodes.idMovie });
  }

  // 8. Insert episodesActor junction rows
  const eaValues: { idActor: number; idEpisodes: number }[] = [];
  for (const ep of insertedEpisodes) {
    const staticMovie = staticMovies.find((sm) => movieMap.get(sm.id) === ep.idMovie);
    if (!staticMovie) continue;

    for (const castName of staticMovie.cast) {
      const actorId = actorMap[castName];
      if (actorId) {
        eaValues.push({ idActor: actorId, idEpisodes: ep.id });
      }
    }
  }
  if (eaValues.length > 0) {
    await db.insert(episodesActor).values(eaValues).onConflictDoNothing();
  }

  console.log("✅ Seed completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
