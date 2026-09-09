"use server";

import { getEpisodesPaginated } from "@/lib/db/queries";

export async function fetchEpisodesAction(params: {
  page?: number;
  limit?: number;
  sortBy?: "newest" | "views";
  movieId?: string;
  search?: string;
}) {
  return await getEpisodesPaginated(params);
}
