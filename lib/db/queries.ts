import { db, schema } from "./index";
import { eq, and, or, ilike, inArray, count, isNull, desc, asc, notInArray } from "drizzle-orm";
import { slugify } from "@/lib/utils";

// ─── Get All Movies ─────────────────────────────────────────────────────────
export async function getAllMovies(limit = 100) {
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
}

// ─── Get Hot Movies ──────────────────────────────────────────────────────────
export async function getHotMovies() {
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
}

// ─── Get Movies by Category slug or name ────────────────────────────────────
export async function getMoviesByCategory(categoryIdentifier: string) {
  try {
    if (!db) return [];

    const result = await db.query.movies.findMany({
      where: (movies, { eq }) => eq(movies.status, 1),
      with: {
        movieCategories: {
          with: { category: true },
        },
        episodes: { limit: 1, orderBy: (ep, { asc }) => [asc(ep.id)] },
      },
    });

    const decoded = decodeURIComponent(categoryIdentifier).trim();
    const inputSlug = slugify(decoded);

    return result.filter((movie: any) =>
      movie.movieCategories.some((mc: any) => {
        if (!mc.category) return false;
        const catName = mc.category.name.trim();
        const catSlug = mc.category.slug || slugify(catName);
        return (
          catSlug.toLowerCase() === inputSlug.toLowerCase() ||
          catName.toLowerCase() === decoded.toLowerCase() ||
          catSlug.toLowerCase() === decoded.toLowerCase()
        );
      })
    );
  } catch (err) {
    console.error("Error in getMoviesByCategory:", err);
    return [];
  }
}

// ─── Get Single Movie by ID or Slug ─────────────────────────────────────────
export async function getMovieById(id: string) {
  try {
    if (!db) return null;

    const trimmedId = id ? decodeURIComponent(id).trim() : "";
    if (!trimmedId) return null;

    const isNumeric = /^\d+$/.test(trimmedId);
    const numericId = isNumeric ? parseInt(trimmedId, 10) : -1;
    const targetSlug = slugify(trimmedId);

    let result = await db.query.movies.findFirst({
      where: (movies, { eq, or }) => {
        if (isNumeric) {
          return or(eq(movies.id, numericId), eq(movies.slug, trimmedId), eq(movies.slug, targetSlug));
        }
        return or(eq(movies.slug, trimmedId), eq(movies.slug, targetSlug));
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
          with: {
            galleryCharacters: {
              with: { character: { columns: { id: true, name: true } } },
            },
            images: {
              columns: { id: true, imgUrl: true },
              with: {
                collectionImages: true,
              },
            },
            plan: true,
          },
        },
      },
    });

    if (!result) {
      const all = await db.query.movies.findMany({
        where: (movies, { eq }) => eq(movies.status, 1),
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
            with: {
              galleryCharacters: {
                with: { character: { columns: { id: true, name: true } } },
              },
              images: {
                columns: { id: true, imgUrl: true },
                with: {
                  collectionImages: true,
                },
              },
              plan: true,
            },
          },
        },
      });

      result = all.find(
        (m: any) =>
          m.id.toString() === trimmedId ||
          m.slug === trimmedId ||
          m.slug === targetSlug ||
          slugify(m.name) === targetSlug
      );
    }

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
      movieActors: Array.from(uniqueActors.values()).map((actor) => ({ actor })),
      movieCharacters: Array.from(uniqueCharacters.values()).map((character) => ({ character })),
    };
  } catch (err) {
    console.error("Error in getMovieById:", err);
    return null;
  }
}

// ─── Get Top Ranked Movies ───────────────────────────────────────────────────
export async function getTopMovies(limit = 6) {
  try {
    if (!db) return [];

    const result = await db.query.movies.findMany({
      where: (movies, { eq }) => eq(movies.status, 1),
      orderBy: (movies, { desc }) => [desc(movies.id)],
      limit,
      columns: { id: true, name: true, imgUrl: true, rating: true, viewCount: true, likeCount: true },
    });

    return result;
  } catch (err) {
    console.error("Error in getTopMovies:", err);
    return [];
  }
}

// ─── Get All Categories ──────────────────────────────────────────────────────
export async function getAllCategories() {
  try {
    if (!db) return [];

    return await db.query.categories.findMany({
      where: (cats, { eq }) => eq(cats.status, 1),
    });
  } catch (err) {
    console.error("Error in getAllCategories:", err);
    return [];
  }
}

// ─── Get All Plans (Subscription tiers) ─────────────────────────────────────
export async function getAllPlans() {
  try {
    if (!db) return [];

    return await db.query.plans.findMany({
      where: (plans, { eq }) => eq(plans.status, 1),
      with: { features: true, packages: true },
    });
  } catch (err) {
    console.error("Error in getAllPlans:", err);
    return [];
  }
}

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

// ─── Get Recommended Episodes (Same Movie or Same Character) ─────────────────
export async function getRecommendedEpisodes(currentEpisodeId: number, currentMovieId: number, limit = 8) {
  try {
    if (!db) return [];

    // 1. Fetch other episodes of the same movie
    const sameMovieEps = await db.query.episodes.findMany({
      where: (ep, { eq, and, ne }) =>
        and(eq(ep.status, 1), eq(ep.idMovie, currentMovieId), ne(ep.id, currentEpisodeId)),
      orderBy: (ep, { asc }) => [asc(ep.id)],
      with: {
        movie: {
          with: {
            episodes: { orderBy: (e, { asc }) => [asc(e.id)] },
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

    // 2. Fetch characters of the current episode
    const currentEpChars = await db.query.episodesCharacter.findMany({
      where: (ec, { eq }) => eq(ec.idEpisodes, currentEpisodeId),
      columns: { idCharacter: true },
    });
    const charIds = currentEpChars.map((ec: any) => ec.idCharacter).filter((id): id is number => id !== null);

    let sameCharEps: any[] = [];
    if (charIds.length > 0) {
      const matchingJunctions = await db.query.episodesCharacter.findMany({
        where: (ec, { inArray, and, ne }) =>
          and(inArray(ec.idCharacter, charIds), ne(ec.idEpisodes, currentEpisodeId)),
        columns: { idEpisodes: true },
      });

      const candidateEpIds = matchingJunctions
        .map((mj: any) => mj.idEpisodes)
        .filter((id): id is number => id !== null && id !== currentEpisodeId);

      if (candidateEpIds.length > 0) {
        sameCharEps = await db.query.episodes.findMany({
          where: (ep, { inArray, eq, and, ne }) =>
            and(eq(ep.status, 1), inArray(ep.id, candidateEpIds), ne(ep.idMovie, currentMovieId)),
          limit: remainingSlots,
          orderBy: (ep, { desc }) => [desc(ep.id)],
          with: {
            movie: {
              with: {
                episodes: { orderBy: (e, { asc }) => [asc(e.id)] },
                movieCategories: { with: { category: true } },
              },
            },
            plan: true,
          },
        });
      }
    }

    const finalEps = [...sameMovieEps, ...sameCharEps];
    if (finalEps.length < limit) {
      const fillLimit = limit - finalEps.length;

      const movieCats = await db.query.movieCategory.findMany({
        where: (mc, { eq }) => eq(mc.idMovie, currentMovieId),
        with: { category: true },
      });
      const catName = movieCats?.[0]?.category?.name || "phim-le";
      const cat = await db.query.categories.findFirst({ where: (c, { eq }) => eq(c.name, catName) });

      if (cat) {
        const mcs = await db.query.movieCategory.findMany({
          where: (mc, { eq }) => eq(mc.idCategory, cat.id),
          columns: { idMovie: true },
        });
        const movieIds = mcs.map((mc: any) => mc.idMovie).filter((id): id is number => id !== null && id !== currentMovieId);

        const excludeEpIds = finalEps.map((fe: any) => fe.id).concat(currentEpisodeId);

        if (movieIds.length > 0) {
          const fallbackEps = await db.query.episodes.findMany({
            where: (ep, { inArray, eq, and, notInArray }) =>
              and(eq(ep.status, 1), inArray(ep.idMovie, movieIds), notInArray(ep.id, excludeEpIds)),
            limit: fillLimit,
            orderBy: (ep, { desc }) => [desc(ep.id)],
            with: {
              movie: {
                with: {
                  episodes: { orderBy: (e, { asc }) => [asc(e.id)] },
                  movieCategories: { with: { category: true } },
                },
              },
              plan: true,
            },
          });
          finalEps.push(...fallbackEps);
        }
      }
    }

    return finalEps;
  } catch (err) {
    console.error("Error in getRecommendedEpisodes:", err);
    return [];
  }
}

// ─── Get AI Galleries ────────────────────────────────────────────────────────
export async function getLatestGalleries(limit = 24) {
  try {
    if (!db) return [];

    return await db.query.aiGalleries.findMany({
      orderBy: (g, { desc }) => [desc(g.id)],
      limit,
      with: {
        movie: { columns: { id: true, name: true } },
        plan: { columns: { id: true, name: true, level: true } },
        galleryCharacters: {
          with: { character: { columns: { id: true, name: true } } },
        },
        images: {
          columns: { id: true, imgUrl: true },
          with: {
            collectionImages: true,
          },
        },
      },
    });
  } catch (err) {
    console.error("Error in getLatestGalleries:", err);
    return [];
  }
}

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
      conditions.push(eq(schema.aiGalleries.idMovie, parseInt(movieId, 10)));
    }

    if (characterId !== "all") {
      const charSub = db
        .select({ idGallery: schema.galleryCharacter.idGallery })
        .from(schema.galleryCharacter)
        .where(eq(schema.galleryCharacter.idCharacter, parseInt(characterId, 10)));
      conditions.push(inArray(schema.aiGalleries.id, charSub));
    }

    const whereClause = and(...conditions);

    // Sorting
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
          with: { character: { columns: { id: true, name: true } } },
        },
        images: {
          columns: { id: true, imgUrl: true },
          with: {
            collectionImages: true,
          },
        },
      },
    });

    // Count total matching
    const countResult = await db
      .select({ count: count() })
      .from(schema.aiGalleries)
      .where(whereClause);

    const totalCount = Number(countResult[0]?.count || 0);

    return {
      galleries: items,
      totalCount,
    };
  } catch (err) {
    console.error("Error in getGalleriesPublicPaginated query:", err);
    return { galleries: [], totalCount: 0 };
  }
}

// ─── Get Gallery Filter Options (Active Movies & Characters) ──────────────────
export async function getGalleryFilterOptions() {
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
      movies: moviesList.sort((a, b) => a.name.localeCompare(b.name, "vi")),
      characters: charactersList.sort((a, b) => a.name.localeCompare(b.name, "vi")),
    };
  } catch (err) {
    console.error("Error in getGalleryFilterOptions:", err);
    return { movies: [], characters: [] };
  }
}
