"use server";
import { Vibrant } from "node-vibrant/node";

import { z } from "zod";
import { BadRequestError } from "./errors/bad-request-error";
import { withErrorHandler } from "./errors/error-handler";
import { ModelError } from "./errors/model-error";

const ExtractPalettePayload = z.url("Invalid URL provided");

export const extractPaletteFromUrl = withErrorHandler(async (url: string) => {
  const validation = ExtractPalettePayload.safeParse(url);
  if (!validation.success) {
    throw new BadRequestError(validation.error.message);
  }

  const palette = await Vibrant.from(url).getPalette();
  return {
    Vibrant: palette.Vibrant?.hex,
    Muted: palette.Muted?.hex,
    DarkVibrant: palette.DarkVibrant?.hex,
    DarkMuted: palette.DarkMuted?.hex,
    LightVibrant: palette.LightVibrant?.hex,
    LightMuted: palette.LightMuted?.hex,
  };
});
