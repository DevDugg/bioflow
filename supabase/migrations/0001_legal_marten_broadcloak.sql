CREATE TABLE "clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"link_id" uuid NOT NULL,
	"ts" timestamp with time zone DEFAULT now() NOT NULL,
	"ip" text,
	"ua" text,
	"ref" text,
	"country" text,
	"device" text
);
--> statement-breakpoint
CREATE TABLE "owners" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "links" DROP CONSTRAINT "links_artist_id_artists_id_fk";
--> statement-breakpoint
ALTER TABLE "artists" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "artists" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "artists" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "artists" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "artists" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "artists" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "artists" ADD COLUMN "owner_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "artists" ADD COLUMN "status" text DEFAULT 'published' NOT NULL;--> statement-breakpoint
ALTER TABLE "artists" ADD COLUMN "theme" jsonb;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "icon" text;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "badge" text;--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clicks_link_ts_idx" ON "clicks" USING btree ("link_id","ts");--> statement-breakpoint
CREATE INDEX "clicks_owner_ts_idx" ON "clicks" USING btree ("owner_id","ts");--> statement-breakpoint
ALTER TABLE "artists" ADD CONSTRAINT "artists_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "artists_slug_unique" ON "artists" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "artists_owner_idx" ON "artists" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "links_artist_order_idx" ON "links" USING btree ("artist_id","order");