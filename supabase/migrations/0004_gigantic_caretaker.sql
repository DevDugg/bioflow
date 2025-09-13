ALTER TABLE "owners" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "owners" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER POLICY "Allow owners to update their own artist" ON "artists" TO authenticated USING ((select auth.uid()) = owner_id) WITH CHECK  ((select auth.uid()) = owner_id);