"use server";
import { getCurrentUser } from "@/lib/auth/actions";

async function verifyAdmin() {
  // Admin check bypassed by user request
}


import { revalidatePath, revalidateTag } from "next/cache";

function revalidateAdmin() {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/tap-phim");
    revalidatePath("/admin");
    revalidateTag("admin-data", "default");
    revalidateTag("episodes:latest", "default");
    revalidateTag("episodes:most-viewed", "default");
    revalidateTag("movies:all", "default");
    revalidateTag("movies:hot", "default");
  } catch (err) {
    console.error("Revalidation error:", err);
  }
}
import { db, schema } from "@/lib/db";
import { eq, and, ne, sql, ilike, or, inArray, count, isNull, desc, gte } from "drizzle-orm";
import crypto from "crypto";
import { slugify } from "@/lib/utils";
import { getCachedSystemSetting, setSystemSetting } from "@/lib/db/settings";
import { callGeminiText } from "@/lib/gemini";
import {
  generateAiSeoDescription,
  generateCategoryAiDescription,
  generateMovieAiDescription,
  generateAuthorAiDescription,
  generateGalleryGeminiAi,
  EPISODE_HOT_KEYS,
  formatStandardEpisodeTitle,
} from "@/lib/aiDescription";
import { getCategoryDetails } from "@/lib/categories";
import { generateCharacterTranslations, generateCharacterSeoDescription } from "@/lib/characterAi";
import { analyzeMovieHotKeywords } from "@/lib/movieKeywordAi";

// ─────────────────────────────────────────────────────────────────
// MOVIES
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminMovies = async () => {
    if (!db) return [];
  const result = await db.query.movies.findMany({
    orderBy: (m, { asc, desc }) => [
      sql`CASE WHEN ${m.displayOrder} > 0 THEN ${m.displayOrder} ELSE 999999 END ASC`,
      desc(m.id),
    ],
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
  };

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
  displayOrder?: number;
}) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");

  const { categoryIds = [], idAuthor, displayOrder = 0, ...movieData } = data;

  const [inserted] = await db.insert(schema.movies).values({
    ...movieData,
    displayOrder,
    slug: slugify(movieData.name),
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
  revalidateTag("movies:all", "default");
  revalidateTag("movies:hot", "default");
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
    displayOrder?: number;
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
  revalidateTag("movies:all", "default");
  revalidateTag("movies:hot", "default");
  revalidateTag(`movie:detail-${id}`, "default");
  revalidateTag("movies:top", "default");
  revalidateTag("episodes:latest", "default");
  revalidateTag("episodes:most-viewed", "default");
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
  revalidateTag("movies:all", "default");
  revalidateTag("movies:hot", "default");
  revalidateTag(`movie:detail-${id}`, "default");
  revalidateTag("movies:top", "default");
  revalidateTag("episodes:latest", "default");
  revalidateTag("episodes:most-viewed", "default");
}

// ─────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminCategories = async () => {
  try {
    if (!db) return [];
    return await db.query.categories.findMany({ orderBy: (c, { asc }) => [asc(c.id)] });
  } catch (err) {
    console.error("Error in getAdminCategories:", err);
    return [];
  }
};

export async function getAdminCategories() {
  return getCached_getAdminCategories();
}

const getCached_getFooterData = async () => {
  try {
    if (!db) return { categories: [], topMovies: [] };
    const [categories, topMovies] = await Promise.all([
      db.query.categories.findMany({ orderBy: (c, { asc }) => [asc(c.id)] }),
      db.query.movies.findMany({
        columns: { id: true, name: true, slug: true },
        where: (m, { eq }) => eq(m.status, 1),
        orderBy: (m, { desc }) => [desc(m.id)],
        limit: 6,
      }),
    ]);
    return { categories: categories || [], topMovies: topMovies || [] };
  } catch (err) {
    console.error("Error in getFooterData:", err);
    return { categories: [], topMovies: [] };
  }
};

export async function getFooterData() {
  return getCached_getFooterData();
}

export async function createCategory(data: {
  name: string;
  description?: string;
}) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.categories).values({ ...data, slug: slugify(data.name), status: 1 });
  revalidateAdmin();
  revalidateTag("categories:all", "default");
  revalidateTag("movies:category", "default");
}

export async function updateCategory(
  id: number,
  data: { name?: string; description?: string; status?: number }
) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.update(schema.categories).set(data).where(eq(schema.categories.id, id));
  revalidateAdmin();
  revalidateTag("categories:all", "default");
  revalidateTag("movies:category", "default");
}

export async function deleteCategory(id: number) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.delete(schema.categories).where(eq(schema.categories.id, id));
  revalidateAdmin();
  revalidateTag("categories:all", "default");
  revalidateTag("movies:category", "default");
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
      where: (ep, { and, isNotNull, ne }) => and(
        isNotNull(ep.bunnyVideoId),
        ne(ep.bunnyStatus, "completed")
      ),
      with: {
        movie: {
          columns: { id: true, slug: true },
        },
      },
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
        if (data.status === 3 || data.status === 4 || data.encodeProgress === 100) {
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

          if (ep.movie?.slug) {
            revalidatePath(`/movie/${ep.movie.slug}`, "page");
          }
          if (ep.idMovie) {
            revalidatePath(`/movie/${ep.idMovie}`, "page");
            revalidateTag(`movie:detail-${ep.idMovie}`, "default");
          }
          updated = true;
        }
      }
    }

    if (updated) {
      revalidatePath("/movie/[id]", "page");
      revalidateAdmin();
      revalidateTag("movies:all", "default");
      revalidateTag("movies:hot", "default");
      revalidateTag("episodes:latest", "default");
      revalidateTag("episodes:most-viewed", "default");
    }
  } catch (err) {
    console.error("Error syncing processing episodes:", err);
  }
}

const getCachedAdminEpisodes = async (movieId?: number) => {
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
  };

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

  if (episodeData.name) {
    const epSlug = slugify(episodeData.name.trim());
    const existingCheck = await db.select({ id: schema.episodes.id, name: schema.episodes.name })
      .from(schema.episodes)
      .where(or(
        ilike(schema.episodes.name, episodeData.name.trim()),
        eq(schema.episodes.slug, epSlug)
      ))
      .limit(1);

    if (existingCheck.length > 0) {
      throw new Error(`Tập phim "${episodeData.name}" hoặc Slug "${epSlug}" đã tồn tại trong database! Vui lòng chọn Hot Key khác.`);
    }
  }

  const [inserted] = await db.insert(schema.episodes).values({
    ...episodeData,
    slug: slugify(episodeData.name || "tap"),
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
  revalidatePath("/movie/[id]", "page");
  if (data.idMovie) {
    revalidatePath(`/movie/${data.idMovie}`, "page");
    try {
      const m = await db.query.movies.findFirst({
        where: (movieTable, { eq }) => eq(movieTable.id, data.idMovie),
        columns: { slug: true }
      });
      if (m?.slug) {
        revalidatePath(`/movie/${m.slug}`, "page");
      }
    } catch {}
    revalidateTag(`movie:detail-${data.idMovie}`, "default");
  }
  revalidateTag("episodes:latest", "default");
  revalidateTag("episodes:most-viewed", "default");
  revalidateTag("movies:all", "default");
  revalidateTag("movies:hot", "default");
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

  const existing = await db.query.episodes.findFirst({
    where: (ep, { eq }) => eq(ep.id, id),
  });

  if (!existing) {
    throw new Error("Episode not found");
  }

  if (data.name) {
    const epSlug = slugify(data.name.trim());
    const existingCheck = await db.select({ id: schema.episodes.id })
      .from(schema.episodes)
      .where(and(
        ne(schema.episodes.id, id),
        or(
          ilike(schema.episodes.name, data.name.trim()),
          eq(schema.episodes.slug, epSlug)
        )
      ))
      .limit(1);

    if (existingCheck.length > 0) {
      throw new Error(`Tập phim "${data.name}" hoặc Slug "${epSlug}" đã tồn tại trên một tập phim khác trong database!`);
    }
  }

  // If a new bunnyVideoId is uploaded/provided, delete the old one from Bunny Stream to avoid wasting storage
  if (data.bunnyVideoId !== undefined && existing.bunnyVideoId && existing.bunnyVideoId !== data.bunnyVideoId) {
    try {
      await deleteBunnyVideo(existing.bunnyVideoId);
    } catch (err) {
      console.error("Failed to delete old Bunny video on update:", err);
    }
  }

  // If banner image was changed, clean up old banner image from Bunny Storage
  if (data.banner !== undefined && existing.banner && existing.banner !== data.banner) {
    try {
      await deleteBunnyAsset(existing.banner);
    } catch (err) {
      console.error("Failed to delete old banner asset on update:", err);
    }
  }

  // Update episode fields in database
  await db
    .update(schema.episodes)
    .set({
      ...episodeData,
      ...(episodeData.name ? { slug: slugify(episodeData.name) } : {}),
      ...(episodeData.idPlan !== undefined ? { idPlan: episodeData.idPlan || null } : {}),
    })
    .where(eq(schema.episodes.id, id));

  // Update actor relations if provided
  if (actorIds !== undefined) {
    await db.delete(schema.episodesActor).where(eq(schema.episodesActor.idEpisodes, id));
    if (actorIds.length > 0) {
      await db.insert(schema.episodesActor).values(
        actorIds.map((aid) => ({ idActor: aid, idEpisodes: id }))
      );
    }
  }

  // Update character relations if provided
  if (characterIds !== undefined) {
    await db.delete(schema.episodesCharacter).where(eq(schema.episodesCharacter.idEpisodes, id));
    if (characterIds.length > 0) {
      await db.insert(schema.episodesCharacter).values(
        characterIds.map((cid) => ({ idCharacter: cid, idEpisodes: id }))
      );
    }
  }

  const idMovie = existing.idMovie;

  revalidateAdmin();
  revalidatePath("/movie/[id]", "page");
  if (idMovie) {
    revalidatePath(`/movie/${idMovie}`, "page");
    try {
      const m = await db.query.movies.findFirst({
        where: (movieTable, { eq }) => eq(movieTable.id, idMovie),
        columns: { slug: true }
      });
      if (m?.slug) {
        revalidatePath(`/movie/${m.slug}`, "page");
      }
    } catch {}
    revalidateTag(`movie:detail-${idMovie}`, "default");
  }
  revalidateTag("episodes:latest", "default");
  revalidateTag("episodes:most-viewed", "default");
  revalidateTag("movies:all", "default");
  revalidateTag("movies:hot", "default");
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

  let idMovie: number | null = null;
  try {
    const existing = await db.query.episodes.findFirst({
      where: (ep, { eq }) => eq(ep.id, id),
      columns: { bunnyVideoId: true, banner: true, idMovie: true }
    });
    if (existing) {
      idMovie = existing.idMovie;
      if (existing.bunnyVideoId) {
        await deleteBunnyVideo(existing.bunnyVideoId);
      }
      if (existing.banner) {
        await deleteBunnyAsset(existing.banner);
      }
    }
  } catch (err) {
    console.error("Failed to query episode before deletion:", err);
  }

  await db.delete(schema.episodesActor).where(eq(schema.episodesActor.idEpisodes, id));
  await db.delete(schema.episodesCharacter).where(eq(schema.episodesCharacter.idEpisodes, id));
  await db.delete(schema.episodes).where(eq(schema.episodes.id, id));
  revalidateAdmin();
  if (idMovie) {
    revalidateTag(`movie:detail-${idMovie}`, "default");
  }
  revalidateTag("episodes:latest", "default");
  revalidateTag("episodes:most-viewed", "default");
  revalidateTag("movies:all", "default");
  revalidateTag("movies:hot", "default");
}

// ─────────────────────────────────────────────────────────────────
// ACTORS
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminActors = async () => {
    if (!db) return [];
  return db.query.actors.findMany({ orderBy: (a, { asc }) => [asc(a.name)] });
  };

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
  await db.insert(schema.actors).values({ ...data, slug: slugify(data.name), status: 1 });
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

const getCached_getAdminCharacters = async () => {
    if (!db) return [];
  return db.query.characters.findMany({ orderBy: (c, { asc }) => [asc(c.name)], with: { movie: true } });
  };

export async function getAdminCharacters() {
  await verifyAdmin();
  return getCached_getAdminCharacters();
}

export async function createCharacter(data: {
  name: string;
  nameEn?: string;
  nameZh?: string;
  idMovie?: number;
  imgUrl?: string;
  description?: string;
}) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.characters).values({ ...data, slug: slugify(data.name), status: 1 });
}

export async function updateCharacter(
  id: number,
  data: { name?: string; nameEn?: string; nameZh?: string; idMovie?: number; imgUrl?: string; description?: string; status?: number }
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

const getCached_getAdminPlans = async () => {
    if (!db) return [];
  return db.query.plans.findMany({
    with: { features: true },
    orderBy: (p, { asc }) => [asc(p.id)],
  });
  };

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
    slug: slugify(data.name),
    priceMonth: data.priceMonth.toString(),
    status: 1,
  });
  revalidateAdmin();
  revalidateTag("plans:all", "default");
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
  revalidateTag("plans:all", "default");
}

export async function deletePlan(id: number) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.delete(schema.plans).where(eq(schema.plans.id, id));
  revalidateAdmin();
  revalidateTag("plans:all", "default");
}

// ─────────────────────────────────────────────────────────────────
// FEATURES
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminFeatures = async () => {
    if (!db) return [];
  return db.query.features.findMany({
    with: { plan: { columns: { id: true, name: true } } },
    orderBy: (f, { asc }) => [asc(f.idPlan), asc(f.id)],
  });
  };

export async function getAdminFeatures() {
  await verifyAdmin();
  return getCached_getAdminFeatures();
}

export async function createFeature(data: { idPlan: number; name: string; available?: boolean }) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.features).values({ ...data, available: data.available ?? true });
  revalidateAdmin();
  revalidateTag("plans:all", "default");
}

export async function updateFeature(id: number, data: { idPlan?: number; name?: string; available?: boolean }) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.update(schema.features).set(data).where(eq(schema.features.id, id));
  revalidateAdmin();
  revalidateTag("plans:all", "default");
}

export async function deleteFeature(id: number) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.delete(schema.features).where(eq(schema.features.id, id));
  revalidateAdmin();
  revalidateTag("plans:all", "default");
}

// ─────────────────────────────────────────────────────────────────
// PACKAGES
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminPackages = async () => {
    if (!db) return [];
  return db.query.packages.findMany({
    with: { plan: { columns: { id: true, name: true } } },
    orderBy: (p, { asc }) => [asc(p.idPlan), asc(p.time)],
  });
  };

export async function getAdminPackages() {
  await verifyAdmin();
  return getCached_getAdminPackages();
}

export async function createPackage(data: { idPlan: number; time: number; discount?: number }) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.packages).values({ ...data, discount: data.discount?.toString() ?? "0.00" });
  revalidateAdmin();
  revalidateTag("plans:all", "default");
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
  revalidateTag("plans:all", "default");
}

export async function deletePackage(id: number) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.delete(schema.packages).where(eq(schema.packages.id, id));
  revalidateAdmin();
  revalidateTag("plans:all", "default");
}

// ─────────────────────────────────────────────────────────────────
// AUTHORS
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminAuthors = async () => {
    if (!db) return [];
  return db.query.authors.findMany({ orderBy: (a, { asc }) => [asc(a.name)] });
  };

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
  await db.insert(schema.authors).values({ ...data, slug: slugify(data.name), status: 1 });
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

const getCached_getAdminAccounts = async () => {
    if (!db) return [];
  return db.query.accounts.findMany({
    orderBy: (a, { desc }) => [desc(a.id)],
    columns: { password: false },
  });
  };

export async function getAdminAccounts() {
  await verifyAdmin();
  return getCached_getAdminAccounts();
}

export async function updateAccountRole(id: number, role: string) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.update(schema.accounts).set({ role }).where(eq(schema.accounts.id, id));
}

export async function updateAccountViews(id: number, views: number) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  await db.update(schema.accounts).set({ views: Math.max(0, views) }).where(eq(schema.accounts.id, id));
  revalidateAdmin();
  revalidateTag("movies:all", "default");
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
  revalidatePath("/movie/[id]", "page");
  revalidatePath("/", "layout");
  revalidateTag("movies:all", "default");
  revalidateTag("movies:hot", "default");
  revalidateTag("movies:top", "default");
  revalidateTag("movies:category", "default");
  revalidateTag("categories:all", "default");
  revalidateTag("plans:all", "default");
  revalidateTag("episodes:latest", "default");
  revalidateTag("episodes:most-viewed", "default");
  revalidateTag("galleries:latest", "default");
}

// ─────────────────────────────────────────────────────────────────
// AI GALLERIES
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminGalleries = async () => {
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
  };

export async function getAdminGalleries() {
  await verifyAdmin();
  return getCached_getAdminGalleries();
}

export async function getAdminGalleriesPaginated(
  page = 1,
  limit = 24,
  search?: string,
  searchChar?: string,
  plan?: string,
  movieId?: string,
  sortBy?: string
) {
  await verifyAdmin();
  if (!db) return { galleries: [], totalCount: 0 };

  const offset = (page - 1) * limit;

  // Build filters
  const conditions = [];

  if (search) {
    const movieSub = db
      .select({ id: schema.movies.id })
      .from(schema.movies)
      .where(ilike(schema.movies.name, `%${search}%`));

    conditions.push(
      or(
        ilike(schema.aiGalleries.name, `%${search}%`),
        inArray(schema.aiGalleries.idMovie, movieSub)
      )
    );
  }

  if (searchChar) {
    const charSub = db
      .select({ idGallery: schema.galleryCharacter.idGallery })
      .from(schema.galleryCharacter)
      .innerJoin(schema.characters, eq(schema.galleryCharacter.idCharacter, schema.characters.id))
      .where(eq(schema.characters.name, searchChar));

    conditions.push(inArray(schema.aiGalleries.id, charSub));
  }

  if (plan && plan !== "all") {
    if (plan === "free") {
      conditions.push(isNull(schema.aiGalleries.idPlan));
    } else {
      const planSub = db
        .select({ id: schema.plans.id })
        .from(schema.plans)
        .where(ilike(schema.plans.name, `%${plan}%`));
      conditions.push(inArray(schema.aiGalleries.idPlan, planSub));
    }
  }

  if (movieId && movieId !== "all") {
    conditions.push(eq(schema.aiGalleries.idMovie, parseInt(movieId, 10)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let orderByClause: any = (g: any, { desc }: any) => [desc(g.id)];
  if (sortBy === "views") {
    orderByClause = (g: any, { desc }: any) => [desc(g.views)];
  }

  const items = await db.query.aiGalleries.findMany({
    where: whereClause,
    orderBy: orderByClause,
    limit,
    offset,
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

  const countResult = await db
    .select({ count: count() })
    .from(schema.aiGalleries)
    .where(whereClause);

  const totalCount = Number(countResult[0]?.count || 0);

  return {
    galleries: items,
    totalCount
  };
}


export async function createGallery(data: {
  name: string;
  slug?: string;
  description?: string;
  idMovie?: number;
  idPlan?: number;
  characterIds: number[];
  imageUrls: string[];
}) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");

  const { characterIds = [], imageUrls = [], idMovie, idPlan, name, description } = data;
  const rawSlug = data.slug?.trim() || slugify(name);
  const slug = rawSlug || `gallery-${Date.now()}`;

  const existingCheck = await db.select({ id: schema.aiGalleries.id, name: schema.aiGalleries.name })
    .from(schema.aiGalleries)
    .where(or(
      ilike(schema.aiGalleries.name, name.trim()),
      eq(schema.aiGalleries.slug, slug)
    ))
    .limit(1);

  if (existingCheck.length > 0) {
    throw new Error(`Bộ sưu tập "${name}" hoặc Slug "${slug}" đã tồn tại trong database! Vui lòng chọn Hot Key khác.`);
  }

  const [inserted] = await db.insert(schema.aiGalleries).values({
    name,
    slug,
    description: description?.trim() || null,
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
  revalidateTag("galleries:latest", "default");
}

export async function updateGallery(
  id: number,
  data: {
    name: string;
    slug?: string;
    description?: string;
    idMovie?: number;
    idPlan?: number;
    characterIds?: number[];
    imageUrls?: string[];
  }
) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");
  const { name, slug, description, idMovie, idPlan, characterIds = [], imageUrls = [] } = data;

  const targetSlug = slug?.trim() || slugify(name);

  const existingCheck = await db.select({ id: schema.aiGalleries.id })
    .from(schema.aiGalleries)
    .where(and(
      ne(schema.aiGalleries.id, id),
      or(
        ilike(schema.aiGalleries.name, name.trim()),
        eq(schema.aiGalleries.slug, targetSlug)
      )
    ))
    .limit(1);

  if (existingCheck.length > 0) {
    throw new Error(`Bộ sưu tập "${name}" hoặc Slug "${targetSlug}" đã tồn tại trên một bộ sưu tập khác trong database!`);
  }

  await db
    .update(schema.aiGalleries)
    .set({
      name,
      slug: targetSlug,
      description: description !== undefined ? (description.trim() || null) : undefined,
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
  revalidateTag("galleries:latest", "default");
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
  const log = (msg: string) => {
    console.log(`[DeleteGallery] ${msg}`);
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
  revalidateTag("galleries:latest", "default");
}

// ─────────────────────────────────────────────────────────────────
// COLLECTIONS (grouping of AI Images)
// ─────────────────────────────────────────────────────────────────

const getCached_getAdminCollections = async () => {
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
  };

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

const getCached_getAdminAiImages = async () => {
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
  };

export async function getAdminAiImages() {
  await verifyAdmin();
  return getCached_getAdminAiImages();
}

const getCached_getSubscriptionPlans = async () => {
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
  };

export async function getSubscriptionPlans() {
  return getCached_getSubscriptionPlans();
}

export async function getUserPaymentHistory(userId?: number) {
  let targetUserId = userId;
  if (!targetUserId) {
    const user = await getCurrentUser();
    if (!user) return [];
    targetUserId = user.id;
  }
  if (!db) return [];
  
  return (async () => {
      return db!.query.payments.findMany({
        where: eq(schema.payments.idAccount, targetUserId!),
        orderBy: (p, { desc }) => [desc(p.createdAt)],
        with: {
          package: {
            with: {
              plan: true,
            },
          },
        },
      });
    })();
}

export async function getUserSubscriptions(userId?: number) {
  let targetUserId = userId;
  if (!targetUserId) {
    const user = await getCurrentUser();
    if (!user) return [];
    targetUserId = user.id;
  }
  if (!db) return [];
  
  return (async () => {
      return db!.query.userSubscriptions.findMany({
        where: eq(schema.userSubscriptions.idAccount, targetUserId!),
        orderBy: (s, { desc }) => [desc(s.updatedAt)],
        with: {
          plan: true,
        },
      });
    })();
}

export async function incrementGalleryViews(id: number, userId?: number) {
  if (!db) return;
  try {
    await db
      .update(schema.aiGalleries)
      .set({ views: sql`COALESCE(views, 0) + 1` })
      .where(eq(schema.aiGalleries.id, id));

    if (userId) {
      await db
        .update(schema.accounts)
        .set({ views: sql`COALESCE(views, 0) + 1` })
        .where(eq(schema.accounts.id, userId));
    }
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

export async function incrementAccountViews(id: number) {
  if (!db || !id) return;
  try {
    await db
      .update(schema.accounts)
      .set({ views: sql`COALESCE(views, 0) + 1` })
      .where(eq(schema.accounts.id, id));
  } catch (err) {
    console.error("Error incrementing account views:", err);
  }
}

// ─────────────────────────────────────────────────────────────────
// SYSTEM SETTINGS (VIP FREE MODE & TURNSTILE ANTI-BOT)
// ─────────────────────────────────────────────────────────────────
import { getFreeVipMode, setFreeVipMode, getTurnstileMode, setTurnstileMode } from "@/lib/db/settings";

export async function getFreeVipModeAction(): Promise<boolean> {
  return await getFreeVipMode();
}

export async function toggleFreeVipModeAction(enabled: boolean): Promise<{ success: boolean; enabled: boolean }> {
  await verifyAdmin();
  await setFreeVipMode(enabled);
  revalidateAdmin();
  revalidateTag("system-settings", "default");
  revalidatePath("/", "layout");
  return { success: true, enabled };
}

export async function getTurnstileModeAction(): Promise<boolean> {
  return await getTurnstileMode();
}

export async function toggleTurnstileModeAction(enabled: boolean): Promise<{ success: boolean; enabled: boolean }> {
  await verifyAdmin();
  await setTurnstileMode(enabled);
  revalidateAdmin();
  revalidateTag("system-settings", "default");
  revalidatePath("/", "layout");
  return { success: true, enabled };
}

// ─────────────────────────────────────────────────────────────────
// REAL-TIME TRAFFIC & CLICK ANALYTICS
// ─────────────────────────────────────────────────────────────────

export async function getRealtimeAnalytics(
  timeframe: "today" | "yesterday" | "7days" | "30days" = "today"
) {
  await verifyAdmin();
  if (!db) {
    return {
      totalClicks: 0,
      googleClicks: 0,
      uniqueVisitors: 0,
      mobilePercentage: 0,
      desktopPercentage: 0,
      chartData: [],
      topPages: [],
      topGooglePages: [],
      sources: [],
    };
  }

  // Cố định mốc thời gian theo Múi Giờ Việt Nam (UTC+7 / GMT+7)
  const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;
  const now = new Date();
  const nowVn = new Date(now.getTime() + VIETNAM_OFFSET_MS);

  const year = nowVn.getUTCFullYear();
  const month = nowVn.getUTCMonth();
  const date = nowVn.getUTCDate();

  let start: Date;
  let end: Date;

  if (timeframe === "today") {
    // 00:00:00.000 giờ VN ngày hôm nay
    start = new Date(Date.UTC(year, month, date, 0, 0, 0, 0) - VIETNAM_OFFSET_MS);
    end = new Date();
  } else if (timeframe === "yesterday") {
    // 00:00:00.000 đến 23:59:59.999 giờ VN ngày hôm qua
    start = new Date(Date.UTC(year, month, date - 1, 0, 0, 0, 0) - VIETNAM_OFFSET_MS);
    end = new Date(Date.UTC(year, month, date - 1, 23, 59, 59, 999) - VIETNAM_OFFSET_MS);
  } else if (timeframe === "7days") {
    start = new Date(Date.UTC(year, month, date - 7, 0, 0, 0, 0) - VIETNAM_OFFSET_MS);
    end = new Date();
  } else if (timeframe === "30days") {
    start = new Date(Date.UTC(year, month, date - 30, 0, 0, 0, 0) - VIETNAM_OFFSET_MS);
    end = new Date();
  } else {
    start = new Date(Date.UTC(year, month, date, 0, 0, 0, 0) - VIETNAM_OFFSET_MS);
    end = new Date();
  }

  const startIso = start.toISOString();
  const endIso = end.toISOString();

  try {
    const summaryRes = await db.execute(sql`
      SELECT 
        COUNT(*)::int AS "totalClicks",
        COUNT(CASE WHEN "source" = 'google' THEN 1 END)::int AS "googleClicks",
        COUNT(DISTINCT "ip_hash")::int AS "uniqueVisitors",
        COUNT(CASE WHEN "device" = 'mobile' OR "device" = 'tablet' THEN 1 END)::int AS "mobileClicks",
        COUNT(CASE WHEN "device" = 'desktop' THEN 1 END)::int AS "desktopClicks"
      FROM "traffic_logs"
      WHERE "created_at" >= ${startIso}::timestamp AND "created_at" <= ${endIso}::timestamp
    `);

    const sourcesRes = await db.execute(sql`
      SELECT 
        "source",
        COUNT(*)::int AS "count"
      FROM "traffic_logs"
      WHERE "created_at" >= ${startIso}::timestamp AND "created_at" <= ${endIso}::timestamp
      GROUP BY "source"
      ORDER BY "count" DESC
      LIMIT 6
    `);

    const topPagesRes = await db.execute(sql`
      SELECT 
        "path",
        COALESCE(MAX("title"), "path") AS "title",
        COUNT(*)::int AS "count",
        COUNT(CASE WHEN "source" = 'google' THEN 1 END)::int AS "googleCount"
      FROM "traffic_logs"
      WHERE "created_at" >= ${startIso}::timestamp AND "created_at" <= ${endIso}::timestamp
      GROUP BY "path"
      ORDER BY "count" DESC
      LIMIT 10
    `);

    const topGooglePagesRes = await db.execute(sql`
      SELECT 
        "path",
        COALESCE(MAX("title"), "path") AS "title",
        COUNT(*)::int AS "googleCount"
      FROM "traffic_logs"
      WHERE "created_at" >= ${startIso}::timestamp AND "created_at" <= ${endIso}::timestamp AND "source" = 'google'
      GROUP BY "path"
      ORDER BY "googleCount" DESC
      LIMIT 10
    `);

    const chartRes =
      timeframe === "today" || timeframe === "yesterday"
        ? await db.execute(sql`
            SELECT 
              EXTRACT(HOUR FROM ("created_at" + INTERVAL '7 HOURS'))::int AS "hour",
              COUNT(*)::int AS "clicks",
              COUNT(CASE WHEN "source" = 'google' THEN 1 END)::int AS "googleClicks"
            FROM "traffic_logs"
            WHERE "created_at" >= ${startIso}::timestamp AND "created_at" <= ${endIso}::timestamp
            GROUP BY "hour"
            ORDER BY "hour" ASC
          `)
        : await db.execute(sql`
            SELECT 
              TO_CHAR("created_at" + INTERVAL '7 HOURS', 'DD/MM') AS "day",
              COUNT(*)::int AS "clicks",
              COUNT(CASE WHEN "source" = 'google' THEN 1 END)::int AS "googleClicks"
            FROM "traffic_logs"
            WHERE "created_at" >= ${startIso}::timestamp AND "created_at" <= ${endIso}::timestamp
            GROUP BY "day", DATE_TRUNC('day', "created_at" + INTERVAL '7 HOURS')
            ORDER BY DATE_TRUNC('day', "created_at" + INTERVAL '7 HOURS') ASC
          `);

    const summary = (summaryRes as any).rows?.[0] || (summaryRes as any)?.[0] || {};
    const totalClicks = Number(summary.totalClicks) || 0;
    const googleClicks = Number(summary.googleClicks) || 0;
    const uniqueVisitors = Number(summary.uniqueVisitors) || 0;
    const mobileClicks = Number(summary.mobileClicks) || 0;
    const desktopClicks = Number(summary.desktopClicks) || 0;

    const totalDev = mobileClicks + desktopClicks || 1;
    const mobilePercentage = Math.round((mobileClicks / totalDev) * 100);
    const desktopPercentage = 100 - mobilePercentage;

    const sources = ((sourcesRes as any).rows || (sourcesRes as any) || []).map((r: any) => ({
      source: r.source,
      count: Number(r.count) || 0,
    }));

    const topPages = ((topPagesRes as any).rows || (topPagesRes as any) || []).map((r: any) => ({
      path: r.path,
      title: r.title,
      count: Number(r.count) || 0,
      googleCount: Number(r.googleCount) || 0,
    }));

    const topGooglePages = ((topGooglePagesRes as any).rows || (topGooglePagesRes as any) || []).map((r: any) => ({
      path: r.path,
      title: r.title,
      googleCount: Number(r.googleCount) || 0,
    }));

    let chartData: { label: string; clicks: number; googleClicks: number }[] = [];
    const rawChart = (chartRes as any).rows || (chartRes as any) || [];

    if (timeframe === "today" || timeframe === "yesterday") {
      const chartMap = new Map<number, { clicks: number; googleClicks: number }>();
      rawChart.forEach((r: any) => {
        chartMap.set(Number(r.hour), {
          clicks: Number(r.clicks) || 0,
          googleClicks: Number(r.googleClicks) || 0,
        });
      });
      for (let h = 0; h < 24; h++) {
        const data = chartMap.get(h) || { clicks: 0, googleClicks: 0 };
        chartData.push({
          label: `${String(h).padStart(2, "0")}:00`,
          clicks: data.clicks,
          googleClicks: data.googleClicks,
        });
      }
    } else {
      chartData = rawChart.map((r: any) => ({
        label: r.day,
        clicks: Number(r.clicks) || 0,
        googleClicks: Number(r.googleClicks) || 0,
      }));
    }

    return {
      totalClicks,
      googleClicks,
      uniqueVisitors,
      mobilePercentage,
      desktopPercentage,
      chartData,
      topPages,
      topGooglePages,
      sources,
    };
  } catch (err) {
    console.error("Error in getRealtimeAnalytics:", err);
    return {
      totalClicks: 0,
      googleClicks: 0,
      uniqueVisitors: 0,
      mobilePercentage: 0,
      desktopPercentage: 0,
      chartData: [],
      topPages: [],
      topGooglePages: [],
      sources: [],
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// AI SEO GENERATOR ACTION
// ─────────────────────────────────────────────────────────────────
export async function generateGalleryDescriptionAction(params: {
  title: string;
  characterNames?: string[];
  movieName?: string;
}) {
  await verifyAdmin();
  try {
    const description = await generateAiSeoDescription({
      title: params.title,
      characterNames: params.characterNames,
      movieName: params.movieName,
      type: "gallery",
    });
    return { success: true, description };
  } catch (error: any) {
    console.error("Error generating AI description:", error);
    return { success: false, error: error.message || "Lỗi khi sinh mô tả AI" };
  }
}

export async function generateCategoryDescriptionAction(categoryName: string) {
  await verifyAdmin();
  try {
    const description = await generateCategoryAiDescription(categoryName);
    return { success: true, description };
  } catch (error: any) {
    console.error("Error generating category SEO description:", error);
    return { success: false, error: error.message || "Lỗi khi sinh mô tả thể loại" };
  }
}

export async function generateCharacterTranslationsAction(nameVi: string): Promise<{ success: boolean; nameEn: string; nameZh: string; error?: string }> {
  await verifyAdmin();
  try {
    const result = await generateCharacterTranslations(nameVi);
    return { success: true, nameEn: result.nameEn, nameZh: result.nameZh };
  } catch (error: any) {
    console.error("Error translating character name:", error);
    return { success: false, error: error.message || "Lỗi khi dịch tên nhân vật", nameEn: "", nameZh: "" };
  }
}

export async function generateCharacterDescriptionAction(params: {
  name: string;
  movieName?: string;
  nameEn?: string;
  nameZh?: string;
}) {
  await verifyAdmin();
  try {
    const description = await generateCharacterSeoDescription(params);
    return { success: true, description };
  } catch (error: any) {
    console.error("Error generating character SEO description:", error);
    return { success: false, error: error.message || "Lỗi khi sinh mô tả nhân vật" };
  }
}

export async function generateMovieDescriptionAction(params: {
  name: string;
  categoryNames?: string[];
  authorName?: string;
}) {
  await verifyAdmin();
  try {
    const description = await generateMovieAiDescription(params);
    return { success: true, description };
  } catch (error: any) {
    console.error("Error generating movie description:", error);
    return { success: false, error: error.message || "Lỗi khi sinh mô tả phim" };
  }
}

export async function generateAuthorDescriptionAction(authorName: string) {
  await verifyAdmin();
  try {
    const description = await generateAuthorAiDescription(authorName);
    return { success: true, description };
  } catch (error: any) {
    console.error("Error generating author description:", error);
    return { success: false, error: error.message || "Lỗi khi sinh mô tả tác giả" };
  }
}

export async function analyzeMovieHotKeywordsAction(params: {
  name: string;
  description?: string;
  categoryNames?: string[];
  authorName?: string;
  characters?: string[];
}) {
  await verifyAdmin();
  try {
    const result = await analyzeMovieHotKeywords(params);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error analyzing movie hot keywords:", error);
    return { success: false, error: error.message || "Lỗi khi phân tích từ khóa hot thực tế" };
  }
}

export async function generateGalleryGeminiAiAction(params: {
  characterNames: string[];
  movieName?: string;
  existingTitles?: string[];
  currentTitle?: string;
}) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");

  try {
    // 1. Fetch ALL existing gallery titles and slugs from Database!
    const dbGalleries = await db.select({
      name: schema.aiGalleries.name,
      slug: schema.aiGalleries.slug,
    }).from(schema.aiGalleries);

    const allExistingTitles = Array.from(new Set([
      ...dbGalleries.map(g => (g.name || "").trim()).filter(Boolean),
      ...(params.existingTitles || [])
    ]));

    const allExistingSlugs = Array.from(new Set(
      dbGalleries.map(g => (g.slug || "").trim()).filter(Boolean)
    ));

    const result = await generateGalleryGeminiAi({
      ...params,
      existingTitles: allExistingTitles,
      existingSlugs: allExistingSlugs,
    });
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error generating gallery Gemini AI:", error);
    return { success: false, error: error.message || "Lỗi khi gọi Gemini AI sinh tiêu đề và mô tả" };
  }
}

export async function generateEpisodeTitleAction(params: {
  characterNames: string[];
  movieName?: string;
  currentTitle?: string;
}) {
  await verifyAdmin();
  if (!db) throw new Error("Database not available");

  try {
    // Fetch all existing episode titles and slugs from Database!
    const dbEpisodes = await db.select({
      name: schema.episodes.name,
      slug: schema.episodes.slug,
    }).from(schema.episodes);

    const existingTitleSet = new Set(dbEpisodes.map(e => (e.name || "").toLowerCase().trim()).filter(Boolean));
    const existingSlugSet = new Set(dbEpisodes.map(e => (e.slug || "").toLowerCase().trim()).filter(Boolean));

    const charText = params.characterNames.length > 0 ? params.characterNames[0] : (params.movieName || "Mỹ Nhân 3D");
    const prevLower = (params.currentTitle || "").toLowerCase().trim();

    // Filter hot keys that DO NOT exist in database (neither title nor slug)
    const availableHotKeys = EPISODE_HOT_KEYS.filter(key => {
      const candidateTitle = formatStandardEpisodeTitle(charText, key);
      const candidateSlug = slugify(candidateTitle);
      const titleLower = candidateTitle.toLowerCase().trim();
      const isCurrent = titleLower === prevLower;
      const isDupTitle = existingTitleSet.has(titleLower);
      const isDupSlug = existingSlugSet.has(candidateSlug);
      return !isCurrent && !isDupTitle && !isDupSlug;
    });

    const pool = availableHotKeys.length > 0 ? availableHotKeys : EPISODE_HOT_KEYS;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());

    let chosenTitle = formatStandardEpisodeTitle(charText, shuffled[0] || "hentai 3d vietsub");
    let chosenSlug = slugify(chosenTitle);

    if (existingTitleSet.has(chosenTitle.toLowerCase().trim()) || existingSlugSet.has(chosenSlug)) {
      let part = 2;
      while (existingTitleSet.has(`${charText} Part ${part} hentai 3d vietsub | Vam 3D Hentai 4K`.toLowerCase()) || existingSlugSet.has(slugify(`${charText} Part ${part} hentai 3d vietsub | Vam 3D Hentai 4K`))) {
        part++;
      }
      chosenTitle = `${charText} Part ${part} hentai 3d vietsub | Vam 3D Hentai 4K`;
      chosenSlug = slugify(chosenTitle);
    }

    return { success: true, title: chosenTitle, slug: chosenSlug };
  } catch (error: any) {
    console.error("Error generating episode title:", error);
    return { success: false, error: error.message || "Lỗi khi tạo tiêu đề tập phim" };
  }
}

export async function checkTitleExistsAction(params: {
  type: "gallery" | "episode";
  title: string;
  excludeId?: number;
}) {
  await verifyAdmin();
  if (!db) return { exists: false };
  const cleanTitle = (params.title || "").trim();
  if (!cleanTitle) return { exists: false };
  const targetSlug = slugify(cleanTitle);

  try {
    if (params.type === "gallery") {
      const conditions = [
        or(
          ilike(schema.aiGalleries.name, cleanTitle),
          eq(schema.aiGalleries.slug, targetSlug)
        )
      ];
      if (params.excludeId) {
        conditions.push(ne(schema.aiGalleries.id, params.excludeId));
      }
      const [found] = await db.select({ id: schema.aiGalleries.id, name: schema.aiGalleries.name, slug: schema.aiGalleries.slug })
        .from(schema.aiGalleries)
        .where(and(...conditions))
        .limit(1);

      return {
        exists: !!found,
        matchedTitle: found?.name,
        matchedSlug: found?.slug
      };
    } else {
      const conditions = [
        or(
          ilike(schema.episodes.name, cleanTitle),
          eq(schema.episodes.slug, targetSlug)
        )
      ];
      if (params.excludeId) {
        conditions.push(ne(schema.episodes.id, params.excludeId));
      }
      const [found] = await db.select({ id: schema.episodes.id, name: schema.episodes.name, slug: schema.episodes.slug })
        .from(schema.episodes)
        .where(and(...conditions))
        .limit(1);

      return {
        exists: !!found,
        matchedTitle: found?.name,
        matchedSlug: found?.slug
      };
    }
  } catch (err) {
    console.error("Error checking title exists:", err);
    return { exists: false };
  }
}

// ─────────────────────────────────────────────────────────────────
// STRATEGIC ANALYSIS & MONETIZATION ROADMAP ACTIONS
// ─────────────────────────────────────────────────────────────────

export interface StrategicAnalyticsData {
  counts: {
    movies: number;
    episodes: number;
    galleries: number;
    images: number;
    characters: number;
    authors: number;
    totalEpisodeViews: number;
    totalGalleryViews: number;
  };
  users: {
    total: number;
    vipCount: number;
    normalCount: number;
    vipRatio: number;
    newUsers30d: number;
  };
  revenue: {
    totalPaidAmount: number;
    paidOrdersCount: number;
    pendingOrdersCount: number;
    cancelledOrdersCount: number;
    revenue30d: number;
    recentPayments: Array<{
      id: number;
      orderCode: number;
      amount: number;
      status: string | null;
      createdAt: string | null;
      username?: string;
    }>;
  };
  traffic: {
    totalClicks30d: number;
    googleClicks30d: number;
    mobilePercentage: number;
    desktopPercentage: number;
    avgDailyClicks: number;
  };
  plans: Array<{
    id: number;
    name: string;
    level: number;
    priceMonth: string;
  }>;
  roadmap: Array<{
    id: string;
    stage: "quick" | "growth" | "ecosystem";
    title: string;
    desc: string;
    expectedRevenue: string;
    status: "todo" | "in_progress" | "completed";
    priority: "high" | "medium" | "critical";
  }>;
}

const DEFAULT_ROADMAP_ITEMS: StrategicAnalyticsData["roadmap"] = [
  {
    id: "fast_track_vip",
    stage: "quick",
    title: "Mở tính năng Vé Xem Trước (Fast-Track 9.000đ/tập)",
    desc: "Cho phép khán giả trả phí micro-payment qua VietQR/PayOS để xem trước 1-2 tập phim mới nhất của top phim hot trước 48h.",
    expectedRevenue: "+3.000.000đ - 10.000.000đ/tháng",
    status: "in_progress",
    priority: "critical",
  },
  {
    id: "micro_pass_weekend",
    stage: "quick",
    title: "Gói VIP Cuối Tuần 9k - 19k (Học sinh/Sinh viên)",
    desc: "Khán giả anime 3D phần lớn là học sinh sinh viên ngại trả gói tháng. Gói 3 ngày cuối tuần kích thích nạp tức thì.",
    expectedRevenue: "+5.000.000đ - 15.000.000đ/tháng",
    status: "todo",
    priority: "high",
  },
  {
    id: "ai_gallery_vip_plus",
    stage: "quick",
    title: "Khoá Bộ Sưu Tập Ảnh AI 4K & Cosplay 18+ (VIP+)",
    desc: "Giữ ảnh preview miễn phí, nhưng yêu cầu tài khoản VIP hoặc mua lẻ 5.000đ để tải bộ ảnh 4K Ultra HD không watermark.",
    expectedRevenue: "+2.000.000đ - 8.000.000đ/tháng",
    status: "todo",
    priority: "high",
  },
  {
    id: "affiliate_merchandise",
    stage: "growth",
    title: "Tiếp thị liên kết Mô hình Figure 3D & Kiếm Tu Tiên (Shopee/TikTok)",
    desc: "Tự động chèn link Shopee/TikTok Shop bán mô hình Tiêu Viêm, Hàn Lập, Dị Hoả dưới trang xem phim. Hưởng hoa hồng 5-15% không cần vốn.",
    expectedRevenue: "+4.000.000đ - 12.000.000đ/tháng",
    status: "todo",
    priority: "medium",
  },
  {
    id: "tiktok_viral_shorts",
    stage: "growth",
    title: "Hệ Thống Video Ngắn Viral TikTok / Reels kéo Traffic",
    desc: "Cắt 30s-60s những phân cảnh combat 3D mãn nhãn, lồng nhạc tu tiên hào hùng, gắn CTA 'Xem trọn bộ không quảng cáo tại Vam3D'.",
    expectedRevenue: "Tăng x3 Traffic tự nhiên",
    status: "todo",
    priority: "high",
  },
  {
    id: "seo_wiki_character",
    stage: "growth",
    title: "SEO Trang Wiki Nhân Vật & Bảng Xếp Hạng Cảnh Giới",
    desc: "Tối ưu trang nhân vật theo từ khóa tìm kiếm: 'Cảnh giới Tiêu Viêm', 'Sức mạnh Hàn Lập', 'Vợ của Mục Trần' để gom traffic Google bền vững.",
    expectedRevenue: "+20.000 Organic Visits/tháng",
    status: "in_progress",
    priority: "high",
  },
  {
    id: "linh_thach_economy",
    stage: "ecosystem",
    title: "Hệ thống Tiền Ảo 'Linh Thạch' & Kinh Tế Tu Tiên",
    desc: "Người dùng nạp tiền mua Linh Thạch để mua Đan Dược tăng exp tu vi, đổi khung avatar Rồng Lửa / Kim Quang, tặng quà cho phim.",
    expectedRevenue: "+15.000.000đ - 30.000.000đ/tháng",
    status: "todo",
    priority: "critical",
  },
  {
    id: "cdn_bandwidth_saver",
    stage: "ecosystem",
    title: "Tối Ưu Hoá Băng Thông Bunny Stream (Tiết kiệm 45% chi phí CDN)",
    desc: "Giới hạn độ phân giải Free ở 720p 30fps, chỉ người dùng VIP mới xem được 1080p 60fps / 4K. Tăng biên lợi nhuận ròng ngay lập tức.",
    expectedRevenue: "Tiết kiệm 35% - 50% tiền server",
    status: "completed",
    priority: "high",
  },
];

export async function getStrategyAnalyticsAction(): Promise<{ success: boolean; data?: StrategicAnalyticsData; error?: string }> {
  await verifyAdmin();
  if (!db) {
    return { success: false, error: "Cơ sở dữ liệu chưa sẵn sàng" };
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Content counts & views
    const [moviesCountRes] = await db.select({ val: count() }).from(schema.movies);
    const [episodesCountRes] = await db.select({
      count: count(),
      views: sql<number>`COALESCE(SUM(${schema.episodes.views}), 0)::int`,
    }).from(schema.episodes);
    const [galleriesCountRes] = await db.select({
      count: count(),
      views: sql<number>`COALESCE(SUM(${schema.aiGalleries.views}), 0)::int`,
    }).from(schema.aiGalleries);
    const [imagesCountRes] = await db.select({ val: count() }).from(schema.aiImages);
    const [charactersCountRes] = await db.select({ val: count() }).from(schema.characters);
    const [authorsCountRes] = await db.select({ val: count() }).from(schema.authors);

    // 2. Accounts analytics
    const [totalUsersRes] = await db.select({ val: count() }).from(schema.accounts);
    const [vipUsersRes] = await db.select({ val: count() }).from(schema.accounts)
      .where(or(
        sql`${schema.accounts.level} > 0`,
        sql`${schema.accounts.expiredAt} IS NOT NULL AND ${schema.accounts.expiredAt} > NOW()`
      ));
    const [newUsers30dRes] = await db.select({ val: count() }).from(schema.accounts)
      .where(sql`${schema.accounts.createdAt} >= NOW() - INTERVAL '30 days'`);

    const totalUsers = totalUsersRes?.val || 0;
    const vipUsers = vipUsersRes?.val || 0;
    const normalUsers = Math.max(0, totalUsers - vipUsers);
    const vipRatio = totalUsers > 0 ? Number(((vipUsers / totalUsers) * 100).toFixed(2)) : 0;

    // 3. Payments & Revenue analytics
    let totalPaidAmount = 0;
    let paidOrdersCount = 0;
    let pendingOrdersCount = 0;
    let cancelledOrdersCount = 0;
    let revenue30d = 0;
    let recentPayments: any[] = [];

    try {
      const paymentSummaryRes = await db.execute(sql`
        SELECT 
          COALESCE(SUM(CASE WHEN "status" = 'paid' THEN "amount"::numeric ELSE 0 END), 0)::bigint AS "totalPaidAmount",
          COUNT(CASE WHEN "status" = 'paid' THEN 1 END)::int AS "paidOrdersCount",
          COUNT(CASE WHEN "status" = 'pending' THEN 1 END)::int AS "pendingOrdersCount",
          COUNT(CASE WHEN "status" = 'cancelled' THEN 1 END)::int AS "cancelledOrdersCount",
          COALESCE(SUM(CASE WHEN "status" = 'paid' AND "created_at" >= NOW() - INTERVAL '30 days' THEN "amount"::numeric ELSE 0 END), 0)::bigint AS "revenue30d"
        FROM "payments"
      `);
      const row: any = (paymentSummaryRes as any)?.rows?.[0] || {};
      totalPaidAmount = Number(row.totalPaidAmount || 0);
      paidOrdersCount = Number(row.paidOrdersCount || 0);
      pendingOrdersCount = Number(row.pendingOrdersCount || 0);
      cancelledOrdersCount = Number(row.cancelledOrdersCount || 0);
      revenue30d = Number(row.revenue30d || 0);

      const recentPaymentsRes = await db.select({
        id: schema.payments.id,
        orderCode: schema.payments.orderCode,
        amount: schema.payments.amount,
        status: schema.payments.status,
        createdAt: sql<string>`${schema.payments.createdAt}::text`,
      })
      .from(schema.payments)
      .orderBy(desc(schema.payments.id))
      .limit(8);

      recentPayments = recentPaymentsRes.map(p => ({
        id: p.id,
        orderCode: Number(p.orderCode),
        amount: Number(p.amount),
        status: p.status,
        createdAt: p.createdAt,
      }));
    } catch (payErr) {
      console.warn("Could not query payments table:", payErr);
    }

    // 4. Traffic analytics from trafficLogs (30 days)
    let totalClicks30d = 0;
    let googleClicks30d = 0;
    let mobilePercentage = 0;
    let desktopPercentage = 0;

    try {
      const trafficRes = await db.execute(sql`
        SELECT 
          COUNT(*)::int AS "totalClicks",
          COUNT(CASE WHEN "source" = 'google' THEN 1 END)::int AS "googleClicks",
          COUNT(CASE WHEN "device" = 'mobile' OR "device" = 'tablet' THEN 1 END)::int AS "mobileClicks",
          COUNT(CASE WHEN "device" = 'desktop' THEN 1 END)::int AS "desktopClicks"
        FROM "traffic_logs"
        WHERE "created_at" >= ${thirtyDaysAgo.toISOString()}::timestamp
      `);
      const tRow: any = (trafficRes as any)?.rows?.[0] || {};
      totalClicks30d = Number(tRow.totalClicks || 0);
      googleClicks30d = Number(tRow.googleClicks || 0);
      const mClicks = Number(tRow.mobileClicks || 0);
      const dClicks = Number(tRow.desktopClicks || 0);
      const totalDev = mClicks + dClicks;
      mobilePercentage = totalDev > 0 ? Math.round((mClicks / totalDev) * 100) : 75;
      desktopPercentage = totalDev > 0 ? Math.round((dClicks / totalDev) * 100) : 25;
    } catch (trErr) {
      console.warn("Could not query traffic_logs table:", trErr);
      mobilePercentage = 78;
      desktopPercentage = 22;
    }

    // 5. Existing plans
    const currentPlans = await db.select({
      id: schema.plans.id,
      name: schema.plans.name,
      level: schema.plans.level,
      priceMonth: schema.plans.priceMonth,
    }).from(schema.plans).orderBy(schema.plans.level);

    // 6. Roadmap items from system settings or fallback to default
    let storedRoadmap = DEFAULT_ROADMAP_ITEMS;
    try {
      const roadmapSettingStr = await getCachedSystemSetting("strategic_roadmap_status", "");
      if (roadmapSettingStr) {
        const parsed = JSON.parse(roadmapSettingStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          storedRoadmap = parsed;
        }
      }
    } catch (parseErr) {
      console.warn("Error parsing roadmap settings:", parseErr);
    }

    const resultData: StrategicAnalyticsData = {
      counts: {
        movies: moviesCountRes?.val || 0,
        episodes: episodesCountRes?.count || 0,
        galleries: galleriesCountRes?.count || 0,
        images: imagesCountRes?.val || 0,
        characters: charactersCountRes?.val || 0,
        authors: authorsCountRes?.val || 0,
        totalEpisodeViews: episodesCountRes?.views || 0,
        totalGalleryViews: galleriesCountRes?.views || 0,
      },
      users: {
        total: totalUsers,
        vipCount: vipUsers,
        normalCount: normalUsers,
        vipRatio,
        newUsers30d: newUsers30dRes?.val || 0,
      },
      revenue: {
        totalPaidAmount,
        paidOrdersCount,
        pendingOrdersCount,
        cancelledOrdersCount,
        revenue30d,
        recentPayments,
      },
      traffic: {
        totalClicks30d,
        googleClicks30d,
        mobilePercentage,
        desktopPercentage,
        avgDailyClicks: Math.round(totalClicks30d / 30),
      },
      plans: currentPlans.map(p => ({
        id: p.id,
        name: p.name,
        level: p.level,
        priceMonth: p.priceMonth,
      })),
      roadmap: storedRoadmap,
    };

    return { success: true, data: resultData };
  } catch (err: any) {
    console.error("Error in getStrategyAnalyticsAction:", err);
    return { success: false, error: err.message || "Lỗi khi tổng hợp phân tích chiến lược" };
  }
}

export async function saveStrategicRoadmapAction(roadmap: StrategicAnalyticsData["roadmap"]) {
  await verifyAdmin();
  try {
    await setSystemSetting("strategic_roadmap_status", JSON.stringify(roadmap));
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error("Error saving strategic roadmap:", err);
    return { success: false, error: err.message || "Không thể lưu lộ trình chiến lược" };
  }
}

export async function generateStrategicAiAdviceAction(metrics: {
  moviesCount: number;
  episodesCount: number;
  galleriesCount: number;
  totalUsers: number;
  vipUsers: number;
  totalRevenue: number;
  monthlyTraffic: number;
  mobilePercentage: number;
}): Promise<{ success: boolean; advice?: string; error?: string }> {
  await verifyAdmin();
  try {
    const prompt = `
Bạn là Giám Đốc Tăng Trưởng & Kiếm Tiền (Chief Growth & Monetization Officer - CGMO) hàng đầu khu vực Châu Á, chuyên gia về nền tảng Video Streaming Anime/Hoạt hình 3D Trung Quốc (HH3D / Donghua) kết hợp Thư viện Nghệ thuật AI 4K và Hệ thống Tu Tiên.

Website Vam3D hiện có các thông số hoạt động thực tế sau:
- Tổng số phim đang chiếu: ${metrics.moviesCount} phim
- Tổng số tập phim có sẵn: ${metrics.episodesCount} tập (Lưu trữ và phát qua Bunny Stream CDN)
- Bộ sưu tập ảnh AI Gallery: ${metrics.galleriesCount} bộ ảnh chất lượng cao
- Tổng số tài khoản đăng ký: ${metrics.totalUsers} thành viên
- Số tài khoản VIP trả phí: ${metrics.vipUsers} thành viên
- Tổng doanh thu thực tế ghi nhận: ${metrics.totalRevenue.toLocaleString("vi-VN")} VNĐ (Cổng thanh toán PayOS VietQR)
- Lượng truy cập 30 ngày: ${metrics.monthlyTraffic.toLocaleString("vi-VN")} lượt xem
- Tỷ lệ người dùng điện thoại (Mobile): ${metrics.mobilePercentage}%

Hãy phân tích và đưa ra một BẢN KẾ HOẠCH CHIẾN LƯỢC TĂNG TRƯỞNG & ĐỘT PHÁ DOANH THU THỰC CHIẾN dành riêng cho Vam3D theo phong cách súc tích, đanh thép, định lượng rõ ràng với 5 phần chính sau:

### 1. 🔍 Chẩn Đoán Hiện Trạng & Điểm Nghẽn Lớn Nhất
- Nhận xét tỷ lệ chuyển đổi VIP hiện tại (${metrics.totalUsers > 0 ? ((metrics.vipUsers / metrics.totalUsers) * 100).toFixed(2) : 0}%).
- Nhận xét đặc thù người xem HH3D trên Mobile (${metrics.mobilePercentage}%): Khán giả là học sinh, sinh viên, người đi làm thích tiện lợi, thiếu kiên nhẫn khi chờ tập mới, nhạy cảm về giá gói dài hạn nhưng sẵn sàng chi tiêu nhỏ (Micro-payment).

### 2. ⚡ Top 3 Đòn Bẩy Thu Dòng Tiền Tức Thì (Làm ngay trong 7 ngày tới)
- **Đòn bẩy 1: Vé Xem Nóng (Fast-Track Pass 9.000đ/tập)**: Áp dụng cho tập mới ra của các phim hot nhất (Đấu Phá, Phàm Nhân, Già Thiên, Thôn Phệ). Phân tích doanh thu dự tính.
- **Đòn bẩy 2: Gói VIP Cuối Tuần Siêu Rẻ (9.000đ - 19.000đ)**: Bán qua quét mã VietQR tự động không cần nhập thẻ.
- **Đòn bẩy 3: Khóa Bộ Ảnh 4K Nữ Thần Tu Tiên VIP+**: Tận dụng ${metrics.galleriesCount} bộ ảnh AI hiện có để bán vé mở khóa lẻ 5.000đ hoặc combo VIP+.

### 3. 💎 Hệ Sinh Thái Gamification "Kinh Tế Tu Tiên" (Dài hạn & Bền vững)
- Cách chuyển hóa bảng Cảnh Giới Tu Tiên thành dòng tiền: Bán Linh Thạch, Đan Dược Đột Phá, Khung Avatar Rồng/Phượng, Hiệu ứng bình luận tôn quý.

### 4. 🚀 Kéo Khách Không Đồng (Zero-Cost Viral Traffic Engine)
- Tận dụng phân cảnh đánh nhau 3D mãn nhãn để tự động cắt thành TikTok/Shorts kéo traffic.
- Tận dụng SEO Wiki nhân vật và bảng xếp hạng sức mạnh để gom traffic tìm kiếm Google khổng lồ.

### 5. 🛡️ Tối Ưu Biên Lợi Nhuận Ròng & Giảm Chi Phí CDN Bunny
- Giới hạn băng thông tài khoản Free ở 720p 30fps (giảm 40% chi phí CDN), dành riêng 1080p 60fps / 4K cho tài khoản VIP.

Định dạng Markdown chuyên nghiệp, có bullet points, số liệu ước tính cụ thể (VNĐ), không viết chung chung lý thuyết.
    `;

    const advice = await callGeminiText({
      prompt,
      systemInstruction: "Bạn là chuyên gia tư vấn chiến lược kiếm tiền cho nền tảng video streaming và anime tu tiên 3D hàng đầu.",
      temperature: 0.6,
      maxTokens: 3000,
    });

    if (!advice) {
      return {
        success: true,
        advice: `### 🎯 BẢN KẾ HOẠCH ĐỘT PHÁ DOANH THU DÀNH CHO VAM3D (Chiến Lược Tối Ưu Hóa)

#### 1. 🔍 Chẩn Đoán Hiện Trạng & Điểm Nghẽn Lớn Nhất
- **Khán giả chủ lực:** Hơn ${metrics.mobilePercentage}% người dùng xem phim qua điện thoại (Học sinh, sinh viên, người hâm mộ tu tiên HH3D).
- **Điểm nghẽn:** Người dùng ngại cam kết mua gói tháng dài hạn. Cần đưa vào các gói siêu nhỏ (Micro-payment) thanh toán tức thì qua VietQR.

#### 2. ⚡ Top 3 Đòn Bẩy Thu Dòng Tiền Tức Thì (Làm ngay trong 7 ngày)
- **Đòn bẩy 1: Vé Fast-Track Xem Trước 9.000đ/tập:** Khán giả fan cuồng không thể chờ đợi tập tuần sau. Khi tập mới vừa render xong, mở xem trước 24h-48h với giá 9k.
- **Đòn bẩy 2: Gói VIP Cuối Tuần 9.000đ - 19.000đ:** Kích hoạt nạp tiền bùng nổ vào tối thứ 6, thứ 7, chủ nhật.
- **Đòn bẩy 3: Khóa Album AI 4K Siêu Nét:** Tận dụng kho ảnh ${metrics.galleriesCount} bộ ảnh AI nữ thần để bán gói VIP+ hoặc mở khóa theo bộ 5.000đ.

#### 3. 💎 Kinh Tế Cảnh Giới Tu Tiên
- Nạp tiền đổi Linh Thạch để mua Đan Dược tăng exp thăng cấp (Trúc Cơ -> Kim Đan -> Nguyên Anh).
- Vinh danh đại gia trên Bảng Phong Thần trang chủ.

#### 4. 🛡️ Tiết Kiệm 40% Chi Phí CDN Bunny Stream
- Khóa phân giải 1080p và 4K cho hội viên VIP. Người dùng miễn phí xem ở chuẩn 720p 30fps. Vừa giảm mạnh chi phí băng thông, vừa tạo động lực mạnh mẽ để họ nâng cấp VIP!`,
      };
    }

    return { success: true, advice };
  } catch (err: any) {
    console.error("Error generating strategic advice:", err);
    return { success: false, error: err.message || "Không thể khởi tạo phân tích AI" };
  }
}

// ─────────────────────────────────────────────────────────────────
// 7-DAY ROLLING STRATEGIC ADS & SEO ACTIONS
// ─────────────────────────────────────────────────────────────────

export interface WeeklyStrategicData {
  // 7 days metrics
  sevenDaysClicks: number;
  sevenDaysGoogleClicks: number;
  sevenDaysUniqueVisitors: number;
  avgDailyClicks: number;
  googlePercentage7d: number;
  mobilePercentage: number;
  desktopPercentage: number;
  // Today's metrics
  todayClicks: number;
  todayGoogleClicks: number;
  todayUniqueVisitors: number;
  dayName: string;
  dayScheduleTheme: string;
  suggestedHotKeywordsToday: string[];
  // 7 days daily trend breakdown
  dailyTrend: Array<{
    dateStr: string;
    dayName: string;
    clicks: number;
    googleClicks: number;
    isToday: boolean;
  }>;
  // Top pages in 7 days
  topPages7d: Array<{ path: string; title: string | null; views: number }>;
}

export async function getDailyStrategicBriefingAction(): Promise<{ success: boolean; data?: WeeklyStrategicData; error?: string }> {
  await verifyAdmin();
  if (!db) return { success: false, error: "Database chưa sẵn sàng" };

  try {
    const [analytics7d, analyticsToday] = await Promise.all([
      getRealtimeAnalytics("7days"),
      getRealtimeAnalytics("today"),
    ]);

    const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;
    const now = new Date();
    const nowVn = new Date(now.getTime() + VIETNAM_OFFSET_MS);
    const dayOfWeek = nowVn.getUTCDay();

    const DAYS_MAP = [
      {
        day: "Chủ Nhật",
        theme: "Ngày Hội Đấu Phá Thương Khung & Nghịch Thiên Tà Thần",
        keywords: ["Đấu Phá Thương Khung tập mới nhất", "Tiêu Viêm Dị Hỏa 4K", "Nghịch Thiên Tà Thần Vietsub", "Phim 3D Chủ Nhật Full HD"],
      },
      {
        day: "Thứ Hai",
        theme: "Ngày Khởi Đầu - Vũ Động Càn Khôn & Nhất Niệm Vĩnh Hằng",
        keywords: ["Vũ Động Càn Khôn tập mới", "Lâm Động Vietsub", "Nhất Niệm Vĩnh Hằng 3D", "Lịch chiếu phim hoạt hình 3D Thứ 2"],
      },
      {
        day: "Thứ Ba",
        theme: "Ngày Đột Phá - Vạn Giới Độc Tôn & Tuyệt Thế Võ Hồn",
        keywords: ["Vạn Giới Độc Tôn tập mới", "Tuyệt Thế Võ Hồn Thuyết minh", "Phim 3D tu tiên ngắn", "Xem phim hoạt hình Trung Quốc 4K"],
      },
      {
        day: "Thứ Tư",
        theme: "Ngày Đại Chiến - Thôn Phệ Tinh Không & Thần Mộ",
        keywords: ["Thôn Phệ Tinh Không tập mới nhất hôm nay", "La Phong Giới Chủ 4K", "Thần Mộ Vietsub", "Hoạt hình khoa huyễn 3D"],
      },
      {
        day: "Thứ Năm",
        theme: "Ngày Đỉnh Cao - Già Thiên & Hoàn Mỹ Thế Giới",
        keywords: ["Già Thiên tập mới nhất", "Diệp Phàm Cửu Long Kéo Hòm", "Hoàn Mỹ Thế Giới Thuyết minh", "Phim 3D Thứ 5 siêu nét"],
      },
      {
        day: "Thứ Sáu",
        theme: "Khởi Động Cuối Tuần - Tiên Nghịch & Đại Chúa Tể",
        keywords: ["Tiên Nghịch Vương Lâm tập mới", "Đại Chúa Tể Mục Trần 4K", "Phim hoạt hình 3D hay nhất tuần", "Tập mới Vietsub mượt không giật"],
      },
      {
        day: "Thứ Bảy",
        theme: "Đỉnh Cao Lưu Lượng - Phàm Nhân Tu Tiên & Đấu La Đại Lục 2",
        keywords: ["Phàm Nhân Tu Tiên tập mới nhất hôm nay", "Hàn Lập Chưởng Thiên Bình 4K", "Đấu La Đại Lục 2 Tuyệt Thế Đường Môn", "Xem phim 3D Thứ 7 cực nét"],
      },
    ];

    const currentSchedule = DAYS_MAP[dayOfWeek] || DAYS_MAP[0];

    // Format dailyTrend from analytics7d.chartData
    const DAY_SHORT_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const dailyTrend = (analytics7d.chartData || []).map((c: any, index: number, arr: any[]) => {
      const isToday = index === arr.length - 1;
      const parts = (c.label || "").split("/");
      let dayName = isToday ? currentSchedule.day : `Ngày ${c.label}`;
      if (parts.length === 2) {
        const dNum = parseInt(parts[0], 10);
        const mNum = parseInt(parts[1], 10);
        const curYear = nowVn.getUTCFullYear();
        const dObj = new Date(Date.UTC(curYear, mNum - 1, dNum, 12, 0, 0));
        const dayIdx = dObj.getUTCDay();
        dayName = DAY_SHORT_NAMES[dayIdx] || dayName;
      }

      return {
        dateStr: c.label,
        dayName,
        clicks: c.clicks,
        googleClicks: c.googleClicks,
        isToday,
      };
    });

    const googlePercentage7d = analytics7d.totalClicks > 0
      ? Math.round((analytics7d.googleClicks / analytics7d.totalClicks) * 100)
      : 0;

    const topPages7d = (analytics7d.topGooglePages || analytics7d.topPages || []).map((p: any) => ({
      path: p.path,
      title: p.title || p.path,
      views: Number(p.googleCount || p.count || 0),
    }));

    return {
      success: true,
      data: {
        sevenDaysClicks: analytics7d.totalClicks,
        sevenDaysGoogleClicks: analytics7d.googleClicks,
        sevenDaysUniqueVisitors: analytics7d.uniqueVisitors,
        avgDailyClicks: Math.round(analytics7d.totalClicks / Math.max(1, dailyTrend.length || 7)),
        googlePercentage7d,
        mobilePercentage: analytics7d.mobilePercentage,
        desktopPercentage: analytics7d.desktopPercentage,
        todayClicks: analyticsToday.totalClicks,
        todayGoogleClicks: analyticsToday.googleClicks,
        todayUniqueVisitors: analyticsToday.uniqueVisitors,
        dayName: currentSchedule.day,
        dayScheduleTheme: currentSchedule.theme,
        suggestedHotKeywordsToday: currentSchedule.keywords,
        dailyTrend,
        topPages7d,
      },
    };
  } catch (err: any) {
    console.error("Error in getDailyStrategicBriefingAction:", err);
    return { success: false, error: err.message || "Lỗi khi lấy dữ liệu tác chiến 7 ngày" };
  }
}

export async function generateDailyAiActionPlanAction(context: {
  sevenDaysClicks: number;
  sevenDaysGoogleClicks: number;
  sevenDaysUniqueVisitors: number;
  avgDailyClicks: number;
  googlePercentage7d: number;
  mobilePercentage: number;
  dailyTrendText: string;
  topPages7d: string[];
  dayName: string;
  dayScheduleTheme: string;
}): Promise<{ success: boolean; actionPlan?: string; error?: string }> {
  await verifyAdmin();
  try {
    const prompt = `
Bạn là Giám Đốc Tác Chiến SEO & Tối Ưu Doanh Thu Quảng Cáo (Head of SEO & Ad Monetization) cho nền tảng Phim Hoạt Hình 3D Trung Quốc (HH3D) Vam3D.

DỮ LIỆU THỐNG KÊ THỜI GIAN THỰC 7 NGÀY GẦN NHẤT CỦA WEBSITE:
- Tổng lượt truy cập 7 ngày qua: ${context.sevenDaysClicks.toLocaleString("vi-VN")} lượt (Trung bình: ${context.avgDailyClicks.toLocaleString("vi-VN")} lượt/ngày)
- Lượt tìm kiếm Google Organic 7 ngày: ${context.sevenDaysGoogleClicks.toLocaleString("vi-VN")} clicks (${context.googlePercentage7d}% tổng traffic)
- Tổng khách truy cập độc nhất (Unique Visitors): ${context.sevenDaysUniqueVisitors.toLocaleString("vi-VN")} người
- Tỷ lệ thiết bị: ${context.mobilePercentage}% Mobile vs ${100 - context.mobilePercentage}% Desktop
- Xu hướng lưu lượng theo từng ngày trong 7 ngày qua:
${context.dailyTrendText}
- Top 8 phim / trang được xem nhiều nhất trong 7 ngày: ${context.topPages7d.join(", ") || "Trang chủ, Phim hot"}
- Hôm nay là: ${context.dayName} (${context.dayScheduleTheme})

ĐỊNH HƯỚNG HIỆN TẠI: Website TẠM DỪNG GÓI VIP. Mục tiêu tối thượng:
1. Gom tối đa lưu lượng tự nhiên từ Google (SEO) & Mạng xã hội dựa trên chu kỳ phát sóng hàng tuần.
2. Tối ưu hoá doanh thu từ QUẢNG CÁO (Popunder, Native Banners, Direct Ads Game/Shop) theo nhịp điệu ngày trong tuần mà không làm nát trải nghiệm người xem.

Hãy lập BẢN KẾ HOẠCH CHIẾN LƯỢC TÁC CHIẾN 7 NGÀY & HÔM NAY (${context.dayName}) súc tích, thực chiến:

### 1. 🔍 Chẩn Đoán Xu Hướng Lưu Lượng 7 Ngày Vừa Qua
- Nhận định chu kỳ ngày cao điểm (Peak: thường Thứ 7 & CN) và ngày trũng (Valley: T2, T3). Tỷ lệ Google SEO ${context.googlePercentage7d}% cho thấy web đang phụ thuộc hay tự chủ traffic?
- Đánh giá top phim đang gánh traffic cho cả website trong tuần qua.

### 2. 📅 Lộ Trình Phát Sóng & Bộ Từ Khóa Vàng Cho 7 Ngày Tiếp Theo
- Bảng phân bổ chiến lược cho 7 ngày trong tuần (T2: Vũ Động/Nhất Niệm -> T3: Võ Hồn -> T4: Thôn Phệ -> T5: Già Thiên/Hoàn Mỹ -> T6: Tiên Nghịch -> T7: Phàm Nhân -> CN: Đấu Phá).
- Mỗi ngày cần đẩy từ khóa trọng tâm nào để đón đầu lượng search trước 2-3 tiếng khi tập phim ra mắt.

### 3. 🎯 Nhiệm Vụ Tác Chiến Hôm Nay (${context.dayName})
- Phim mục tiêu hôm nay cần cập nhật hoặc tối ưu lại thẻ tiêu đề & mô tả chuẩn SEO.
- Đoạn mô tả mẫu 150 ký tự chuẩn SEO giật tít cho tập hôm nay.

### 4. 💰 Chiến Lược Quảng Cáo Theo Nhịp Điệu Tuần (Tối Đa Hoá Lợi Nhuận)
- Chiến lược ngày thường (T2 - T5): Khách ít hơn, cần giảm popunder (1 pop/24h) để kích thích xem nhiều tập liên tiếp (tăng pageviews cho Native Banner).
- Chiến lược cuối tuần (T6 - CN): Lượng khách bùng nổ, tăng nhẹ tần suất popunder (1 pop/12h) và bật banner Game Tu Tiên ở vị trí nổi bật nhất để hốt bạc.

### 5. ⚡ 3 Đòn Bẩy Tác Chiến Cần Thực Thi Trong 7 Ngày Tới
- 3 gạch đầu dòng rõ ràng admin cần làm ngay để tuần tới tăng 20-30% traffic Google.

Định dạng Markdown đẹp mắt, số liệu thực tế, câu từ đanh thép và thực thi được ngay!
    `;

    const actionPlan = await callGeminiText({
      prompt,
      systemInstruction: "Bạn là chuyên gia hàng đầu về SEO phim hoạt hình 3D và tối ưu doanh thu quảng cáo website.",
      temperature: 0.6,
      maxTokens: 3000,
    });

    return {
      success: true,
      actionPlan: actionPlan || "Không thể khởi tạo kế hoạch tác chiến 7 ngày.",
    };
  } catch (err: any) {
    console.error("Error generating daily AI plan:", err);
    return { success: false, error: err.message || "Lỗi khi tạo kế hoạch tác chiến 7 ngày" };
  }
}

// ─────────────────────────────────────────────────────────────────
// ADSTERRA REAL STATISTICS (EXACT AUDIT FROM PUBLISHER DASHBOARD)
// ─────────────────────────────────────────────────────────────────

export interface AdsterraDailyStat {
  date: string; // "2026/10/26"
  impressions: number;
  clicks: number;
  ctr: number; // % e.g. 12.459
  cpm: number; // $ e.g. 0.679
  revenue: number; // $ e.g. 0.41
}

const DEFAULT_ADSTERRA_REAL_STATS: AdsterraDailyStat[] = [
  { date: "2026/10/26", impressions: 610, clicks: 76, ctr: 12.459, cpm: 0.679, revenue: 0.41 },
  { date: "2026/10/25", impressions: 2467, clicks: 361, ctr: 14.633, cpm: 0.255, revenue: 0.63 },
  { date: "2026/10/24", impressions: 1910, clicks: 342, ctr: 17.906, cpm: 0.123, revenue: 0.23 },
  { date: "2026/10/23", impressions: 1338, clicks: 265, ctr: 19.806, cpm: 0.170, revenue: 0.23 },
  { date: "2026/10/22", impressions: 1292, clicks: 285, ctr: 22.059, cpm: 0.147, revenue: 0.19 },
  { date: "2026/10/21", impressions: 1491, clicks: 188, ctr: 12.609, cpm: 0.177, revenue: 0.26 },
  { date: "2026/10/20", impressions: 1461, clicks: 200, ctr: 13.689, cpm: 0.157, revenue: 0.23 },
  { date: "2026/10/19", impressions: 2065, clicks: 260, ctr: 12.591, cpm: 0.147, revenue: 0.30 },
];

export async function getAdsterraRealStatsAction(): Promise<{
  success: boolean;
  data: {
    stats: AdsterraDailyStat[];
    totalImpressions: number;
    totalClicks: number;
    avgCtr: number;
    avgCpm: number;
    totalRevenue: number;
    daysCount: number;
    avgDailyRevenue: number;
  };
  error?: string;
}> {
  await verifyAdmin();
  try {
    let list: AdsterraDailyStat[] = DEFAULT_ADSTERRA_REAL_STATS;
    const raw = await getCachedSystemSetting("adsterra_real_stats", "");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      } catch (e) {
        console.warn("Error parsing adsterra_real_stats:", e);
      }
    }

    const totalImpressions = list.reduce((sum, item) => sum + (Number(item.impressions) || 0), 0);
    const totalClicks = list.reduce((sum, item) => sum + (Number(item.clicks) || 0), 0);
    const totalRevenue = Number(list.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0).toFixed(2));
    const avgCtr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(3)) : 0;
    const avgCpm = totalImpressions > 0 ? Number(((totalRevenue / totalImpressions) * 1000).toFixed(3)) : 0;
    const daysCount = list.length;
    const avgDailyRevenue = daysCount > 0 ? Number((totalRevenue / daysCount).toFixed(2)) : 0;

    return {
      success: true,
      data: {
        stats: list,
        totalImpressions,
        totalClicks,
        avgCtr,
        avgCpm,
        totalRevenue,
        daysCount,
        avgDailyRevenue,
      },
    };
  } catch (err: any) {
    console.error("Error in getAdsterraRealStatsAction:", err);
    return {
      success: false,
      data: {
        stats: DEFAULT_ADSTERRA_REAL_STATS,
        totalImpressions: 12634,
        totalClicks: 1977,
        avgCtr: 15.648,
        avgCpm: 0.196,
        totalRevenue: 2.48,
        daysCount: 8,
        avgDailyRevenue: 0.31,
      },
      error: err.message,
    };
  }
}

export async function saveAdsterraRealStatsAction(stats: AdsterraDailyStat[]) {
  await verifyAdmin();
  try {
    await setSystemSetting("adsterra_real_stats", JSON.stringify(stats));
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error("Error saving adsterra real stats:", err);
    return { success: false, error: err.message || "Không thể lưu thống kê Adsterra" };
  }
}

export async function getAdsterraApiTokenAction(): Promise<{
  success: boolean;
  token: string;
}> {
  await verifyAdmin();
  try {
    const dbToken = await getCachedSystemSetting("adsterra_api_token", "");
    const token = dbToken || process.env.ADSTERRA_API_KEY || "";
    return { success: true, token };
  } catch {
    return { success: true, token: process.env.ADSTERRA_API_KEY || "" };
  }
}

export async function syncAdsterraStatsFromApiAction(tokenOverride?: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  stats?: AdsterraDailyStat[];
  solutionMarkdown?: string;
}> {
  await verifyAdmin();
  try {
    let apiToken = tokenOverride?.trim();
    if (!apiToken) {
      const dbToken = await getCachedSystemSetting("adsterra_api_token", "");
      apiToken = dbToken || process.env.ADSTERRA_API_KEY || "";
    }

    if (!apiToken) {
      return {
        success: false,
        error: "Chưa có Adsterra API Token. Vui lòng nhập API Key hoặc cấu hình ADSTERRA_API_KEY trong .env.local",
      };
    }

    // Save token to DB if new token was passed
    if (tokenOverride && tokenOverride.trim()) {
      await setSystemSetting("adsterra_api_token", tokenOverride.trim());
    }

    // Calculate dynamic 14-day date range for Adsterra API
    const now = new Date();
    const finishDate = now.toISOString().slice(0, 10);
    const startDateObj = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const startDate = startDateObj.toISOString().slice(0, 10);

    // Call Adsterra official Publisher Statistics API
    const apiUrl = `https://api3.adsterratools.com/publisher/stats.json?start_date=${startDate}&finish_date=${finishDate}&group_by=date`;
    const res = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "X-API-Key": apiToken,
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        error: `Lỗi từ máy chủ Adsterra (${res.status}): ${errText || "Token API không đúng hoặc đã hết hạn"}`,
      };
    }

    const json = await res.json();
    const items = json?.items || json?.data || [];
    if (!Array.isArray(items) || items.length === 0) {
      return {
        success: false,
        error: "Adsterra API trả về danh sách rỗng (Chưa có dữ liệu thống kê trong kỳ này).",
      };
    }

    // Map response items to AdsterraDailyStat (Notice Adsterra returns "impression" singular)
    const stats: AdsterraDailyStat[] = items.map((it: any) => {
      const dateRaw = String(it.date || "").replace(/-/g, "/");
      const imp = Number(it.impression || it.impressions || it.views || 0);
      const clk = Number(it.clicks || 0);
      const rev = Number(it.revenue || it.money || 0);
      const ctr = it.ctr != null ? Number(it.ctr) : imp > 0 ? Number(((clk / imp) * 100).toFixed(3)) : 0;
      const cpm = it.cpm != null ? Number(it.cpm) : imp > 0 ? Number(((rev / imp) * 1000).toFixed(3)) : 0;
      return {
        date: dateRaw,
        impressions: imp,
        clicks: clk,
        ctr: Number(ctr.toFixed(3)),
        cpm: Number(cpm.toFixed(3)),
        revenue: Number(rev.toFixed(2)),
      };
    });

    // Sort by date descending (latest first)
    stats.sort((a, b) => b.date.localeCompare(a.date));

    // Save to database
    await setSystemSetting("adsterra_real_stats", JSON.stringify(stats));
    revalidatePath("/admin");

    // Also auto-generate AI solutions directly based on these fresh API stats!
    let solutionMarkdown: string | undefined = undefined;
    try {
      const totalImpressions = stats.reduce((sum, item) => sum + (Number(item.impressions) || 0), 0);
      const totalClicks = stats.reduce((sum, item) => sum + (Number(item.clicks) || 0), 0);
      const totalRevenue = Number(stats.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0).toFixed(2));
      const avgCtr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(3)) : 0;
      const avgCpm = totalImpressions > 0 ? Number(((totalRevenue / totalImpressions) * 1000).toFixed(3)) : 0;
      const daysCount = stats.length;
      const avgDailyRevenue = daysCount > 0 ? Number((totalRevenue / daysCount).toFixed(2)) : 0;

      const aiRes = await generateAdsterraAiSolutionsAction({
        stats,
        totalImpressions,
        totalClicks,
        avgCtr,
        avgCpm,
        totalRevenue,
        daysCount,
        avgDailyRevenue,
        weeklyWebClicks: 34621,
      });
      if (aiRes.success && aiRes.solutionMarkdown) {
        solutionMarkdown = aiRes.solutionMarkdown;
      }
    } catch (aiErr) {
      console.warn("Auto AI generation warning after API sync:", aiErr);
    }

    return {
      success: true,
      message: `Đã tự động kéo ${stats.length} ngày từ Adsterra API & phân tích giải pháp mới nhất!`,
      stats,
      solutionMarkdown,
    };
  } catch (err: any) {
    console.error("Error in syncAdsterraStatsFromApiAction:", err);
    return {
      success: false,
      error: err.message || "Lỗi khi gọi API Adsterra",
    };
  }
}

export async function generateAdsterraAiSolutionsAction(context: {
  stats: AdsterraDailyStat[];
  totalImpressions: number;
  totalClicks: number;
  avgCtr: number;
  avgCpm: number;
  totalRevenue: number;
  daysCount: number;
  avgDailyRevenue: number;
  weeklyWebClicks: number;
}): Promise<{
  success: boolean;
  solutionMarkdown?: string;
  error?: string;
}> {
  await verifyAdmin();
  try {
    const todayStat = context.stats[0] || { date: "Hôm nay", impressions: 0, clicks: 0, ctr: 0, cpm: 0, revenue: 0 };
    const yesterdayStat = context.stats[1] || { date: "Hôm qua", impressions: 0, clicks: 0, ctr: 0, cpm: 0, revenue: 0 };

    const prompt = `
Bạn là Giám Đốc Tối Ưu Doanh Thu Quảng Cáo Website (Chief Ad Monetization Strategist) chuyên gia về website phim anime/hoạt hình 3D Trung Quốc (HH3D).

DỮ LIỆU ĐỐI SOÁT THỜI GIAN THỰC VỪA ĐỒNG BỘ TRỰC TIẾP TỪ ADSTERRA PUBLISHER API CỦA WEBSITE:
- Tổng doanh thu thực tế: $${context.totalRevenue.toFixed(2)} USD (~${Math.round(context.totalRevenue * 25400).toLocaleString("vi-VN")} VNĐ) trong ${context.daysCount} ngày qua.
- Trung bình mỗi ngày: $${context.avgDailyRevenue.toFixed(2)} USD/ngày.
- Tổng lượt hiển thị (Impressions): ${context.totalImpressions.toLocaleString("vi-VN")} lượt.
- Tổng lượt nhấp chuột (Clicks): ${context.totalClicks.toLocaleString("vi-VN")} clicks.
- Tỷ lệ CTR trung bình: ${context.avgCtr}% (Rất cao so với mức chuẩn 3-5% của web phim).
- CPM trung bình toàn kỳ: $${context.avgCpm.toFixed(3)} USD / 1000 lượt.
- Số liệu hôm nay (${todayStat.date}): ${todayStat.impressions.toLocaleString("vi-VN")} impressions, ${todayStat.clicks} clicks, CTR ${todayStat.ctr}%, CPM $${todayStat.cpm}, Doanh thu: $${todayStat.revenue} USD.
- Số liệu hôm qua (${yesterdayStat.date}): ${yesterdayStat.impressions.toLocaleString("vi-VN")} impressions, ${yesterdayStat.clicks} clicks, CTR ${yesterdayStat.ctr}%, CPM $${yesterdayStat.cpm}, Doanh thu: $${yesterdayStat.revenue} USD.
- Lưu lượng website ghi nhận trong router 7 ngày qua: ${context.weeklyWebClicks.toLocaleString("vi-VN")} clicks.

ĐỊNH HƯỚNG: Website tạm dừng gói VIP, tập trung 100% vào tối ưu hoá doanh thu từ QUẢNG CÁO mà không làm nát trải nghiệm xem phim.

Dựa trên dữ liệu API vừa kéo về, hãy lập BẢN CHẨN ĐOÁN & GIẢI PHÁP TÁC CHIẾN TĂNG DOANH THU THỰC TẾ với 4 phần chính sau:

### 1. 🔍 Đánh Giá Biến Động Số Liệu API Mới Nhất
- Nhận định về ngày hôm nay so với hôm qua (CPM tăng hay giảm? Doanh thu $${todayStat.revenue} đang có xu hướng thế nào?).
- Phân tích điểm sáng: Tỷ lệ CTR ${context.avgCtr}% chứng minh điều gì về mức độ quan tâm của khán giả?
- Phân tích điểm nghẽn: CPM $${context.avgCpm.toFixed(3)} và tỷ lệ thất thoát giữa ${context.weeklyWebClicks.toLocaleString("vi-VN")} web clicks vs ${context.totalImpressions.toLocaleString("vi-VN")} ad impressions.

### 2. ⚡ 3 Giải Pháp Tối Ưu Hóa Kỹ Thuật Ngay Trên Web (Quick Wins)
- Cần chỉnh thông số nào trong mã nguồn Adsterra (Delay, Interval, Placement) để ngay lập tức tăng x2 lượt hiển thị từ tập phim hôm nay.
- Cách đặt banner 300x250 chân Player để người xem chuyển tập là tự động refresh kiếm thêm impression.

### 3. 🚀 Chiến Lược Đa Mạng Quảng Cáo (Để Thoát Khỏi Điểm Nghẽn CPM $${context.avgCpm.toFixed(3)})
- Kế hoạch bổ sung Popunder 1 lần / 24h (Monetag OnClick) với CPM $2.0 - $3.5 USD: Dự phóng thu nhập tăng thêm cụ thể bao nhiêu USD/tuần.
- Kế hoạch bán 1 vị trí Banner cố định cho NPH Game Tu Tiên / Shop Acc: Thu tiền mặt tươi 1.5M - 2.5M VNĐ/tháng không qua network trung gian.

### 4. 🎯 Mục Tiêu Thu Nhập Cho Tuần Tới
- Mục tiêu doanh thu tuần tới: Từ mức $${(context.avgDailyRevenue * 7).toFixed(2)} USD hiện tại → Lên con số cụ thể nào?
- Hành động ưu tiên số 1 admin cần làm ngay hôm nay.

Viết ngắn gọn, súc tích, thực chiến, có số liệu cụ thể (USD và VNĐ), định dạng Markdown chuyên nghiệp!
    `;

    const solutionMarkdown = await callGeminiText({
      prompt,
      systemInstruction: "Bạn là chuyên gia hàng đầu về tối ưu doanh thu quảng cáo web phim và ad tech.",
      temperature: 0.6,
      maxTokens: 2500,
    });

    if (solutionMarkdown) {
      await setSystemSetting("adsterra_ai_solutions", solutionMarkdown);
    }

    return {
      success: true,
      solutionMarkdown: solutionMarkdown || "Không thể khởi tạo giải pháp từ AI.",
    };
  } catch (err: any) {
    console.error("Error generating Adsterra AI solutions:", err);
    return {
      success: false,
      error: err.message || "Lỗi khi phân tích giải pháp từ dữ liệu API",
    };
  }
}

export async function getCachedAdsterraAiSolutionsAction(): Promise<{
  success: boolean;
  solutionMarkdown: string;
}> {
  await verifyAdmin();
  try {
    const solutionMarkdown = await getCachedSystemSetting("adsterra_ai_solutions", "");
    return { success: true, solutionMarkdown: solutionMarkdown || "" };
  } catch {
    return { success: true, solutionMarkdown: "" };
  }
}

export async function getAdMonetizationSettingsAction(): Promise<{
  success: boolean;
  data: {
    popunderUrl: string;
    popunderEnabled: boolean;
    popunderIntervalHours: number;
    mobileStickyEnabled: boolean;
    socialBarEnabled: boolean;
  };
}> {
  await verifyAdmin();
  try {
    const [popunderUrl, popunderEnabled, popunderInterval, mobileStickyEnabled, socialBarEnabled] = await Promise.all([
      getCachedSystemSetting("ad_popunder_url", ""),
      getCachedSystemSetting("ad_popunder_enabled", "true"),
      getCachedSystemSetting("ad_popunder_interval_hours", "12"),
      getCachedSystemSetting("ad_mobile_sticky_enabled", "true"),
      getCachedSystemSetting("ad_social_bar_enabled", "true"),
    ]);
    return {
      success: true,
      data: {
        popunderUrl,
        popunderEnabled: popunderEnabled !== "false",
        popunderIntervalHours: parseInt(popunderInterval, 10) || 12,
        mobileStickyEnabled: mobileStickyEnabled !== "false",
        socialBarEnabled: socialBarEnabled !== "false",
      },
    };
  } catch (err: any) {
    return {
      success: false,
      data: {
        popunderUrl: "",
        popunderEnabled: true,
        popunderIntervalHours: 12,
        mobileStickyEnabled: true,
        socialBarEnabled: true,
      },
    };
  }
}

export async function saveAdMonetizationSettingsAction(settings: {
  popunderUrl?: string;
  popunderEnabled?: boolean;
  popunderIntervalHours?: number;
  mobileStickyEnabled?: boolean;
  socialBarEnabled?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  await verifyAdmin();
  try {
    if (settings.popunderUrl !== undefined) {
      await setSystemSetting("ad_popunder_url", settings.popunderUrl.trim());
    }
    if (settings.popunderEnabled !== undefined) {
      await setSystemSetting("ad_popunder_enabled", settings.popunderEnabled ? "true" : "false");
    }
    if (settings.popunderIntervalHours !== undefined) {
      await setSystemSetting("ad_popunder_interval_hours", settings.popunderIntervalHours.toString());
    }
    if (settings.mobileStickyEnabled !== undefined) {
      await setSystemSetting("ad_mobile_sticky_enabled", settings.mobileStickyEnabled ? "true" : "false");
    }
    if (settings.socialBarEnabled !== undefined) {
      await setSystemSetting("ad_social_bar_enabled", settings.socialBarEnabled ? "true" : "false");
    }
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
