CREATE TYPE "public"."link_type" AS ENUM('link', 'social');--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "link_type" "link_type" DEFAULT 'link' NOT NULL;