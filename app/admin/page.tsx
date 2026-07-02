import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/actions";
import { cookies } from "next/headers";
import AdminDashboardClient from "./AdminDashboardClient";
import {
  getAdminMovies,
  getAdminCategories,
  getAdminAuthors,
} from "./actions";

export default async function AdminPage() {
  await cookies(); // Force dynamic rendering compatibly with cacheComponents
  // Admin check bypassed by user request

  // Pre-fetch only overview data on the server in parallel (fast)
  const [movies, categories, authors] = await Promise.all([
    getAdminMovies(),
    getAdminCategories(),
    getAdminAuthors(),
  ]);

  return (
    <AdminDashboardClient
      initialData={{
        movies,
        categories,
        authors,
      }}
    />
  );
}
