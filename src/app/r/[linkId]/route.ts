import { db } from "@/db/client";
import { clicks } from "@/db/schemas/analytics";
import { links } from "@/db/schemas/links";
import { withErrorHandler } from "@/server/errors/error-handler";
import { NotFoundError } from "@/server/errors/not-found-error";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";

export const GET = withErrorHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ linkId: string }> }
  ) => {
    const { linkId } = await params;

    if (!linkId) {
      throw new NotFoundError();
    }

    const link = await db.query.links.findFirst({
      where: eq(links.id, linkId),
      columns: {
        url: true,
      },
      with: {
        artist: {
          columns: {
            ownerId: true,
          },
        },
      },
    });

    if (!link || !link.artist) {
      throw new NotFoundError();
    }

    const recordClick = async () => {
      try {
        const headersList = request.headers;
        const ua = headersList.get("user-agent");
        const ref = headersList.get("referer");
        const ip = headersList.get("x-forwarded-for");
        const country = headersList.get("x-vercel-ip-country");
        const device =
          new UAParser(ua ?? undefined).getDevice().type ?? "unknown";

        await db.insert(clicks).values({
          linkId,
          ownerId: link.artist.ownerId,
          ua,
          ref,
          ip,
          country,
          device,
        });
      } catch (error) {
        console.error(`Failed to record click for link ${linkId}:`, error);
      }
    };

    recordClick();

    return NextResponse.redirect(new URL(link.url));
  }
);
