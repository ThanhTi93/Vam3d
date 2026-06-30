CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"gender" varchar(50),
	"phone" varchar(50),
	"role" varchar(50) DEFAULT 'user',
	"img_url" varchar(500),
	"status" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "actors" (
	"id" serial PRIMARY KEY NOT NULL,
	"img_url" varchar(500),
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "ai_galleries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"id_movie" integer,
	"id_plan" integer,
	"status" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_gallery" integer,
	"img_url" varchar(500) NOT NULL,
	"status" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "authors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" serial PRIMARY KEY NOT NULL,
	"img_url" varchar(500),
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "collection_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_collection" integer,
	"id_ai_image" integer,
	"added_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "episodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"url" varchar(500),
	"episodes_number" integer NOT NULL,
	"id_movie" integer,
	"status" integer DEFAULT 1,
	"views" integer DEFAULT 0,
	"bunny_video_id" varchar(255),
	"bunny_status" varchar(50) DEFAULT 'completed'
);
--> statement-breakpoint
CREATE TABLE "episodes_actor" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_actor" integer,
	"id_episodes" integer
);
--> statement-breakpoint
CREATE TABLE "episodes_character" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_character" integer,
	"id_episodes" integer
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_movie" integer,
	"id_account" integer
);
--> statement-breakpoint
CREATE TABLE "features" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_plan" integer,
	"name" varchar(255) NOT NULL,
	"available" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "gallery_character" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_gallery" integer,
	"id_character" integer
);
--> statement-breakpoint
CREATE TABLE "like" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_movie" integer,
	"id_account" integer
);
--> statement-breakpoint
CREATE TABLE "movie_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_category" integer,
	"id_movie" integer
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"original_title" varchar(255),
	"description" text,
	"id_author" integer,
	"img_url" varchar(500),
	"banner_url" varchar(500),
	"duration" integer,
	"id_plan" integer,
	"like_count" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"rental_price" numeric(10, 2) DEFAULT '0.00',
	"rating" numeric(3, 1) DEFAULT '0.0',
	"quality" varchar(50) DEFAULT 'HD',
	"sub" varchar(50) DEFAULT 'Vietsub',
	"is_hot" boolean DEFAULT false,
	"year" integer DEFAULT 2026,
	"created_at" timestamp DEFAULT now(),
	"status" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"discount" numeric(5, 2) DEFAULT '0.00',
	"id_plan" integer,
	"time" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"level" integer NOT NULL,
	"price_month" numeric(10, 2) NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "watch_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_episodes" integer,
	"id_account" integer,
	"watched_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ai_galleries" ADD CONSTRAINT "ai_galleries_id_movie_movies_id_fk" FOREIGN KEY ("id_movie") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_galleries" ADD CONSTRAINT "ai_galleries_id_plan_plans_id_fk" FOREIGN KEY ("id_plan") REFERENCES "public"."plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_images" ADD CONSTRAINT "ai_images_id_gallery_ai_galleries_id_fk" FOREIGN KEY ("id_gallery") REFERENCES "public"."ai_galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_images" ADD CONSTRAINT "collection_images_id_collection_collections_id_fk" FOREIGN KEY ("id_collection") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_images" ADD CONSTRAINT "collection_images_id_ai_image_ai_images_id_fk" FOREIGN KEY ("id_ai_image") REFERENCES "public"."ai_images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_id_movie_movies_id_fk" FOREIGN KEY ("id_movie") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episodes_actor" ADD CONSTRAINT "episodes_actor_id_actor_actors_id_fk" FOREIGN KEY ("id_actor") REFERENCES "public"."actors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episodes_actor" ADD CONSTRAINT "episodes_actor_id_episodes_episodes_id_fk" FOREIGN KEY ("id_episodes") REFERENCES "public"."episodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episodes_character" ADD CONSTRAINT "episodes_character_id_character_characters_id_fk" FOREIGN KEY ("id_character") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episodes_character" ADD CONSTRAINT "episodes_character_id_episodes_episodes_id_fk" FOREIGN KEY ("id_episodes") REFERENCES "public"."episodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_id_movie_movies_id_fk" FOREIGN KEY ("id_movie") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_id_account_accounts_id_fk" FOREIGN KEY ("id_account") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "features" ADD CONSTRAINT "features_id_plan_plans_id_fk" FOREIGN KEY ("id_plan") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_character" ADD CONSTRAINT "gallery_character_id_gallery_ai_galleries_id_fk" FOREIGN KEY ("id_gallery") REFERENCES "public"."ai_galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_character" ADD CONSTRAINT "gallery_character_id_character_characters_id_fk" FOREIGN KEY ("id_character") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "like" ADD CONSTRAINT "like_id_movie_movies_id_fk" FOREIGN KEY ("id_movie") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "like" ADD CONSTRAINT "like_id_account_accounts_id_fk" FOREIGN KEY ("id_account") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_category" ADD CONSTRAINT "movie_category_id_category_categories_id_fk" FOREIGN KEY ("id_category") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_category" ADD CONSTRAINT "movie_category_id_movie_movies_id_fk" FOREIGN KEY ("id_movie") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movies" ADD CONSTRAINT "movies_id_author_authors_id_fk" FOREIGN KEY ("id_author") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movies" ADD CONSTRAINT "movies_id_plan_plans_id_fk" FOREIGN KEY ("id_plan") REFERENCES "public"."plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_id_plan_plans_id_fk" FOREIGN KEY ("id_plan") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_id_episodes_episodes_id_fk" FOREIGN KEY ("id_episodes") REFERENCES "public"."episodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_id_account_accounts_id_fk" FOREIGN KEY ("id_account") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;