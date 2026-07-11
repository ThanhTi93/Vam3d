"use server";

import { getGalleriesPublicPaginated } from "@/lib/db/queries";

export async function fetchMoreGalleries(params: {
  page?: number;
  limit?: number;
  plan?: string;
  movieId?: string;
  characterId?: string;
  sortBy?: string;
}) {
  return getGalleriesPublicPaginated(params);
}
