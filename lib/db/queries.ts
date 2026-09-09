import { db, schema } from "./index";
import { eq, and, or, ilike, inArray, count, isNull, desc, asc, notInArray, ne, sql } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import { cache } from "react";

// ─── Get All Movies ─────────────────────────────────────────────────────────
export const getAllMovies = cache(async (limit = 100) => {
  try {
    if (!db) return [];

    const result = await db.query.movies.findMany({
      where: (movies, { eq }) => eq(movies.status, 1),
      orderBy: (movies, { desc }) => [desc(movies.id)],
      limit,
      with: {
        author: true,
        movieCategories: { with: { category: true } },
        episodes: {
          limit: 1,
          orderBy: (ep, { asc }) => [asc(ep.id)],
        },
      },
    });

    return result.map((m: any) => ({
      ...m,
      movieActors: [],
    }));
  } catch (err) {
    console.error("Error in getAllMovies:", err);
    return [];
  }
});

// ─── Get Hot Movies ──────────────────────────────────────────────────────────
export const getHotMovies = cache(async () => {
  try {
    if (!db) return [];

    const result = await db.query.movies.findMany({
      where: (movies, { eq }) => eq(movies.status, 1),
      orderBy: (movies, { desc }) => [desc(movies.id)],
      limit: 6,
      with: {
        author: true,
        movieCategories: { with: { category: true } },
        episodes: {
          limit: 1,
          orderBy: (ep, { asc }) => [asc(ep.id)],
        },
      },
    });

    return result;
  } catch (err) {
    console.error("Error in getHotMovies:", err);
    return [];
  }
});

// ─── Get Movies by Category slug or name ────────────────────────────────────
export const getMoviesByCategory = cache(async (categoryIdentifier: string) => {
  try {
    if (!db) return [];

    const decoded = decodeURIComponent(categoryIdentifier).trim();
    const inputSlug = slugify(decoded);

    // Find category ID first
    const cat = await db.query.categories.findFirst({
      where: (c, { eq, or, ilike }) =>
        or(eq(c.slug, inputSlug), ilike(c.name, decoded), eq(c.slug, decoded)),
      columns: { id: true },
    });

    if (!cat) return [];

    // Query movies associated with this category
    const movieCategoryLinks = await db
      .select({ idMovie: schema.movieCategory.idMovie })
      .from(schema.movieCategory)
      .where(eq(schema.movieCategory.idCategory, cat.id));

    const movieIds = movieCategoryLinks
      .map((mc) => mc.idMovie)
      .filter((id): id is number => typeof id === "number");
    if (movieIds.length === 0) return [];

    const result = await db.query.movies.findMany({
      where: (movies, { and, eq, inArray }) =>
        and(eq(movies.status, 1), inArray(movies.id, movieIds)),
      orderBy: (movies, { desc }) => [desc(movies.id)],
      with: {
        movieCategories: {
          with: { category: true },
        },
        episodes: { limit: 1, orderBy: (ep, { asc }) => [asc(ep.id)] },
      },
    });

    return result;
  } catch (err) {
    console.error("Error in getMoviesByCategory:", err);
    return [];
  }
});

// ─── Get Single Movie by ID or Slug ─────────────────────────────────────────
export const getMovieById = cache(async (id: string) => {
  try {
    if (!db) return null;

    const trimmedId = id ? decodeURIComponent(id).trim() : "";
    if (!trimmedId) return null;

    const isNumeric = /^\d+$/.test(trimmedId);
    const numericId = isNumeric ? parseInt(trimmedId, 10) : -1;
    const targetSlug = slugify(trimmedId);

    const result = await db.query.movies.findFirst({
      where: (movies, { eq, or, ilike }) => {
        if (isNumeric) {
          return or(eq(movies.id, numericId), eq(movies.slug, trimmedId), eq(movies.slug, targetSlug), ilike(movies.name, `%${trimmedId}%`));
        }
        return or(eq(movies.slug, trimmedId), eq(movies.slug, targetSlug), ilike(movies.name, `%${trimmedId}%`));
      },
      with: {
        author: true,
        movieCategories: { with: { category: true } },
        episodes: {
          orderBy: (ep, { asc }) => [asc(ep.id)],
          with: {
            episodesActors: { with: { actor: true } },
            episodesCharacters: { with: { character: true } },
            plan: true,
          },
        },
        aiGalleries: {
          where: (g, { eq }) => eq(g.status, 1),
          orderBy: (g, { desc }) => [desc(g.id)],
          limit: 12,
          with: {
            galleryCharacters: {
              with: { character: { columns: { id: true, name: true, slug: true } } },
            },
            images: {
              orderBy: (img, { asc }) => [asc(img.id)],
              columns: { id: true, imgUrl: true },
            },
            plan: true,
          },
        },
      },
    });

    if (!result) return null;

    const uniqueActors = new Map<number, any>();
    const uniqueCharacters = new Map<number, any>();
    result.episodes?.forEach((ep: any) => {
      ep.episodesActors?.forEach((ea: any) => {
        if (ea.actor) uniqueActors.set(ea.actor.id, ea.actor);
      });
      ep.episodesCharacters?.forEach((ec: any) => {
        if (ec.character) uniqueCharacters.set(ec.character.id, ec.character);
      });
    });

    return {
      ...result,
      aiGalleries: (result.aiGalleries || []).map((g: any) => ({
        ...g,
        imageCount: g.images?.length || 0,
        slug: g.slug || slugify(g.name) || g.id.toString(),
      })),
      movieActors: Array.from(uniqueActors.values()).map((actor) => ({ actor })),
      movieCharacters: Array.from(uniqueCharacters.values()).map((character) => ({ character })),
    };
  } catch (err) {
    console.error("Error in getMovieById:", err);
    return null;
  }
});

// ─── Get Top Ranked Movies ───────────────────────────────────────────────────
export const getTopMovies = cache(async (limit = 6) => {
  try {
    if (!db) return [];

    const result = await db.query.movies.findMany({
      where: (movies, { eq }) => eq(movies.status, 1),
      orderBy: (movies, { desc }) => [desc(movies.id)],
      limit,
      columns: { id: true, name: true, slug: true, imgUrl: true, createdAt: true },
    });

    return result;
  } catch (err) {
    console.error("Error in getTopMovies:", err);
    return [];
  }
});

// ─── Get All Categories ──────────────────────────────────────────────────────
export const getAllCategories = cache(async () => {
  try {
    if (!db) return [];

    return await db.query.categories.findMany({
      where: (cats, { eq }) => eq(cats.status, 1),
    });
  } catch (err) {
    console.error("Error in getAllCategories:", err);
    return [];
  }
});

// ─── Get All Plans (Subscription tiers) ─────────────────────────────────────
export const getAllPlans = cache(async () => {
  try {
    if (!db) return [];

    return await db.query.plans.findMany({
      where: (plans, { eq }) => eq(plans.status, 1),
      orderBy: (plans, { asc }) => [asc(plans.level)],
      with: {
        features: true,
        packages: {
          orderBy: (p, { asc }) => [asc(p.time)],
        },
      },
    });
  } catch (err) {
    console.error("Error in getAllPlans:", err);
    return [];
  }
});

// ─── Get Latest Episodes ─────────────────────────────────────────────────────
export async function getLatestEpisodes(limit = 12) {
  try {
    if (!db) return [];

    const result = await db.query.episodes.findMany({
      where: (ep, { eq }) => eq(ep.status, 1),
      orderBy: (ep, { desc }) => [desc(ep.id)],
      limit,
      with: {
        movie: {
          with: {
            movieCategories: { with: { category: true } },
          },
        },
        plan: true,
      },
    });

    return result;
  } catch (err) {
    console.error("Error in getLatestEpisodes:", err);
    return [];
  }
}

// ─── Get Most Viewed Episodes ─────────────────────────────────────────────────
export async function getMostViewedEpisodes(limit = 12) {
  try {
    if (!db) return [];

    const result = await db.query.episodes.findMany({
      where: (ep, { eq, gt, and }) => and(eq(ep.status, 1), gt(ep.views, 0)),
      orderBy: (ep, { desc }) => [desc(ep.views)],
      limit,
      with: {
        movie: {
          with: {
            movieCategories: { with: { category: true } },
          },
        },
        plan: true,
      },
    });

    return result;
  } catch (err) {
    console.error("Error in getMostViewedEpisodes:", err);
    return [];
  }
}

// ─── Get Recommended Episodes (Same Movie or Latest) ───────────────────────
export async function getRecommendedEpisodes(currentEpisodeId: number, currentMovieId: number, limit = 8) {
  try {
    if (!db) return [];

    // 1. Fetch other episodes of the same movie first
    const sameMovieEps = await db.query.episodes.findMany({
      where: (ep, { eq, and, ne }) =>
        and(eq(ep.status, 1), eq(ep.idMovie, currentMovieId), ne(ep.id, currentEpisodeId)),
      orderBy: (ep, { asc }) => [asc(ep.id)],
      limit,
      with: {
        movie: {
          with: {
            movieCategories: { with: { category: true } },
          },
        },
        plan: true,
      },
    });

    if (sameMovieEps.length >= limit) {
      return sameMovieEps.slice(0, limit);
    }

    const remainingSlots = limit - sameMovieEps.length;
    const excludeIds = [currentEpisodeId, ...sameMovieEps.map((e: any) => e.id)];

    // 2. Fetch latest episodes to fill remaining slots
    const fallbackEps = await db.query.episodes.findMany({
      where: (ep, { eq, and, notInArray }) =>
        and(eq(ep.status, 1), notInArray(ep.id, excludeIds)),
      limit: remainingSlots,
      orderBy: (ep, { desc }) => [desc(ep.id)],
      with: {
        movie: {
          with: {
            movieCategories: { with: { category: true } },
          },
        },
        plan: true,
      },
    });

    return [...sameMovieEps, ...fallbackEps];
  } catch (err) {
    console.error("Error in getRecommendedEpisodes:", err);
    return [];
  }
}

// ─── Get AI Galleries ────────────────────────────────────────────────────────
export const getLatestGalleries = cache(async (limit = 24) => {
  try {
    if (!db) return [];

    const items = await db.query.aiGalleries.findMany({
      where: (g, { eq }) => eq(g.status, 1),
      orderBy: (g, { desc }) => [desc(g.id)],
      limit,
      with: {
        movie: { columns: { id: true, name: true } },
        plan: { columns: { id: true, name: true, level: true } },
        galleryCharacters: {
          with: { character: { columns: { id: true, name: true } } },
        },
        images: {
          limit: 1,
          columns: { id: true, imgUrl: true },
        },
      },
    });

    const galleryIds = (items || []).map((g: any) => g.id);
    let countMap = new Map<number, number>();
    if (galleryIds.length > 0) {
      const counts = await db
        .select({
          idGallery: schema.aiImages.idGallery,
          count: count(schema.aiImages.id),
        })
        .from(schema.aiImages)
        .where(inArray(schema.aiImages.idGallery, galleryIds))
        .groupBy(schema.aiImages.idGallery);
      countMap = new Map(counts.map((c) => [c.idGallery as number, Number(c.count)]));
    }

    return (items || []).map((g: any) => ({
      ...g,
      imageCount: countMap.get(g.id) || g.images?.length || 0,
    }));
  } catch (err) {
    console.error("Error in getLatestGalleries:", err);
    return [];
  }
});

// ─── Get AI Galleries Paginated (Public Client View) ─────────────────────────
export async function getGalleriesPublicPaginated(params: {
  page?: number;
  limit?: number;
  plan?: string;
  movieId?: string;
  characterId?: string;
  sortBy?: string;
}) {
  const page = params.page || 1;
  const limit = params.limit || 12;
  const plan = params.plan || "all";
  const movieId = params.movieId || "all";
  const characterId = params.characterId || "all";
  const sortBy = params.sortBy || "newest";

  try {
    if (!db) return { galleries: [], totalCount: 0 };

    const offset = (page - 1) * limit;

    // Build where clause
    const conditions = [eq(schema.aiGalleries.status, 1)];

    if (plan !== "all") {
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

    if (movieId !== "all") {
      const isMovieNum = /^\d+$/.test(movieId);
      if (isMovieNum) {
        conditions.push(eq(schema.aiGalleries.idMovie, parseInt(movieId, 10)));
      } else {
        const movieSub = db
          .select({ id: schema.movies.id })
          .from(schema.movies)
          .where(or(eq(schema.movies.slug, movieId), eq(schema.movies.slug, slugify(movieId))));
        conditions.push(inArray(schema.aiGalleries.idMovie, movieSub));
      }
    }

    if (characterId !== "all") {
      const isCharNum = /^\d+$/.test(characterId);
      if (isCharNum) {
        const charSub = db
          .select({ idGallery: schema.galleryCharacter.idGallery })
          .from(schema.galleryCharacter)
          .where(eq(schema.galleryCharacter.idCharacter, parseInt(characterId, 10)));
        conditions.push(inArray(schema.aiGalleries.id, charSub));
      } else {
        const charSub = db
          .select({ idGallery: schema.galleryCharacter.idGallery })
          .from(schema.galleryCharacter)
          .innerJoin(schema.characters, eq(schema.characters.id, schema.galleryCharacter.idCharacter))
          .where(
            or(
              eq(schema.characters.slug, characterId),
              eq(schema.characters.slug, slugify(characterId)),
              ilike(schema.characters.name, `%${characterId.replace(/[-_]+/g, " ")}%`)
            )
          );
        conditions.push(inArray(schema.aiGalleries.id, charSub));
      }
    }

    const whereClause = and(...conditions);

    // Sorting
    let orderByClause: any = (g: any, { desc }: any) => [desc(g.id)];
    if (sortBy === "views") {
      orderByClause = (g: any, { desc }: any) => [desc(g.views)];
    }

    const [items, countResult] = await Promise.all([
      db.query.aiGalleries.findMany({
        where: whereClause,
        orderBy: orderByClause,
        limit,
        offset,
        with: {
          movie: { columns: { id: true, name: true } },
          plan: { columns: { id: true, name: true, level: true } },
          galleryCharacters: {
            with: { character: { columns: { id: true, name: true } } },
          },
          images: {
            limit: 1,
            columns: { id: true, imgUrl: true },
          },
        },
      }),
      db
        .select({ count: count() })
        .from(schema.aiGalleries)
        .where(whereClause),
    ]);

    const totalCount = Number(countResult[0]?.count || 0);

    const galleryIds = (items || []).map((g: any) => g.id);
    let countMap = new Map<number, number>();
    if (galleryIds.length > 0) {
      const counts = await db
        .select({
          idGallery: schema.aiImages.idGallery,
          count: count(schema.aiImages.id),
        })
        .from(schema.aiImages)
        .where(inArray(schema.aiImages.idGallery, galleryIds))
        .groupBy(schema.aiImages.idGallery);
      countMap = new Map(counts.map((c) => [c.idGallery as number, Number(c.count)]));
    }

    const formattedGalleries = (items || []).map((g: any) => ({
      ...g,
      imageCount: countMap.get(g.id) || g.images?.length || 0,
    }));

    return {
      galleries: formattedGalleries,
      totalCount,
    };
  } catch (err) {
    console.error("Error in getGalleriesPublicPaginated query:", err);
    return { galleries: [], totalCount: 0 };
  }
}

// ─── Get AI Gallery Details by Slug or ID ─────────────────────────────────────
export const getGalleryBySlug = cache(async (slugOrId: string) => {
  try {
    if (!db) return null;

    let trimmed = slugOrId ? slugOrId.trim() : "";
    if (!trimmed) return null;

    try {
      trimmed = decodeURIComponent(trimmed).trim();
    } catch {}

    const isNumeric = /^\d+$/.test(trimmed);
    const numericId = isNumeric ? parseInt(trimmed, 10) : -1;
    const targetSlug = slugify(trimmed);

    // 1. Fetch gallery with all images
    const gallery: any = await db.query.aiGalleries.findFirst({
      where: (g, { eq, or }) => {
        const conditions = [
          eq(g.slug, trimmed),
          ...(targetSlug ? [eq(g.slug, targetSlug)] : []),
        ];
        if (isNumeric) {
          conditions.unshift(eq(g.id, numericId));
        }
        return or(...conditions);
      },
      with: {
        movie: {
          columns: { id: true, name: true, imgUrl: true },
        },
        plan: {
          columns: { id: true, name: true, level: true },
        },
        galleryCharacters: {
          with: {
            character: {
              columns: { id: true, name: true, nameEn: true, nameZh: true, slug: true, imgUrl: true },
            },
          },
        },
        images: {
          orderBy: (img, { asc }) => [asc(img.id)],
          columns: { id: true, imgUrl: true },
        },
      },
    });

    if (!gallery) return null;

    // 2. Fetch related galleries (same movie or popular)
    const relatedConditions = [
      eq(schema.aiGalleries.status, 1),
      ne(schema.aiGalleries.id, gallery.id),
    ];
    if (gallery.idMovie) {
      relatedConditions.push(eq(schema.aiGalleries.idMovie, gallery.idMovie));
    }

    let related = await db.query.aiGalleries.findMany({
      where: and(...relatedConditions),
      orderBy: (g, { desc }) => [desc(g.views), desc(g.id)],
      limit: 6,
      with: {
        movie: { columns: { id: true, name: true } },
        plan: { columns: { id: true, name: true, level: true } },
        galleryCharacters: {
          with: { character: { columns: { id: true, name: true } } },
        },
        images: {
          limit: 1,
          columns: { id: true, imgUrl: true },
        },
      },
    });

    // If fewer than 6, fallback to popular galleries
    if (related.length < 6) {
      const existingIds = [gallery.id, ...related.map((r) => r.id)];
      const more = await db.query.aiGalleries.findMany({
        where: and(
          eq(schema.aiGalleries.status, 1),
          notInArray(schema.aiGalleries.id, existingIds)
        ),
        orderBy: (g, { desc }) => [desc(g.views), desc(g.id)],
        limit: 6 - related.length,
        with: {
          movie: { columns: { id: true, name: true } },
          plan: { columns: { id: true, name: true, level: true } },
          galleryCharacters: {
            with: { character: { columns: { id: true, name: true } } },
          },
          images: {
            limit: 1,
            columns: { id: true, imgUrl: true },
          },
        },
      });
      related = [...related, ...more];
    }

    // Attach imageCount to related galleries
    const relatedIds = related.map((r) => r.id);
    let relatedCountMap = new Map<number, number>();
    if (relatedIds.length > 0) {
      const counts = await db
        .select({
          idGallery: schema.aiImages.idGallery,
          count: count(schema.aiImages.id),
        })
        .from(schema.aiImages)
        .where(inArray(schema.aiImages.idGallery, relatedIds))
        .groupBy(schema.aiImages.idGallery);
      relatedCountMap = new Map(counts.map((c) => [c.idGallery as number, Number(c.count)]));
    }

    const formattedRelated = related.map((r) => ({
      ...r,
      imageCount: relatedCountMap.get(r.id) || r.images?.length || 0,
    }));

    return {
      gallery: {
        ...gallery,
        imageCount: gallery.images?.length || 0,
      },
      relatedGalleries: formattedRelated,
    };
  } catch (err) {
    console.error("Error in getGalleryBySlug:", err);
    return null;
  }
});

// ─── Get All Galleries for Static Params Prerendering ────────────────────────
export async function getAllGalleriesForStaticParams() {
  try {
    if (!db) return [];
    return await db.query.aiGalleries.findMany({
      where: (g, { eq }) => eq(g.status, 1),
      columns: { id: true, slug: true },
      limit: 100,
    });
  } catch {
    return [];
  }
}

// ─── Get Gallery Filter Options (Active Movies & Characters) ──────────────────
export const getGalleryFilterOptions = cache(async () => {
  try {
    if (!db) return { movies: [], characters: [] };

    const moviesList = await db
      .selectDistinct({
        id: schema.movies.id,
        name: schema.movies.name,
      })
      .from(schema.aiGalleries)
      .innerJoin(schema.movies, eq(schema.aiGalleries.idMovie, schema.movies.id))
      .where(eq(schema.aiGalleries.status, 1));

    const charactersList = await db
      .selectDistinct({
        id: schema.characters.id,
        name: schema.characters.name,
      })
      .from(schema.galleryCharacter)
      .innerJoin(schema.characters, eq(schema.galleryCharacter.idCharacter, schema.characters.id))
      .innerJoin(schema.aiGalleries, eq(schema.galleryCharacter.idGallery, schema.aiGalleries.id))
      .where(eq(schema.aiGalleries.status, 1));

    return {
      movies: (moviesList || []).sort((a, b) => ((a?.name || "") < (b?.name || "") ? -1 : (a?.name || "") > (b?.name || "") ? 1 : 0)),
      characters: (charactersList || []).sort((a, b) => ((a?.name || "") < (b?.name || "") ? -1 : (a?.name || "") > (b?.name || "") ? 1 : 0)),
    };
  } catch (err) {
    console.error("Error in getGalleryFilterOptions:", err);
    return { movies: [], characters: [] };
  }
});

// ─── Get All Characters ───────────────────────────────────────────────────────
export const getAllCharacters = cache(async () => {
  try {
    if (!db) return [];
    return await db.query.characters.findMany({
      where: eq(schema.characters.status, 1),
      with: {
        movie: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [desc(schema.characters.id)],
    });
  } catch (err) {
    console.error("Error in getAllCharacters:", err);
    return [];
  }
});

// ─── Get All Actors ───────────────────────────────────────────────────────────
export const getAllActors = cache(async () => {
  try {
    if (!db) return [];
    return await db
      .select({
        id: schema.actors.id,
        name: schema.actors.name,
        imgUrl: schema.actors.imgUrl,
      })
      .from(schema.actors)
      .where(eq(schema.actors.status, 1))
      .orderBy(desc(schema.actors.id));
  } catch (err) {
    console.error("Error in getAllActors:", err);
    return [];
  }
});

// ─── Get Character Details with Episodes and Galleries ────────────────────────
export const getCharacterDetails = cache(async (slugOrId: string) => {
  try {
    if (!db) return null;

    let trimmed = slugOrId ? slugOrId.trim() : "";
    if (!trimmed) return null;

    try {
      trimmed = decodeURIComponent(trimmed).trim();
    } catch {
      // keep original trimmed if malformed URI
    }

    const isNumeric = /^\d+$/.test(trimmed);
    const numericId = isNumeric ? parseInt(trimmed, 10) : -1;
    const targetSlug = slugify(trimmed);
    const trimmedWithSpaces = trimmed.replace(/[-_]+/g, " ").trim();

    // 1. Fetch character with parent movie
    // Match across slug, Vietnamese name, English name (or slugified English name), and Chinese name
    let character = await db.query.characters.findFirst({
      where: (chars, { eq, or, ilike }) => {
        const conditions = [
          eq(chars.slug, trimmed),
          ...(targetSlug ? [eq(chars.slug, targetSlug)] : []),
          ilike(chars.name, trimmed),
          ilike(chars.name, trimmedWithSpaces),
          ilike(chars.nameEn, trimmed),
          ilike(chars.nameEn, trimmedWithSpaces),
          eq(chars.nameZh, trimmed),
          ilike(chars.nameZh, trimmed),
        ];
        if (isNumeric) {
          conditions.unshift(eq(chars.id, numericId));
        }
        return or(...conditions);
      },
      with: {
        movie: {
          with: {
            movieCategories: { with: { category: true } },
          },
        },
      },
    });

    // Fallback: If still not found and query string is long enough, try partial match
    if (!character && trimmed.length > 2) {
      character = await db.query.characters.findFirst({
        where: (chars, { or, ilike }) =>
          or(
            ilike(chars.name, `%${trimmedWithSpaces}%`),
            ilike(chars.nameEn, `%${trimmedWithSpaces}%`),
            ilike(chars.nameZh, `%${trimmed}%`)
          ),
        with: {
          movie: {
            with: {
              movieCategories: { with: { category: true } },
            },
          },
        },
      });
    }

    if (!character) return null;

    // 2. Fetch episodes featuring this character via episodesCharacter junction
    const epJunctions = await db.query.episodesCharacter.findMany({
      where: eq(schema.episodesCharacter.idCharacter, character.id),
      with: {
        episode: {
          with: {
            movie: { columns: { id: true, name: true, slug: true, imgUrl: true } },
            plan: true,
          },
        },
      },
    });

    let episodesList = (epJunctions as any[])
      .map((j) => j.episode)
      .filter(Boolean)
      .filter((ep: any) => ep.status === 1);

    // Fallback: If junction has 0 episodes, also search by character name in parent movie's episodes
    if (episodesList.length === 0 && character.idMovie) {
      const movieEps = await db.query.episodes.findMany({
        where: (ep, { eq, and }) => and(eq(ep.status, 1), eq(ep.idMovie, character.idMovie!)),
        with: {
          movie: { columns: { id: true, name: true, slug: true, imgUrl: true } },
          plan: true,
        },
      });
      const matched = movieEps.filter(
        (ep: any) =>
          ep.name?.toLowerCase().includes(character.name.toLowerCase()) ||
          slugify(ep.name || "").includes(targetSlug)
      );
      if (matched.length > 0) {
        episodesList = matched;
      }
    }

    // 3. Fetch galleries featuring this character via galleryCharacter junction
    const galJunctions = await db.query.galleryCharacter.findMany({
      where: eq(schema.galleryCharacter.idCharacter, character.id),
      with: {
        gallery: {
          with: {
            movie: { columns: { id: true, name: true } },
            plan: true,
            galleryCharacters: {
              with: { character: { columns: { id: true, name: true, slug: true } } },
            },
            images: {
              orderBy: (img, { asc }) => [asc(img.id)],
              columns: { id: true, imgUrl: true },
            },
          },
        },
      },
    });

    let galleriesList = galJunctions
      .map((j) => j.gallery)
      .filter(Boolean)
      .filter((g: any) => g.status === 1);

    // Fallback: If junction has 0 galleries, search galleries in same movie matching character name
    if (galleriesList.length === 0 && character.idMovie) {
      const movieGals = await db.query.aiGalleries.findMany({
        where: (g, { eq, and }) => and(eq(g.status, 1), eq(g.idMovie, character.idMovie!)),
        limit: 24,
        with: {
          movie: { columns: { id: true, name: true } },
          plan: true,
          galleryCharacters: {
            with: { character: { columns: { id: true, name: true, slug: true } } },
          },
          images: {
            orderBy: (img, { asc }) => [asc(img.id)],
            columns: { id: true, imgUrl: true },
          },
        },
      });
      const matchedGals = movieGals.filter(
        (g: any) =>
          g.name?.toLowerCase().includes(character.name.toLowerCase()) ||
          slugify(g.name || "").includes(targetSlug)
      );
      if (matchedGals.length > 0) {
        galleriesList = matchedGals;
      }
    }

    const formattedGalleries = galleriesList.map((g: any) => ({
      ...g,
      slug: g.slug || slugify(g.name) || g.id?.toString(),
      imageCount: g.images?.length || 0,
    }));

    // 4. Fetch 6 other characters for recommendation
    const otherCharacters = await db.query.characters.findMany({
      where: (chars, { and, eq, ne }) => and(eq(chars.status, 1), ne(chars.id, character.id)),
      limit: 6,
      with: {
        movie: { columns: { id: true, name: true } },
      },
      orderBy: (chars, { desc }) => [desc(chars.id)],
    });

    return {
      character,
      episodes: episodesList,
      galleries: formattedGalleries,
      otherCharacters: otherCharacters || [],
    };
  } catch (err) {
    console.error("Error in getCharacterDetails:", err);
    return null;
  }
});


