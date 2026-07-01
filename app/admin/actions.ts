"use server";
import { getCurrentUser } from "@/lib/auth/actions";

async function verifyAdmin() {
  // Admin check bypassed by user request
}


import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

function revalidateAdmin() {
  revalidateTag("admin-data", "default");
}
import { db, schema } from "@/lib/db";
import { eq, and, ne, sql } from "drizzle-orm";
import crypto from "crypto";

// ─────────────────────────────────────────────────────────────────
// MOVIES
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminMovies = unstable_cache(
  async () => {
    if (!db) return [];
  const result = await db.query.movies.findMany({
    orderBy: (m, { desc }) => [desc(m.id)],
    with: {
      movieCategories: { with: { category: true } },
      author: true,
      episodes: {
        orderBy: (ep, { asc }) => [asc(ep.id)],
        with: {
          episodesActors: { with: { actor: true } },
          episodesCharacters: { with: { character: true } },
        }
      },
    },
  });

  return result.map(m => {
    const uniqueActors = new Map<number, any>();
    const uniqueCharacters = new Map<number, any>();
    m.episodes?.forEach(ep => {
      ep.episodesActors?.forEach((ea: any) => {
        if (ea.actor) uniqueActors.set(ea.actor.id, ea.actor);
      });
      ep.episodesCharacters?.forEach((ec: any) => {
        if (ec.character) uniqueCharacters.set(ec.character.id, ec.character);
      });
    });
    return {
      ...m,
      movieActors: Array.from(uniqueActors.values()).map(actor => ({ actor })),
      movieCharacters: Array.from(uniqueCharacters.values()).map(character => ({ character }))
    };
  });
  },
  ["admin-movies"],
  { revalidate: 3600, tags: ["admin-data", "admin-movies", "movies"] }
);

export async function getAdminMovies() {
  await verifyAdmin();
  return getCached_getAdminMovies();
}

export async function createMovie(data: {
  name: string;
  description?: string;
  imgUrl?: string;
  idAuthor?: number | null;
  categoryIds?: number[];
}) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");

  const { categoryIds = [], idAuthor, ...movieData } = data;

  const [inserted] = await db.insert(schema.movies).values({
    ...movieData,
    idAuthor: idAuthor || null,
    status: 1,
  }).returning({ id: schema.movies.id });

  if (!inserted) throw new Error("Failed to create movie");

  const movieId = inserted.id;

  // Insert category junctions
  if (categoryIds.length > 0) {
    await db.insert(schema.movieCategory).values(
      categoryIds.map((cid) => ({ idCategory: cid, idMovie: movieId }))
    );
  }

  revalidateAdmin();
}

export async function updateMovie(
  id: number,
  data: {
    name?: string;
    description?: string;
    imgUrl?: string;
    status?: number;
    idAuthor?: number | null;
    categoryIds?: number[];
  }
) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");

  let oldImgUrl: string | null = null;

  if (data.imgUrl !== undefined) {
    const movie = await db.query.movies.findFirst({
      where: eq(schema.movies.id, id),
      columns: { imgUrl: true }
    });
    if (movie) {
      oldImgUrl = movie.imgUrl || null;
    }
  }

  const { categoryIds, idAuthor, ...movieData } = data;

  await db
    .update(schema.movies)
    .set({
      ...movieData,
      ...(idAuthor !== undefined && { idAuthor: idAuthor || null }),
    })
    .where(eq(schema.movies.id, id));

  if (categoryIds !== undefined) {
    await db.delete(schema.movieCategory).where(eq(schema.movieCategory.idMovie, id));
    if (categoryIds.length > 0) {
      await db.insert(schema.movieCategory).values(
        categoryIds.map((cid) => ({ idCategory: cid, idMovie: id }))
      );
    }
  }

  if (oldImgUrl && data.imgUrl !== undefined && data.imgUrl !== oldImgUrl) {
    await deleteBunnyAsset(oldImgUrl);
  }

  revalidateAdmin();
}

export async function deleteMovie(id: number) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");

  const movie = await db.query.movies.findFirst({
    where: eq(schema.movies.id, id),
    columns: { imgUrl: true }
  });

  await db.delete(schema.movies).where(eq(schema.movies.id, id));

  if (movie?.imgUrl) {
    await deleteBunnyAsset(movie.imgUrl);
  }

  revalidateAdmin();
}

// ─────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminCategories = unstable_cache(
  async () => {
    if (!db) return [];
  return db.query.categories.findMany({ orderBy: (c, { asc }) => [asc(c.id)] });
  },
  ["admin-categories"],
  { revalidate: 3600, tags: ["admin-data", "admin-categories", "categories"] }
);

export async function getAdminCategories() {
  await verifyAdmin();
  return getCached_getAdminCategories();
}

export async function createCategory(data: {
  name: string;
  description?: string;
}) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.categories).values({ ...data, status: 1 });
  revalidateAdmin();
}

export async function updateCategory(
  id: number,
  data: { name?: string; description?: string; status?: number }
) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.update(schema.categories).set(data).where(eq(schema.categories.id, id));
  revalidateAdmin();
}

export async function deleteCategory(id: number) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.delete(schema.categories).where(eq(schema.categories.id, id));
  revalidateAdmin();
}

// ─────────────────────────────────────────────────────────────────
// EPISODES
// ─────────────────────────────────────────────────────────────────

export async function syncProcessingEpisodes() {
  await verifyAdmin();
  if (!db) return;
  try {
    const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
    const apiKey = process.env.BUNNY_API_KEY;
    if (!libraryId || !apiKey) return;

    // Find all episodes in DB where bunnyVideoId is not null and bunnyStatus is not 'completed'
    const eps = await db.query.episodes.findMany({
      where: (ep, { and, isNotNull }) => and(
        isNotNull(ep.bunnyVideoId),
        ne(ep.bunnyStatus, "completed")
      )
    });

    if (eps.length === 0) return;

    let updated = false;
    for (const ep of eps) {
      if (!ep.bunnyVideoId) continue;
      const res = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${ep.bunnyVideoId}`, {
        method: "GET",
        headers: {
          AccessKey: apiKey,
          accept: "application/json"
        }
      });
      if (res.ok) {
        const data = await res.json();
        let newStatus = ep.bunnyStatus || "processing";
        if (data.status === 3 || data.status === 4) {
          newStatus = "completed";
        } else if (data.status === 5 || data.status === 8) {
          newStatus = "failed";
        } else if (data.status === 6 || data.status === 7) {
          newStatus = "uploading";
        } else if (data.status === 0 || data.status === 1 || data.status === 2) {
          newStatus = "processing";
        }

        if (newStatus !== ep.bunnyStatus) {
          await db.update(schema.episodes)
            .set({ bunnyStatus: newStatus })
            .where(eq(schema.episodes.id, ep.id));
          updated = true;
        }
      }
    }

    if (updated) {
      revalidateAdmin();
      revalidateTag("movies", "default");
    }
  } catch (err) {
    console.error("Error syncing processing episodes:", err);
  }
}

const getCachedAdminEpisodes = unstable_cache(
  async (movieId?: number) => {
    if (!db) return [];
    if (movieId) {
      return db.query.episodes.findMany({
        where: (ep, { eq }) => eq(ep.idMovie, movieId),
        orderBy: (ep, { asc }) => [asc(ep.id)],
        with: {
          episodesActors: { columns: { idActor: true } },
          episodesCharacters: { columns: { idCharacter: true } },
        }
      });
    }
    return db.query.episodes.findMany({
      orderBy: (ep, { asc }) => [asc(ep.id)],
      with: {
        movie: { columns: { id: true, name: true } },
        episodesActors: { columns: { idActor: true } },
        episodesCharacters: { columns: { idCharacter: true } },
      },
    });
  },
  ["admin-episodes"],
  { revalidate: 3600, tags: ["admin-data", "admin-episodes", "episodes"] }
);

export async function getAdminEpisodes(movieId?: number) {
  await verifyAdmin();
  if (!db) return [];
  await syncProcessingEpisodes();
  return getCachedAdminEpisodes(movieId);
}

export async function createEpisode(data: {
  name?: string;
  banner?: string;
  url?: string;
  idMovie: number;
  idPlan?: number | null;
  duration?: number;
  bunnyVideoId?: string;
  bunnyStatus?: string;
  actorIds?: number[];
  characterIds?: number[];
}) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  const { actorIds = [], characterIds = [], ...episodeData } = data;

  const [inserted] = await db.insert(schema.episodes).values({
    ...episodeData,
    status: 1,
    views: 0
  }).returning({ id: schema.episodes.id });

  if (!inserted) throw new Error("Failed to create episode");
  const episodeId = inserted.id;

  if (actorIds.length > 0) {
    await db.insert(schema.episodesActor).values(
      actorIds.map((aid) => ({ idActor: aid, idEpisodes: episodeId }))
    );
  }

  if (characterIds.length > 0) {
    await db.insert(schema.episodesCharacter).values(
      characterIds.map((cid) => ({ idCharacter: cid, idEpisodes: episodeId }))
    );
  }

  revalidateAdmin();
}

export async function updateEpisode(
  id: number,
  data: {
    name?: string;
    banner?: string;
    url?: string;
    status?: number;
    idPlan?: number | null;
    duration?: number;
    bunnyVideoId?: string;
    bunnyStatus?: string;
    actorIds?: number[];
    characterIds?: number[];
  }
) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  const { actorIds, characterIds, ...episodeData } = data;

  // If a new bunnyVideoId is uploaded/provided, delete the old one from Bunny Stream to avoid wasting storage
  if (data.bunnyVideoId !== undefined) {
    try {
      const existing = await db.query.episodes.findFirst({
        where: (ep, { eq }) => eq(ep.id, id),
        columns: { bunnyVideoId: true }
      });
      if (existing && existing.bunnyVideoId && existing.bunnyVideoId !== data.bunnyVideoId) {
        deleteBunnyVideo(existing.bunnyVideoId).catch(err => {
          console.error("Failed to delete old Bunny video on update:", err);
        });
      }
    } catch (err) {
      console.error("Failed to query existing episode for video deletion:", err);
    }
  }

  await db.update(schema.episodes).set(episodeData).where(eq(schema.episodes.id, id));

  if (actorIds !== undefined) {
    await db.delete(schema.episodesActor).where(eq(schema.episodesActor.idEpisodes, id));
    if (actorIds.length > 0) {
      await db.insert(schema.episodesActor).values(
        actorIds.map((aid) => ({ idActor: aid, idEpisodes: id }))
      );
    }
  }

  if (characterIds !== undefined) {
    await db.delete(schema.episodesCharacter).where(eq(schema.episodesCharacter.idEpisodes, id));
    if (characterIds.length > 0) {
      await db.insert(schema.episodesCharacter).values(
        characterIds.map((cid) => ({ idCharacter: cid, idEpisodes: id }))
      );
    }
  }

  revalidateAdmin();
}

export async function deleteBunnyVideo(videoId: string) {
  await verifyAdmin();
  const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  const apiKey = process.env.BUNNY_API_KEY;
  if (!libraryId || !apiKey) {
    console.warn("Bunny Stream credentials missing, cannot delete video.");
    return false;
  }

  try {
    const res = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
      method: "DELETE",
      headers: {
        "AccessKey": apiKey,
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Failed to delete video ${videoId} from Bunny Stream:`, errText);
      return false;
    }

    console.log(`Successfully deleted video ${videoId} from Bunny Stream`);
    return true;
  } catch (err) {
    console.error(`Error deleting video ${videoId} from Bunny Stream:`, err);
    return false;
  }
}

export async function prepareBunnyUpload(title: string) {
  await verifyAdmin();
  const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  const apiKey = process.env.BUNNY_API_KEY;
  if (!libraryId || !apiKey) {
    throw new Error("Bunny Stream credentials (NEXT_PUBLIC_BUNNY_LIBRARY_ID / BUNNY_API_KEY) are missing in environment variables.");
  }

  // 1. Create a video placeholder on Bunny Stream
  const res = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
    method: "POST",
    headers: {
      "AccessKey": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create video on Bunny Stream: ${errText}`);
  }

  const data = await res.json();
  const videoId = data.guid; // guid is the videoId

  // 2. Generate TUS signature
  const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour expiration
  const signatureText = libraryId + apiKey + expirationTime + videoId;
  const signature = crypto.createHash("sha256").update(signatureText).digest("hex");

  return {
    libraryId,
    videoId,
    signature,
    expirationTime,
  };
}

export async function deleteEpisode(id: number) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");

  try {
    const existing = await db.query.episodes.findFirst({
      where: (ep, { eq }) => eq(ep.id, id),
      columns: { bunnyVideoId: true }
    });
    if (existing && existing.bunnyVideoId) {
      deleteBunnyVideo(existing.bunnyVideoId).catch(err => {
        console.error("Failed to delete Bunny video on episode deletion:", err);
      });
    }
  } catch (err) {
    console.error("Failed to query episode before deletion:", err);
  }

  await db.delete(schema.episodes).where(eq(schema.episodes.id, id));
  revalidateAdmin();
}

// ─────────────────────────────────────────────────────────────────
// ACTORS
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminActors = unstable_cache(
  async () => {
    if (!db) return [];
  return db.query.actors.findMany({ orderBy: (a, { asc }) => [asc(a.name)] });
  },
  ["admin-actors"],
  { revalidate: 3600, tags: ["admin-data", "admin-actors", "actors"] }
);

export async function getAdminActors() {
  await verifyAdmin();
  return getCached_getAdminActors();
}

export async function createActor(data: {
  name: string;
  imgUrl?: string;
  description?: string;
}) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.actors).values({ ...data, status: 1 });
}

export async function updateActor(
  id: number,
  data: { name?: string; imgUrl?: string; description?: string; status?: number }
) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");

  let oldImgUrl: string | null = null;
  if (data.imgUrl !== undefined) {
    const actor = await db.query.actors.findFirst({
      where: eq(schema.actors.id, id),
      columns: { imgUrl: true }
    });
    oldImgUrl = actor?.imgUrl || null;
  }

  await db.update(schema.actors).set(data).where(eq(schema.actors.id, id));

  if (oldImgUrl && data.imgUrl !== undefined && data.imgUrl !== oldImgUrl) {
    await deleteBunnyAsset(oldImgUrl);
  }
}

export async function deleteActor(id: number) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");

  const actor = await db.query.actors.findFirst({
    where: eq(schema.actors.id, id),
    columns: { imgUrl: true }
  });

  await db.delete(schema.actors).where(eq(schema.actors.id, id));

  if (actor?.imgUrl) {
    await deleteBunnyAsset(actor.imgUrl);
  }
}

// ─────────────────────────────────────────────────────────────────
// CHARACTERS
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminCharacters = unstable_cache(
  async () => {
    if (!db) return [];
  return db.query.characters.findMany({ orderBy: (c, { asc }) => [asc(c.name)] });
  },
  ["admin-characters"],
  { revalidate: 3600, tags: ["admin-data", "admin-characters", "characters"] }
);

export async function getAdminCharacters() {
  await verifyAdmin();
  return getCached_getAdminCharacters();
}

export async function createCharacter(data: {
  name: string;
  imgUrl?: string;
  description?: string;
}) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.characters).values({ ...data, status: 1 });
}

export async function updateCharacter(
  id: number,
  data: { name?: string; imgUrl?: string; description?: string; status?: number }
) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");

  let oldImgUrl: string | null = null;
  if (data.imgUrl !== undefined) {
    const character = await db.query.characters.findFirst({
      where: eq(schema.characters.id, id),
      columns: { imgUrl: true }
    });
    oldImgUrl = character?.imgUrl || null;
  }

  await db.update(schema.characters).set(data).where(eq(schema.characters.id, id));

  if (oldImgUrl && data.imgUrl !== undefined && data.imgUrl !== oldImgUrl) {
    await deleteBunnyAsset(oldImgUrl);
  }
}

export async function deleteCharacter(id: number) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");

  const character = await db.query.characters.findFirst({
    where: eq(schema.characters.id, id),
    columns: { imgUrl: true }
  });

  await db.delete(schema.characters).where(eq(schema.characters.id, id));

  if (character?.imgUrl) {
    await deleteBunnyAsset(character.imgUrl);
  }
}

// ─────────────────────────────────────────────────────────────────
// PLANS
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminPlans = unstable_cache(
  async () => {
    if (!db) return [];
  return db.query.plans.findMany({
    with: { features: true },
    orderBy: (p, { asc }) => [asc(p.id)],
  });
  },
  ["admin-plans"],
  { revalidate: 3600, tags: ["admin-data", "admin-plans", "plans"] }
);

export async function getAdminPlans() {
  await verifyAdmin();
  return getCached_getAdminPlans();
}

export async function createPlan(data: {
  level: number;
  name: string;
  priceMonth: number;
}) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.plans).values({
    ...data,
    priceMonth: data.priceMonth.toString(),
    status: 1,
  });
  revalidateAdmin();
}

export async function updatePlan(
  id: number,
  data: { level?: number; name?: string; priceMonth?: number; status?: number }
) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");

  const { priceMonth, ...planData } = data;

  await db
    .update(schema.plans)
    .set({
      ...planData,
      ...(priceMonth !== undefined && {
        priceMonth: priceMonth.toString(),
      }),
    })
    .where(eq(schema.plans.id, id));
  revalidateAdmin();
}

export async function deletePlan(id: number) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.delete(schema.plans).where(eq(schema.plans.id, id));
  revalidateAdmin();
}

// ─────────────────────────────────────────────────────────────────
// FEATURES
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminFeatures = unstable_cache(
  async () => {
    if (!db) return [];
  return db.query.features.findMany({
    with: { plan: { columns: { id: true, name: true } } },
    orderBy: (f, { asc }) => [asc(f.idPlan), asc(f.id)],
  });
  },
  ["admin-features"],
  { revalidate: 3600, tags: ["admin-data", "admin-features", "features"] }
);

export async function getAdminFeatures() {
  await verifyAdmin();
  return getCached_getAdminFeatures();
}

export async function createFeature(data: { idPlan: number; name: string; available?: boolean }) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.features).values({ ...data, available: data.available ?? true });
  revalidateAdmin();
}

export async function updateFeature(id: number, data: { idPlan?: number; name?: string; available?: boolean }) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.update(schema.features).set(data).where(eq(schema.features.id, id));
  revalidateAdmin();
}

export async function deleteFeature(id: number) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.delete(schema.features).where(eq(schema.features.id, id));
  revalidateAdmin();
}

// ─────────────────────────────────────────────────────────────────
// PACKAGES
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminPackages = unstable_cache(
  async () => {
    if (!db) return [];
  return db.query.packages.findMany({
    with: { plan: { columns: { id: true, name: true } } },
    orderBy: (p, { asc }) => [asc(p.idPlan), asc(p.time)],
  });
  },
  ["admin-packages"],
  { revalidate: 3600, tags: ["admin-data", "admin-packages", "packages"] }
);

export async function getAdminPackages() {
  await verifyAdmin();
  return getCached_getAdminPackages();
}

export async function createPackage(data: { idPlan: number; time: number; discount?: number }) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.packages).values({ ...data, discount: data.discount?.toString() ?? "0.00" });
  revalidateAdmin();
}

export async function updatePackage(id: number, data: { idPlan?: number; time?: number; discount?: number }) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  const { discount, ...pkgData } = data;
  await db.update(schema.packages).set({
    ...pkgData,
    ...(discount !== undefined && { discount: discount.toString() })
  }).where(eq(schema.packages.id, id));
  revalidateAdmin();
}

export async function deletePackage(id: number) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.delete(schema.packages).where(eq(schema.packages.id, id));
  revalidateAdmin();
}

// ─────────────────────────────────────────────────────────────────
// AUTHORS
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminAuthors = unstable_cache(
  async () => {
    if (!db) return [];
  return db.query.authors.findMany({ orderBy: (a, { asc }) => [asc(a.name)] });
  },
  ["admin-authors"],
  { revalidate: 3600, tags: ["admin-data", "admin-authors", "authors"] }
);

export async function getAdminAuthors() {
  await verifyAdmin();
  return getCached_getAdminAuthors();
}

export async function createAuthor(data: {
  name: string;
  description?: string;
}) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.authors).values({ ...data, status: 1 });
}

export async function updateAuthor(
  id: number,
  data: { name?: string; description?: string; status?: number }
) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.update(schema.authors).set(data).where(eq(schema.authors.id, id));
}

export async function deleteAuthor(id: number) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.delete(schema.authors).where(eq(schema.authors.id, id));
}

// ─────────────────────────────────────────────────────────────────
// ACCOUNTS
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminAccounts = unstable_cache(
  async () => {
    if (!db) return [];
  return db.query.accounts.findMany({
    orderBy: (a, { desc }) => [desc(a.id)],
    columns: { password: false },
  });
  },
  ["admin-accounts"],
  { revalidate: 3600, tags: ["admin-data", "admin-accounts", "accounts"] }
);

export async function getAdminAccounts() {
  await verifyAdmin();
  return getCached_getAdminAccounts();
}

export async function updateAccountRole(id: number, role: string) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.update(schema.accounts).set({ role }).where(eq(schema.accounts.id, id));
}

export async function deleteAccount(id: number) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.delete(schema.accounts).where(eq(schema.accounts.id, id));
}

// ─────────────────────────────────────────────────────────────────
// CACHE REVALIDATION
// ─────────────────────────────────────────────────────────────────

export async function revalidateAllCache() {
  await verifyAdmin();
  revalidateAdmin();
  revalidateTag("movies", "default");
  revalidateTag("galleries", "default");
}

// ─────────────────────────────────────────────────────────────────
// AI GALLERIES
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminGalleries = unstable_cache(
  async () => {
    if (!db) return [];
  return db.query.aiGalleries.findMany({
    orderBy: (g, { desc }) => [desc(g.createdAt)],
    with: {
      movie: { columns: { id: true, name: true } },
      plan: { columns: { id: true, name: true, level: true } },
      galleryCharacters: {
        with: { character: { columns: { id: true, name: true } } }
      },
      images: {
        columns: { id: true, imgUrl: true },
        with: {
          collectionImages: true
        }
      }
    }
  });
  },
  ["admin-galleries"],
  { revalidate: 3600, tags: ["admin-data", "admin-galleries", "galleries"] }
);

export async function getAdminGalleries() {
  await verifyAdmin();
  return getCached_getAdminGalleries();
}

export async function createGallery(data: {
  name: string;
  idMovie?: number;
  idPlan?: number;
  characterIds: number[];
  imageUrls: string[];
}) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");

  const { characterIds = [], imageUrls = [], idMovie, idPlan, name } = data;

  const [inserted] = await db.insert(schema.aiGalleries).values({
    name,
    idMovie: idMovie || null,
    idPlan: idPlan || null,
    status: 1,
  }).returning({ id: schema.aiGalleries.id });

  if (!inserted) throw new Error("Failed to create gallery");
  const galleryId = inserted.id;

  if (characterIds.length > 0) {
    await db.insert(schema.galleryCharacter).values(
      characterIds.map((cid) => ({ idGallery: galleryId, idCharacter: cid }))
    );
  }

  if (imageUrls.length > 0) {
    await db.insert(schema.aiImages).values(
      imageUrls.map((url) => ({ idGallery: galleryId, imgUrl: url, status: 1 }))
    );
  }

  revalidateAdmin();
  revalidateTag("galleries", "default");
}

export async function updateGallery(
  id: number,
  data: {
    name: string;
    idMovie?: number;
    idPlan?: number;
    characterIds?: number[];
    imageUrls?: string[];
  }
) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  const { name, idMovie, idPlan, characterIds = [], imageUrls = [] } = data;

  await db
    .update(schema.aiGalleries)
    .set({
      name,
      idMovie: idMovie || null,
      idPlan: idPlan || null,
    })
    .where(eq(schema.aiGalleries.id, id));

  // Sync character relationships
  await db
    .delete(schema.galleryCharacter)
    .where(eq(schema.galleryCharacter.idGallery, id));

  if (characterIds.length > 0) {
    await db.insert(schema.galleryCharacter).values(
      characterIds.map((cid) => ({ idGallery: id, idCharacter: cid }))
    );
  }

  // Append new images if uploaded
  if (imageUrls.length > 0) {
    await db.insert(schema.aiImages).values(
      imageUrls.map((url) => ({ idGallery: id, imgUrl: url, status: 1 }))
    );
  }

  revalidateAdmin();
  revalidateTag("galleries", "default");
}

function cleanFolderName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9\s-_]/g, "") // remove special characters
    .trim()
    .replace(/\s+/g, "_"); // replace spaces with underscore
}

export async function deleteBunnyAsset(url: string | null | undefined) {
  await verifyAdmin();
  if (!url) return;
  const cdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL?.replace(/\/$/, "");
  const storageZone = process.env.BUNNY_STORAGE_ZONE_NAME;
  const accessKey = process.env.BUNNY_STORAGE_ACCESS_KEY;

  if (!storageZone || !accessKey) {
    console.warn("Bunny Storage configuration missing. Cannot delete asset:", url);
    return;
  }

  // Check if it's a Bunny CDN url
  const isBunnyUrl = (cdnUrl && url.startsWith(cdnUrl)) || url.includes("b-cdn.net") || url.includes("bunnycdn.com");
  if (!isBunnyUrl) return;

  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const cleanPath = pathname.replace(/^\//, "");

    let targetPath = cleanPath;
    
    // Check if it's an old style directory-based image URL
    const isOldStyle = url.endsWith("display.webp") || url.endsWith("thumb.webp") || url.endsWith("original.png");
    if (isOldStyle) {
      const lastSlashIdx = cleanPath.lastIndexOf('/');
      if (lastSlashIdx !== -1) {
        let dirPath = cleanPath.substring(0, lastSlashIdx + 1); // e.g. "movies/some_folder/"
        
        // Ensure movie path deletes the entire movie folder
        const parts = dirPath.split("/").filter(Boolean);
        if (parts[0] === "movies" && parts.length >= 2) {
          dirPath = `movies/${parts[1]}/`;
        }
        targetPath = dirPath;
      }
    }

    const deleteUrl = `https://storage.bunnycdn.com/${storageZone}/${targetPath}`;
    const res = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        AccessKey: accessKey,
      }
    });

    if (res.ok) {
      console.log(`Bunny Storage: Successfully deleted ${isOldStyle ? 'directory' : 'file'} ${targetPath}`);
    } else {
      const errText = await res.text();
      console.error(`Bunny Storage: Failed to delete ${targetPath}: ${errText}`);
    }
  } catch (err) {
    console.error("Failed to delete Bunny Storage asset:", err);
  }
}

export async function deleteGallery(id: number) {
  await verifyAdmin();
  const fs = require("fs");
  const path = require("path");
  const logPath = path.join(process.cwd(), "delete_log.txt");
  const log = (msg: string) => {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
    console.log(msg);
  };

  if (!db) {
    log("Error: Database not available");
    throw new Error("Database not available");
  }

  log(`Starting deletion of gallery ID: ${id}`);

  // 1. Get the gallery details and images belonging to this gallery first
  let gallery: any = null;
  try {
    gallery = await db.query.aiGalleries.findFirst({
      where: eq(schema.aiGalleries.id, id),
      columns: { name: true },
      with: {
        images: { columns: { imgUrl: true } }
      }
    });
    if (gallery) {
      log(`Found gallery in DB: "${gallery.name}" with ${gallery.images?.length || 0} images.`);
    } else {
      log("Gallery not found in DB.");
    }
  } catch (err: any) {
    log(`Error querying gallery: ${err?.message}`);
  }

  // 2. Delete the gallery from Database (cascades deletes to aiImages and galleryCharacter)
  try {
    await db.delete(schema.aiGalleries).where(eq(schema.aiGalleries.id, id));
    log("Successfully deleted gallery from DB (cascade deleted images & characters).");
  } catch (err: any) {
    log(`Error deleting gallery from DB: ${err?.message}`);
  }

  // 3. Delete matching images on Bunny Storage
  if (gallery) {
    const galleryImages = gallery.images || [];
    const parentFoldersToDelete = new Set<string>();
    const individualUrlsToDelete: string[] = [];

    const cdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL?.replace(/\/$/, "");
    const storageZone = process.env.BUNNY_STORAGE_ZONE_NAME;
    const accessKey = process.env.BUNNY_STORAGE_ACCESS_KEY;

    for (const img of galleryImages) {
      const url = img.imgUrl;
      if (!url) continue;

      const isBunnyUrl = (cdnUrl && url.startsWith(cdnUrl)) || url.includes("b-cdn.net") || url.includes("bunnycdn.com");
      if (!isBunnyUrl) continue;

      try {
        const parsedUrl = new URL(url);
        const pathname = parsedUrl.pathname;
        const parts = pathname.split("/").filter(Boolean);
        
        if (parts.length >= 3 && parts[0] === "ai_galleries") {
          // New gallery image path format: ai_galleries/{gallery_folder}/{image_id}/display.webp
          // Keep the gallery_folder path: ai_galleries/{gallery_folder}/
          parentFoldersToDelete.add(`ai_galleries/${parts[1]}/`);
        } else {
          individualUrlsToDelete.push(url);
        }
      } catch (e: any) {
        individualUrlsToDelete.push(url);
      }
    }

    if (storageZone && accessKey) {
      // Delete shared parent folders on Bunny Storage (this recursively deletes all nested image directories)
      for (const parentFolder of parentFoldersToDelete) {
        try {
          log(`Bunny Storage: Deleting parent gallery folder: ${parentFolder}`);
          const deleteUrl = `https://storage.bunnycdn.com/${storageZone}/${parentFolder}`;
          const res = await fetch(deleteUrl, {
            method: "DELETE",
            headers: { AccessKey: accessKey }
          });
          if (res.ok) {
            log(`Bunny Storage: Successfully deleted parent folder ${parentFolder}`);
          } else {
            const errText = await res.text();
            log(`Bunny Storage: Failed to delete parent folder ${parentFolder}: ${errText}`);
          }
        } catch (err: any) {
          log(`Bunny Storage: Error deleting parent folder ${parentFolder}: ${err?.message || err}`);
        }
      }

      // Delete individual legacy urls
      if (individualUrlsToDelete.length > 0) {
        try {
          await Promise.all(
            individualUrlsToDelete.map((url) => deleteBunnyAsset(url))
          );
          log(`Bunny Storage: Deleted ${individualUrlsToDelete.length} individual legacy assets.`);
        } catch (err: any) {
          log(`Bunny Storage: Error deleting individual legacy assets: ${err?.message || err}`);
        }
      }
    } else {
      log("Bunny Storage configuration missing. Skipping Bunny Storage deletion.");
    }
  }

  revalidateAdmin();
  revalidateTag("galleries", "default");
}

// ─────────────────────────────────────────────────────────────────
// COLLECTIONS (grouping of AI Images)
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminCollections = unstable_cache(
  async () => {
    if (!db) return [];
  return db.query.collections.findMany({
    orderBy: (c, { asc }) => [asc(c.name)],
    with: {
      collectionImages: {
        with: {
          aiImage: { columns: { id: true, imgUrl: true } },
        },
      },
    },
  });
  },
  ["admin-collections"],
  { revalidate: 3600, tags: ["admin-data", "admin-collections", "collections"] }
);

export async function getAdminCollections() {
  await verifyAdmin();
  return getCached_getAdminCollections();
}

export async function createCollection(name: string) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  const [inserted] = await db
    .insert(schema.collections)
    .values({ name })
    .returning({ id: schema.collections.id });
  if (!inserted) throw new Error("Failed to create collection");
  revalidateAdmin();
  return inserted;
}

export async function updateCollection(id: number, name: string) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db
    .update(schema.collections)
    .set({ name })
    .where(eq(schema.collections.id, id));
  revalidateAdmin();
}

export async function deleteCollection(id: number) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  // cascade will delete collection_images rows automatically
  await db.delete(schema.collections).where(eq(schema.collections.id, id));
  revalidateAdmin();
}

export async function addImageToCollection(idCollection: number, idAiImage: number) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  // Avoid duplicates
  const existing = await db.query.collectionImages.findFirst({
    where: and(
      eq(schema.collectionImages.idCollection, idCollection),
      eq(schema.collectionImages.idAiImage, idAiImage)
    ),
  });
  if (existing) return; // already in collection
  await db.insert(schema.collectionImages).values({ idCollection, idAiImage });
  revalidateAdmin();
}

export async function removeImageFromCollection(idCollection: number, idAiImage: number) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db
    .delete(schema.collectionImages)
    .where(
      and(
        eq(schema.collectionImages.idCollection, idCollection),
        eq(schema.collectionImages.idAiImage, idAiImage)
      )
    );
  revalidateAdmin();
}

const getCached_getAdminAiImages = unstable_cache(
  async () => {
    if (!db) return [];
  return db.query.aiImages.findMany({
    orderBy: (img, { desc }) => [desc(img.createdAt)],
    with: {
      gallery: { columns: { id: true, name: true } },
      collectionImages: {
        with: { collection: { columns: { id: true, name: true } } },
      },
    },
  });
  },
  ["admin-ai-images"],
  { revalidate: 3600, tags: ["admin-data", "admin-ai-images", "ai-images"] }
);

export async function getAdminAiImages() {
  await verifyAdmin();
  return getCached_getAdminAiImages();
}

export async function getSubscriptionPlans() {
  if (!db) return [];
  return db.query.plans.findMany({
    where: eq(schema.plans.status, 1),
    orderBy: (plans, { asc }) => [asc(plans.level)],
    with: {
      features: true,
      packages: {
        orderBy: (p, { asc }) => [asc(p.time)],
      },
    },
  });
}

export async function getUserPaymentHistory() {
  const user = await getCurrentUser();
  if (!user || !db) return [];
  return db.query.payments.findMany({
    where: eq(schema.payments.idAccount, user.id),
    orderBy: (p, { desc }) => [desc(p.createdAt)],
    with: {
      package: {
        with: {
          plan: true,
        },
      },
    },
  });
}

export async function incrementGalleryViews(id: number) {
  if (!db) return;
  try {
    await db
      .update(schema.aiGalleries)
      .set({ views: sql`views + 1` })
      .where(eq(schema.aiGalleries.id, id));
  } catch (err) {
    console.error("Error incrementing gallery views:", err);
  }
}

export async function incrementEpisodeViews(id: number) {
  if (!db) return;
  try {
    await db
      .update(schema.episodes)
      .set({ views: sql`views + 1` })
      .where(eq(schema.episodes.id, id));
  } catch (err) {
    console.error("Error incrementing episode views:", err);
  }
}


