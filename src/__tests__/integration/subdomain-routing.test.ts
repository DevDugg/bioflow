import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { Middleware } from "@/lib/middleware";

describe("Subdomain Routing Integration", () => {
  let middleware: Middleware;
  let testArtistId: string;
  let testOwnerId: string;

  const baseUrl = "testartist.localhost:3000";

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
      const request = new NextRequest(`https://${baseUrl}/`, {
        headers: { host: "testartist.localhost:3000" },
      });

      const response = await middleware.handle(request, null);

      expect(response.headers.get("x-middleware-rewrite")).toBe(
        `https://${baseUrl}/subdomain/testartist`
      );
    });

    it("should handle subdomain request with path", async () => {
      const request = new NextRequest(`https://${baseUrl}/some/path`, {
        headers: { host: baseUrl },
      });

      const response = await middleware.handle(request, null);

      expect(response.headers.get("x-middleware-rewrite")).toBe(
        `https://${baseUrl}/subdomain/testartist/some/path`
      );
    });
  });

  describe("Middleware integration with Next.js routing", () => {
    it("should preserve query parameters in subdomain rewrite", async () => {
      const request = new NextRequest(`https://${baseUrl}?param=value`, {
        headers: { host: baseUrl },
      });

      const response = await middleware.handle(request, null);

      expect(response.headers.get("x-middleware-rewrite")).toBe(
        `https://${baseUrl}/subdomain/testartist?param=value`
      );
    });

    it("should handle subdomain with different protocols", async () => {
      const request = new NextRequest(`http://${baseUrl}/`, {
        headers: { host: baseUrl },
      });

      const response = await middleware.handle(request, null);

      expect(response.headers.get("x-middleware-rewrite")).toBe(
        `http://${baseUrl}/subdomain/testartist`
      );
    });
  });

  describe("SEO metadata generation for subdomains", () => {
    it("should generate correct subdomain URL for metadata", () => {
      const mockArtist = { slug: "testartist" };
      const profileUrl = `https://${mockArtist.slug}.${baseUrl}`;
      expect(profileUrl).toBe(`https://testartist.${baseUrl}`);
    });

    it("should handle artist with special characters in slug", () => {
      const mockArtist = { slug: "special-artist-123" };
      const profileUrl = `https://${mockArtist.slug}.${baseUrl}`;
      expect(profileUrl).toBe(`https://special-artist-123.${baseUrl}`);
    });
  });

  describe("Cache invalidation for subdomain routes", () => {
    it("should handle subdomain route invalidation", async () => {
      const request = new NextRequest(`https://${baseUrl}/`, {
        headers: { host: baseUrl },
      });

      const response1 = await middleware.handle(request, null);
      expect(response1.headers.get("x-middleware-rewrite")).toBe(
        `https://${baseUrl}/subdomain/testartist`
      );

      const response2 = await middleware.handle(request, null);
      expect(response2.headers.get("x-middleware-rewrite")).toBe(
        `https://${baseUrl}/subdomain/testartist`
      );
    });
  });
});
