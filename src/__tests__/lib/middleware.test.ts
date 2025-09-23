import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { Middleware } from "@/lib/middleware";

describe("Middleware", () => {
  let middleware: Middleware;
  const baseUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL!).host;
  beforeEach(() => {
    middleware = new Middleware();
  });

  describe("extractSubdomain", () => {
    it("should extract subdomain from valid subdomain hostname", () => {
      const hostname = `devdugg.${baseUrl}`;
      const result = (middleware as any).extractSubdomain(hostname);
      expect(result).toBe("devdugg");
    });

    it("should return null for non-subdomain hostname", () => {
      const hostname = "example.com";
      const result = (middleware as any).extractSubdomain(hostname);
      expect(result).toBeNull();
    });

    it("should return null for without subdomain", () => {
      const hostname = baseUrl;
      const result = (middleware as any).extractSubdomain(hostname);
      expect(result).toBeNull();
    });

    it("should handle multiple subdomain levels", () => {
      const hostname = `sub.devdugg.${baseUrl}`;
      const result = (middleware as any).extractSubdomain(hostname);
      expect(result).toBe("sub.devdugg");
    });
  });

  describe("isValidSubdomain", () => {
    it("should validate correct subdomain format", () => {
      expect((middleware as any).isValidSubdomain("devdugg")).toBe(true);
      expect((middleware as any).isValidSubdomain("user123")).toBe(true);
      expect((middleware as any).isValidSubdomain("my-handle")).toBe(true);
    });

    it("should reject reserved subdomains", () => {
      const reserved = ["www", "api", "admin", "app", "mail", "ftp"];
      reserved.forEach((subdomain) => {
        expect((middleware as any).isValidSubdomain(subdomain)).toBe(false);
      });
    });

    it("should reject invalid formats", () => {
      expect((middleware as any).isValidSubdomain("")).toBe(false);
      expect((middleware as any).isValidSubdomain("a")).toBe(false);
      expect((middleware as any).isValidSubdomain("-invalid")).toBe(false);
      expect((middleware as any).isValidSubdomain("invalid-")).toBe(false);
      expect((middleware as any).isValidSubdomain("invalid@domain")).toBe(
        false
      );
    });

    it("should reject subdomains that are too long", () => {
      const longSubdomain = "a".repeat(64);
      expect((middleware as any).isValidSubdomain(longSubdomain)).toBe(false);
    });

    it("should accept subdomains at length limits", () => {
      const minSubdomain = "ab";
      const maxSubdomain = "a".repeat(63);
      expect((middleware as any).isValidSubdomain(minSubdomain)).toBe(true);
      expect((middleware as any).isValidSubdomain(maxSubdomain)).toBe(true);
    });
  });

  describe("handle", () => {
    it("should rewrite valid subdomain requests to subdomain route", async () => {
      const request = new NextRequest(`https://devdugg.${baseUrl}/`, {
        headers: { host: `devdugg.${baseUrl}` },
      });

      const response = await middleware.handle(request, null);

      expect(response.headers.get("x-middleware-rewrite")).toBe(
        `https://devdugg.${baseUrl}/subdomain/devdugg`
      );
    });

    it("should redirect invalid subdomain requests to home", async () => {
      const request = new NextRequest(`https://www.${baseUrl}/`, {
        headers: { host: `www.${baseUrl}` },
      });

      const response = await middleware.handle(request, null);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(`https://www.${baseUrl}/`);
    });

    it("should pass through non-subdomain requests", async () => {
      const request = new NextRequest(`https://${baseUrl}/`, {
        headers: { host: baseUrl },
      });

      const response = await middleware.handle(request, null);

      expect(response.headers.get("x-middleware-next")).toBe("1");
    });

    it("should handle protected routes for authenticated users", async () => {
      const request = new NextRequest(`https://${baseUrl}/login`, {
        headers: { host: baseUrl },
      });

      const mockUser = { id: "user123" } as any;
      const response = await middleware.handle(request, mockUser);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        `https://${baseUrl}/dashboard`
      );
    });

    it("should handle protected routes for unauthenticated users", async () => {
      const request = new NextRequest(`https://${baseUrl}/dashboard`, {
        headers: { host: baseUrl },
      });

      const response = await middleware.handle(request, null);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(`https://${baseUrl}/login`);
    });
  });
});
