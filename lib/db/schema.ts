import { pgTable, serial, varchar, text, integer, boolean, timestamp, decimal, bigint } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Authors Table
export const authors = pgTable("authors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: integer("status").default(1), // 1 = Active, 0 = Inactive
});

// Authors Relations
export const authorsRelations = relations(authors, ({ many }) => ({
  movies: many(movies),
}));

// 2. Plans Table
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  level: integer("level").notNull(), // 0 = Free, 1 = VIP, 2 = VIP+, etc.
  priceMonth: decimal("price_month", { precision: 10, scale: 2 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  status: integer("status").default(1),

});

// Plans Relations
export const plansRelations = relations(plans, ({ many }) => ({
  features: many(features),
  packages: many(packages),
  aiGalleries: many(aiGalleries),
}));

// 3. Features Table
export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  idPlan: integer("id_plan").references(() => plans.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  available: boolean("available").default(true),
});

// Features Relations
export const featuresRelations = relations(features, ({ one }) => ({
  plan: one(plans, {
    fields: [features.idPlan],
    references: [plans.id],
  }),
}));

// 4. Packages Table
export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  discount: decimal("discount", { precision: 5, scale: 2 }).default("0.00"),
  idPlan: integer("id_plan").references(() => plans.id, { onDelete: "cascade" }),
  time: integer("time").notNull(), // Duration in days or months
});

// Packages Relations
export const packagesRelations = relations(packages, ({ one }) => ({
  plan: one(plans, {
    fields: [packages.idPlan],
    references: [plans.id],
  }),
}));

// 5. Movies Table
export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  idAuthor: integer("id_author").references(() => authors.id, { onDelete: "set null" }),
  imgUrl: varchar("img_url", { length: 500 }), // Thumbnail URL
  createdAt: timestamp("created_at").defaultNow(),
  status: integer("status").default(1),
});

// Movies Relations
export const moviesRelations = relations(movies, ({ one, many }) => ({
  author: one(authors, {
    fields: [movies.idAuthor],
    references: [authors.id],
  }),
  movieCategories: many(movieCategory),
  episodes: many(episodes),
  likes: many(like),
  favorites: many(favorites),
  aiGalleries: many(aiGalleries),
}));

// 6. Categories Table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: integer("status").default(1),
});

// Categories Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  movieCategories: many(movieCategory),
}));

// 7. MovieCategory Junction Table
export const movieCategory = pgTable("movie_category", {
  id: serial("id").primaryKey(),
  idCategory: integer("id_category").references(() => categories.id, { onDelete: "cascade" }),
  idMovie: integer("id_movie").references(() => movies.id, { onDelete: "cascade" }),
});

// MovieCategory Relations
export const movieCategoryRelations = relations(movieCategory, ({ one }) => ({
  category: one(categories, {
    fields: [movieCategory.idCategory],
    references: [categories.id],
  }),
  movie: one(movies, {
    fields: [movieCategory.idMovie],
    references: [movies.id],
  }),
}));

// 8. Characters Table
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  imgUrl: varchar("img_url", { length: 500 }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: integer("status").default(1),
});

// Characters Relations
export const charactersRelations = relations(characters, ({ many }) => ({
  episodesCharacters: many(episodesCharacter),
  galleryCharacters: many(galleryCharacter),
}));

// 9. EpisodesCharacter Junction Table
export const episodesCharacter = pgTable("episodes_character", {
  id: serial("id").primaryKey(),
  idCharacter: integer("id_character").references(() => characters.id, { onDelete: "cascade" }),
  idEpisodes: integer("id_episodes").references(() => episodes.id, { onDelete: "cascade" }),
});

// EpisodesCharacter Relations
export const episodesCharacterRelations = relations(episodesCharacter, ({ one }) => ({
  character: one(characters, {
    fields: [episodesCharacter.idCharacter],
    references: [characters.id],
  }),
  episode: one(episodes, {
    fields: [episodesCharacter.idEpisodes],
    references: [episodes.id],
  }),
}));

// 10. Actors Table
export const actors = pgTable("actors", {
  id: serial("id").primaryKey(),
  imgUrl: varchar("img_url", { length: 500 }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: integer("status").default(1),
});

// Actors Relations
export const actorsRelations = relations(actors, ({ many }) => ({
  episodesActors: many(episodesActor),
}));

// 11. EpisodesActor Junction Table
export const episodesActor = pgTable("episodes_actor", {
  id: serial("id").primaryKey(),
  idActor: integer("id_actor").references(() => actors.id, { onDelete: "cascade" }),
  idEpisodes: integer("id_episodes").references(() => episodes.id, { onDelete: "cascade" }),
});

// EpisodesActor Relations
export const episodesActorRelations = relations(episodesActor, ({ one }) => ({
  actor: one(actors, {
    fields: [episodesActor.idActor],
    references: [actors.id],
  }),
  episode: one(episodes, {
    fields: [episodesActor.idEpisodes],
    references: [episodes.id],
  }),
}));

// 12. Episodes Table
export const episodes = pgTable("episodes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  banner: varchar("banner", { length: 500 }),
  idMovie: integer("id_movie").references(() => movies.id, { onDelete: "cascade" }),
  status: integer("status").default(1),
  idPlan: integer("id_plan").references(() => plans.id, { onDelete: "set null" }),
  url: varchar("url", { length: 500 }),
  views: integer("views").default(0),
  duration: integer("duration").default(0), // Duration in seconds
  // Bunny Stream integration fields (used by webhook)
  bunnyVideoId: varchar("bunny_video_id", { length: 255 }),
  bunnyStatus: varchar("bunny_status", { length: 50 }).default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Episodes Relations
export const episodesRelations = relations(episodes, ({ one, many }) => ({
  movie: one(movies, {
    fields: [episodes.idMovie],
    references: [movies.id],
  }),
  plan: one(plans, {
    fields: [episodes.idPlan],
    references: [plans.id],
  }),
  watchHistories: many(watchHistory),
  episodesActors: many(episodesActor),
  episodesCharacters: many(episodesCharacter),
}));

// 13. Accounts Table
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  gender: varchar("gender", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  role: varchar("role", { length: 50 }).default("user"), // user, admin
  imgUrl: varchar("img_url", { length: 500 }),
  status: integer("status").default(1),
  level: integer("level").default(0),
  expiredAt: timestamp("expired_at"),
});

// Accounts Relations
export const accountsRelations = relations(accounts, ({ many }) => ({
  likes: many(like),
  favorites: many(favorites),
  watchHistories: many(watchHistory),
}));

// 14. Like Junction Table
export const like = pgTable("like", {
  id: serial("id").primaryKey(),
  idMovie: integer("id_movie").references(() => movies.id, { onDelete: "cascade" }),
  idAccount: integer("id_account").references(() => accounts.id, { onDelete: "cascade" }),
});

// Like Relations
export const likeRelations = relations(like, ({ one }) => ({
  movie: one(movies, {
    fields: [like.idMovie],
    references: [movies.id],
  }),
  account: one(accounts, {
    fields: [like.idAccount],
    references: [accounts.id],
  }),
}));

// 15. Favorites Junction Table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  idMovie: integer("id_movie").references(() => movies.id, { onDelete: "cascade" }),
  idAccount: integer("id_account").references(() => accounts.id, { onDelete: "cascade" }),
});

// Favorites Relations
export const favoritesRelations = relations(favorites, ({ one }) => ({
  movie: one(movies, {
    fields: [favorites.idMovie],
    references: [movies.id],
  }),
  account: one(accounts, {
    fields: [favorites.idAccount],
    references: [accounts.id],
  }),
}));

// 16. WatchHistory Table
export const watchHistory = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  idEpisodes: integer("id_episodes").references(() => episodes.id, { onDelete: "cascade" }),
  idAccount: integer("id_account").references(() => accounts.id, { onDelete: "cascade" }),
  watchedAt: timestamp("watched_at").defaultNow(),
});

// WatchHistory Relations
export const watchHistoryRelations = relations(watchHistory, ({ one }) => ({
  episode: one(episodes, {
    fields: [watchHistory.idEpisodes],
    references: [episodes.id],
  }),
  account: one(accounts, {
    fields: [watchHistory.idAccount],
    references: [accounts.id],
  }),
}));

// 17. AI Galleries Table
export const aiGalleries = pgTable("ai_galleries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  idMovie: integer("id_movie").references(() => movies.id, { onDelete: "cascade" }),
  idPlan: integer("id_plan").references(() => plans.id, { onDelete: "set null" }),
  status: integer("status").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  views: integer("views").default(0),
});

// AI Galleries Relations
export const aiGalleriesRelations = relations(aiGalleries, ({ one, many }) => ({
  movie: one(movies, {
    fields: [aiGalleries.idMovie],
    references: [movies.id],
  }),
  plan: one(plans, {
    fields: [aiGalleries.idPlan],
    references: [plans.id],
  }),
  galleryCharacters: many(galleryCharacter),
  images: many(aiImages),
}));

// 18. Gallery Character Junction Table
export const galleryCharacter = pgTable("gallery_character", {
  id: serial("id").primaryKey(),
  idGallery: integer("id_gallery").references(() => aiGalleries.id, { onDelete: "cascade" }),
  idCharacter: integer("id_character").references(() => characters.id, { onDelete: "cascade" }),
});

// Gallery Character Relations
export const galleryCharacterRelations = relations(galleryCharacter, ({ one }) => ({
  gallery: one(aiGalleries, {
    fields: [galleryCharacter.idGallery],
    references: [aiGalleries.id],
  }),
  character: one(characters, {
    fields: [galleryCharacter.idCharacter],
    references: [characters.id],
  }),
}));

// 19. AI Images Table
export const aiImages = pgTable("ai_images", {
  id: serial("id").primaryKey(),
  idGallery: integer("id_gallery").references(() => aiGalleries.id, { onDelete: "cascade" }),
  imgUrl: varchar("img_url", { length: 500 }).notNull(),
  status: integer("status").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Images Relations
export const aiImagesRelations = relations(aiImages, ({ one, many }) => ({
  gallery: one(aiGalleries, {
    fields: [aiImages.idGallery],
    references: [aiGalleries.id],
  }),
  collectionImages: many(collectionImages),
}));

// 20. Collections Table (simple user-defined grouping of AI images)
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Collections Relations
export const collectionsRelations = relations(collections, ({ many }) => ({
  collectionImages: many(collectionImages),
}));

// 21. Collection Images Junction Table
export const collectionImages = pgTable("collection_images", {
  id: serial("id").primaryKey(),
  idCollection: integer("id_collection").references(() => collections.id, { onDelete: "cascade" }),
  idAiImage: integer("id_ai_image").references(() => aiImages.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").defaultNow(),
});

// CollectionImages Relations
export const collectionImagesRelations = relations(collectionImages, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionImages.idCollection],
    references: [collections.id],
  }),
  aiImage: one(aiImages, {
    fields: [collectionImages.idAiImage],
    references: [aiImages.id],
  }),
}));

// 22. Payments Table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderCode: bigint("order_code", { mode: "number" }).notNull().unique(),
  idAccount: integer("id_account").references(() => accounts.id, { onDelete: "cascade" }),
  idPackage: integer("id_package").references(() => packages.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, paid, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments Relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  account: one(accounts, {
    fields: [payments.idAccount],
    references: [accounts.id],
  }),
  package: one(packages, {
    fields: [payments.idPackage],
    references: [packages.id],
  }),
}));
