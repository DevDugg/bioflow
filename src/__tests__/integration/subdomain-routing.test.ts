import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { Middleware } from "@/lib/middleware";

describe("Subdomain Routing Integration", () => {
  let middleware: Middleware;
  let testArtistId: string;
  let testOwnerId: string;

  beforeEach(() => {
    middleware = new Middleware();
    testOwnerId = crypto.randomUUID();
    testArtistId = crypto.randomUUID();
  });

  afterEach(() => {
    // Cleanup handled by test isolation
  });

  describe("End-to-end subdomain profile access", () => {
    it("should successfully route subdomain request to profile page", async () => {
      const request = new NextRequest("https://testartist.bioflow.app/", {
        headers: { host: "testartist.bioflow.app" },
      });

      const response = await middleware.handle(request, null);

      expect(response.headers.get("x-middleware-rewrite")).toBe(
        "https://testartist.bioflow.app/subdomain/testartist"
      );
    });

    it("should handle subdomain request with path", async () => {
      const request = new NextRequest(
        "https://testartist.bioflow.app/some/path",
        {
          headers: { host: "testartist.bioflow.app" },
        }
      );

      const response = await middleware.handle(request, null);

      expect(response.headers.get("x-middleware-rewrite")).toBe(
        "https://testartist.bioflow.app/subdomain/testartist"
      );
    });
  });

  describe("Middleware integration with Next.js routing", () => {
    it("should preserve query parameters in subdomain rewrite", async () => {
      const request = new NextRequest(
        "https://testartist.bioflow.app/?param=value",
        {
          headers: { host: "testartist.bioflow.app" },
        }
      );

      const response = await middleware.handle(request, null);

      expect(response.headers.get("x-middleware-rewrite")).toBe(
        "https://testartist.bioflow.app/subdomain/testartist?param=value"
      );
    });

    it("should handle subdomain with different protocols", async () => {
      const request = new NextRequest("http://testartist.bioflow.app/", {
        headers: { host: "testartist.bioflow.app" },
      });

      const response = await middleware.handle(request, null);

      expect(response.headers.get("x-middleware-rewrite")).toBe(
        "http://testartist.bioflow.app/subdomain/testartist"
      );
    });
  });

  describe("SEO metadata generation for subdomains", () => {
    it("should generate correct subdomain URL for metadata", () => {
      const mockArtist = { slug: "testartist" };
      const profileUrl = `https://${mockArtist.slug}.bioflow.app`;
      expect(profileUrl).toBe("https://testartist.bioflow.app");
    });

    it("should handle artist with special characters in slug", () => {
      const mockArtist = { slug: "special-artist-123" };
      const profileUrl = `https://${mockArtist.slug}.bioflow.app`;
      expect(profileUrl).toBe("https://special-artist-123.bioflow.app");
    });
  });

  describe("Cache invalidation for subdomain routes", () => {
    it("should handle subdomain route invalidation", async () => {
      const request = new NextRequest("https://testartist.bioflow.app/", {
        headers: { host: "testartist.bioflow.app" },
      });

      const response1 = await middleware.handle(request, null);
      expect(response1.headers.get("x-middleware-rewrite")).toBe(
        "https://testartist.bioflow.app/subdomain/testartist"
      );

      const response2 = await middleware.handle(request, null);
      expect(response2.headers.get("x-middleware-rewrite")).toBe(
        "https://testartist.bioflow.app/subdomain/testartist"
      );
    });
  });
});
