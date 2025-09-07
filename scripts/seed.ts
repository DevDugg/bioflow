import "dotenv/config";
import { db } from "@/db/client";
import { owners, artists, links } from "@/db/schemas";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clean up existing data
  await db.delete(links);
  await db.delete(artists);
  await db.delete(owners);
  console.log("🧹 Cleaned up existing data.");

  const ownerId = process.env.SEED_OWNER_ID ?? crypto.randomUUID();

  await db.insert(owners).values({
    id: ownerId,
    email: "dev@bioflow.com",
    name: "Dev Owner",
  });
  console.log(`👤 Created owner with ID: ${ownerId}`);

  await db.insert(artists).values({
    ownerId: ownerId,
    name: "Melody Bloom",
    slug: "melodybloom",
    description:
      "Indie artist crafting dreamy soundscapes. Listen to my latest single 'Ocean Eyes' now!",
    image: `https://i.pravatar.cc/150?u=melodybloom`,
  });
  console.log("🎤 Created artist: Melody Bloom");

  const [artist] = await db
    .select()
    .from(artists)
    .where(sql`${artists.slug} = 'melodybloom'`);

  if (!artist) {
    console.error("Could not find artist to seed links for.");
    return;
  }

  await db.insert(links).values([
    {
      artistId: artist.id,
      label: "Listen on Spotify",
      url: "#",
      icon: "music",
      order: 0,
    },
    {
      artistId: artist.id,
      label: "Listen on Apple Music",
      url: "#",
      icon: "music",
      order: 1,
    },
    {
      artistId: artist.id,
      label: "Official Website",
      url: "#",
      icon: "globe",
      order: 2,
    },
    {
      artistId: artist.id,
      label: "Follow on Twitter",
      url: "#",
      icon: "twitter",
      order: 3,
    },
    {
      artistId: artist.id,
      label: "Follow on Instagram",
      url: "#",
      icon: "instagram",
      order: 4,
    },
    {
      artistId: artist.id,
      label: "Watch on YouTube",
      url: "#",
      icon: "youtube",
      order: 5,
    },
    {
      artistId: artist.id,
      label: "Upcoming Tour Dates",
      url: "#",
      icon: "mic2",
      order: 6,
    },
  ]);
  console.log(`🔗 Created ${7} links for ${artist.name}`);

  console.log("✅ Seeding complete.");
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
