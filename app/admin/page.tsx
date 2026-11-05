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

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await cookies(); // Force dynamic rendering compatibly with cacheComponents
  // Admin check bypassed by user request

  // Pre-fetch only overview data on the server in parallel with safe error boundary
  let movies: any[] = [];
  let categories: any[] = [];
  let authors: any[] = [];

  try {
    const results = await Promise.all([
      getAdminMovies(),
      getAdminCategories(),
      getAdminAuthors(),
    ]);
    movies = results[0] || [];
    categories = results[1] || [];
    authors = results[2] || [];
  } catch (err) {
    console.error("AdminPage prefetch error:", err);
  }

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
