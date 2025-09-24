import { extractPaletteFromUrl } from "@/server/theming";
import { expect, test } from "vitest";

test("extractPaletteFromUrl should return a valid palette from a remote URL", async () => {
  const imageUrl = "https://dummyimage.com/1x1/000/fff.png"; // A simple 1x1 black pixel PNG
  const palette = await extractPaletteFromUrl(imageUrl);
  expect(palette).toBeDefined();
  expect(palette).toHaveProperty("Vibrant");
  expect(palette).toHaveProperty("Muted");
  expect(palette).toHaveProperty("DarkVibrant");
  expect(palette).toHaveProperty("DarkMuted");
  expect(palette).toHaveProperty("LightVibrant");
  expect(palette).toHaveProperty("LightMuted");
});
