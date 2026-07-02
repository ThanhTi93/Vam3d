import { unstable_cache } from "next/cache";
import { db } from "./index";


// ─── Get All Movies ─────────────────────────────────────────────────────────
export const getAllMovies = unstable_cache(
  async () => {
    try {
      if (!db) throw new Error("No DB");

      const result = await db.query.movies.findMany({
        where: (movies, { eq }) => eq(movies.status, 1),
        orderBy: (movies, { desc }) => [desc(movies.id)],
        with: {
          author: true,
          movieCategories: { with: { category: true } },
          episodes: {
            orderBy: (ep, { asc }) => [asc(ep.id)],
            with: {
              episodesActors: { with: { actor: true } },
            }
          },
        },
      });

      return result.map(m => {
        const uniqueActors = new Map<number, any>();
        m.episodes?.forEach(ep => {
          ep.episodesActors?.forEach((ea: any) => {
            if (ea.actor) uniqueActors.set(ea.actor.id, ea.actor);
          });
        });
        return {
          ...m,
          movieActors: Array.from(uniqueActors.values()).map(actor => ({ actor }))
        };
      });
    } catch {
      return [];
    }
  },
  ["all-movies"],
  { revalidate: 60, tags: ["movies:all"] }
);

// ─── Get Hot Movies ──────────────────────────────────────────────────────────
export const getHotMovies = unstable_cache(
  async () => {
    try {
      if (!db) throw new Error("No DB");

      const result = await db.query.movies.findMany({
        where: (movies, { eq, and }) =>
          and(eq(movies.status, 1)),
        orderBy: (movies, { desc }) => [desc(movies.id)],
        limit: 6,
        with: {
          movieCategories: { with: { category: true } },
          episodes: { orderBy: (ep, { asc }) => [asc(ep.id)] },
        },
      });

      return result;
    } catch {
      return [];
    }
  },
  ["hot-movies"],
  { revalidate: 60, tags: ["movies:hot"] }
);

// ─── Get Movies by Category slug ────────────────────────────────────────────
export const getMoviesByCategory = (categoryName: string) => unstable_cache(
  async () => {
    try {
      if (!db) throw new Error("No DB");

      const result = await db.query.movies.findMany({
        where: (movies, { eq }) => eq(movies.status, 1),
        with: {
          movieCategories: {
            with: { category: true },
          },
          episodes: { orderBy: (ep, { asc }) => [asc(ep.id)] },
        },
      });

      return result.filter((movie) =>
        movie.movieCategories.some(
          (mc) => mc.category?.name?.toLowerCase() === categoryName.toLowerCase()
        )
      );
    } catch {
      return [];
    }
  },
  ["movies-by-category", categoryName],
  { revalidate: 120, tags: ["movies:category", `movies:category-${categoryName}`] }
)();

// ─── Get Single Movie by ID ──────────────────────────────────────────────────
export const getMovieById = (id: string) => unstable_cache(
  async () => {
    try {
      if (!db) throw new Error("No DB");

      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return null;
      }

      const result = await db.query.movies.findFirst({
        where: (movies, { eq }) => eq(movies.id, numericId),
        with: {
          author: true,
          movieCategories: { with: { category: true } },
          episodes: {
            orderBy: (ep, { asc }) => [asc(ep.id)],
            with: {
              episodesActors: { with: { actor: true } },
              episodesCharacters: { with: { character: true } },
              plan: true,
            }
          },
          aiGalleries: {
            where: (g, { eq }) => eq(g.status, 1),
            orderBy: (g, { desc }) => [desc(g.id)],
            with: {
              galleryCharacters: {
                with: { character: { columns: { id: true, name: true } } }
              },
              images: {
                columns: { id: true, imgUrl: true },
                with: {
                  collectionImages: true
                }
              },
              plan: true,
            }
          }
        },
      });

      if (!result) return null;

      const uniqueActors = new Map<number, any>();
      const uniqueCharacters = new Map<number, any>();
      result.episodes?.forEach(ep => {
        ep.episodesActors?.forEach((ea: any) => {
          if (ea.actor) uniqueActors.set(ea.actor.id, ea.actor);
        });
        ep.episodesCharacters?.forEach((ec: any) => {
          if (ec.character) uniqueCharacters.set(ec.character.id, ec.character);
        });
      });

      return {
        ...result,
        movieActors: Array.from(uniqueActors.values()).map(actor => ({ actor })),
        movieCharacters: Array.from(uniqueCharacters.values()).map(character => ({ character }))
      };
    } catch {
      return null;
    }
  },
  ["movie-by-id", id],
  { revalidate: 300, tags: ["movie:detail", `movie:detail-${id}`] }
)();

// ─── Get Top Ranked Movies ───────────────────────────────────────────────────
export const getTopMovies = (limit = 6) => unstable_cache(
  async () => {
    try {
      if (!db) throw new Error("No DB");

      const result = await db.query.movies.findMany({
        where: (movies, { eq }) => eq(movies.status, 1),
        orderBy: (movies, { desc }) => [desc(movies.id)],
        limit,
        columns: { id: true, name: true, imgUrl: true },
      });

      return result.map(m => ({ ...m, viewCount: 0, likeCount: 0 }));
    } catch {
      return [];
    }
  },
  ["top-movies", limit.toString()],
  { revalidate: 60, tags: ["movies:top"] }
)();

// ─── Get All Categories ──────────────────────────────────────────────────────
export const getAllCategories = unstable_cache(
  async () => {
    try {
      if (!db) throw new Error("No DB");

      return await db.query.categories.findMany({
        where: (cats, { eq }) => eq(cats.status, 1),
      });
    } catch {
      return [];
    }
  },
  ["all-categories"],
  { revalidate: 300, tags: ["categories:all"] }
);

// ─── Get All Plans (Subscription tiers) ─────────────────────────────────────
export const getAllPlans = unstable_cache(
  async () => {
    try {
      if (!db) throw new Error("No DB");

      return await db.query.plans.findMany({
        where: (plans, { eq }) => eq(plans.status, 1),
        with: { features: true, packages: true },
      });
    } catch {
      return [];
    }
  },
  ["all-plans"],
  { revalidate: 600, tags: ["plans:all"] }
);

// ─── Get Latest Episodes ─────────────────────────────────────────────────────
export const getLatestEpisodes = (limit = 12) => unstable_cache(
  async () => {
    try {
      if (!db) throw new Error("No DB");

      const result = await db.query.episodes.findMany({
        where: (ep, { eq }) => eq(ep.status, 1),
        orderBy: (ep, { desc }) => [desc(ep.id)],
        limit,
        with: {
          movie: {
            with: {
              episodes: {
                orderBy: (epSub, { asc }) => [asc(epSub.id)],
              },
              movieCategories: { with: { category: true } }
            }
          },
          plan: true,
        },
      });

      return result;
    } catch {
      return [];
    }
  },
  ["latest-episodes", limit.toString()],
  { revalidate: 60, tags: ["episodes:latest"] }
)();

// ─── Get Most Viewed Episodes ─────────────────────────────────────────────────
export const getMostViewedEpisodes = (limit = 12) => unstable_cache(
  async () => {
    try {
      if (!db) throw new Error("No DB");

      const result = await db.query.episodes.findMany({
        where: (ep, { eq, gt, and }) => and(eq(ep.status, 1), gt(ep.views, 0)),
        orderBy: (ep, { desc }) => [desc(ep.views)],
        limit,
        with: {
          movie: {
            with: {
              episodes: {
                orderBy: (epSub, { asc }) => [asc(epSub.id)],
              },
              movieCategories: { with: { category: true } }
            }
          },
          plan: true,
        },
      });

      return result;
    } catch {
      return [];
    }
  },
  ["most-viewed-episodes", limit.toString()],
  { revalidate: 60, tags: ["episodes:most-viewed"] }
)();

// ─── Get Recommended Episodes (Same Movie or Same Character) ─────────────────
export const getRecommendedEpisodes = (currentEpisodeId: number, currentMovieId: number, limit = 8) => unstable_cache(
  async () => {
    try {
      if (!db) throw new Error("No DB");

      // 1. Fetch other episodes of the same movie
      const sameMovieEps = await db.query.episodes.findMany({
        where: (ep, { eq, and, ne }) => and(
          eq(ep.status, 1),
          eq(ep.idMovie, currentMovieId),
          ne(ep.id, currentEpisodeId)
        ),
        orderBy: (ep, { asc }) => [asc(ep.id)],
        with: {
          movie: {
            with: {
              episodes: { orderBy: (e, { asc }) => [asc(e.id)] },
              movieCategories: { with: { category: true } }
            }
          },
          plan: true
        }
      });

      if (sameMovieEps.length >= limit) {
        return sameMovieEps.slice(0, limit);
      }

      const remainingSlots = limit - sameMovieEps.length;

      // 2. Fetch characters of the current episode
      const currentEpChars = await db.query.episodesCharacter.findMany({
        where: (ec, { eq }) => eq(ec.idEpisodes, currentEpisodeId),
        columns: { idCharacter: true }
      });
      const charIds = currentEpChars.map(ec => ec.idCharacter).filter((id): id is number => id !== null);

      let sameCharEps: any[] = [];
      if (charIds.length > 0) {
        const matchingJunctions = await db.query.episodesCharacter.findMany({
          where: (ec, { inArray, and, ne }) => and(
            inArray(ec.idCharacter, charIds),
            ne(ec.idEpisodes, currentEpisodeId)
          ),
          columns: { idEpisodes: true }
        });

        const candidateEpIds = matchingJunctions.map(mj => mj.idEpisodes).filter((id): id is number => id !== null && id !== currentEpisodeId);
        
        if (candidateEpIds.length > 0) {
          sameCharEps = await db.query.episodes.findMany({
            where: (ep, { inArray, eq, and, ne }) => and(
              eq(ep.status, 1),
              inArray(ep.id, candidateEpIds),
              ne(ep.idMovie, currentMovieId)
            ),
            limit: remainingSlots,
            orderBy: (ep, { desc }) => [desc(ep.id)],
            with: {
              movie: {
                with: {
                  episodes: { orderBy: (e, { asc }) => [asc(e.id)] },
                  movieCategories: { with: { category: true } }
                }
              },
              plan: true
            }
          });
        }
      }

      const finalEps = [...sameMovieEps, ...sameCharEps];
      if (finalEps.length < limit) {
        const fillLimit = limit - finalEps.length;
        
        const movieCats = await db.query.movieCategory.findMany({
          where: (mc, { eq }) => eq(mc.idMovie, currentMovieId),
          with: { category: true }
        });
        const catName = movieCats?.[0]?.category?.name || "phim-le";
        const cat = await db.query.categories.findFirst({ where: (c, { eq }) => eq(c.name, catName) });
        
        if (cat) {
          const mcs = await db.query.movieCategory.findMany({
            where: (mc, { eq }) => eq(mc.idCategory, cat.id),
            columns: { idMovie: true }
          });
          const movieIds = mcs.map(mc => mc.idMovie).filter((id): id is number => id !== null && id !== currentMovieId);
          
          const excludeEpIds = finalEps.map(fe => fe.id).concat(currentEpisodeId);
          
          if (movieIds.length > 0) {
            const fallbackEps = await db.query.episodes.findMany({
              where: (ep, { inArray, eq, and, notInArray }) => and(
                eq(ep.status, 1),
                inArray(ep.idMovie, movieIds),
                notInArray(ep.id, excludeEpIds)
              ),
              limit: fillLimit,
              orderBy: (ep, { desc }) => [desc(ep.id)],
              with: {
                movie: {
                  with: {
                    episodes: { orderBy: (e, { asc }) => [asc(e.id)] },
                    movieCategories: { with: { category: true } }
                  }
                },
                plan: true
              }
            });
            finalEps.push(...fallbackEps);
          }
        }
      }

      return finalEps;
    } catch {
      return [];
    }
  },
  ["recommended-episodes", currentEpisodeId.toString(), currentMovieId.toString(), limit.toString()],
  { revalidate: 60, tags: ["episodes:recommended", `episodes:recommended-${currentMovieId}`] }
)();

// ─── Get AI Galleries ────────────────────────────────────────────────────────
export const getLatestGalleries = unstable_cache(
  async () => {
    try {
      if (!db) throw new Error("No DB");

      return await db.query.aiGalleries.findMany({
        orderBy: (g, { desc }) => [desc(g.id)],
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
    } catch {
      return [];
    }
  },
  ["latest-galleries"],
  { revalidate: 120, tags: ["galleries:latest"] }
);
