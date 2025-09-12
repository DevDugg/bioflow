import { getArtistByHandle } from "@/server/artists";
import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const artist = await getArtistByHandle(handle);

  if ("errors" in artist) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: artist.theme?.background ?? "#fff",
          color: artist.theme?.foreground ?? "#000",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <img
          src={artist.image ?? undefined}
          alt={artist.name}
          width={256}
          height={256}
          style={{
            borderRadius: 128,
            border: `4px solid ${artist.theme?.primary ?? "#000"}`,
          }}
        />
        <h1
          style={{
            fontSize: 60,
            fontWeight: 800,
            marginTop: 20,
            color: artist.theme?.primary ?? "#000",
          }}
        >
          {artist.name}
        </h1>
        <p
          style={{
            fontSize: 30,
            fontWeight: 500,
            color: artist.theme?.secondaryForeground ?? "#333",
          }}
        >
          @{artist.slug}
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
