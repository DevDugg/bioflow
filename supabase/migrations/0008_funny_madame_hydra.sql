ALTER TABLE "links" ALTER COLUMN "link_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "link_type" SET DEFAULT 'link'::text;--> statement-breakpoint
DROP TYPE "public"."link_type";--> statement-breakpoint
CREATE TYPE "public"."link_type" AS ENUM('link', 'social');--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "link_type" SET DEFAULT 'link'::"public"."link_type";--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "link_type" SET DATA TYPE "public"."link_type" USING "link_type"::"public"."link_type";