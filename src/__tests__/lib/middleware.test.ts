import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { Middleware } from "@/lib/middleware";

describe("Middleware", () => {
  let middleware: Middleware;

  beforeEach(() => {
    middleware = new Middleware();
  });

  describe("extractSubdomain", () => {
    it("should extract subdomain from valid bioflow.app hostname", () => {
      const hostname = "devdugg.bioflow.app";
      const result = (middleware as any).extractSubdomain(hostname);
      expect(result).toBe("devdugg");
    });

    it("should return null for non-bioflow.app hostname", () => {
      const hostname = "example.com";
      const result = (middleware as any).extractSubdomain(hostname);
      expect(result).toBeNull();
    });

    it("should return null for bioflow.app without subdomain", () => {
      const hostname = "bioflow.app";
      const result = (middleware as any).extractSubdomain(hostname);
      expect(result).toBeNull();
    });

    it("should handle multiple subdomain levels", () => {
      const hostname = "sub.devdugg.bioflow.app";
      const result = (middleware as any).extractSubdomain(hostname);
      expect(result).toBe("sub");
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

  describe("isSubdomainRequest", () => {
    it("should identify bioflow.app subdomain requests", () => {
      expect(
        (middleware as any).isSubdomainRequest("devdugg.bioflow.app")
      ).toBe(true);
      expect((middleware as any).isSubdomainRequest("user.bioflow.app")).toBe(
        true
      );
    });

    it("should reject non-subdomain requests", () => {
      expect((middleware as any).isSubdomainRequest("bioflow.app")).toBe(false);
      expect((middleware as any).isSubdomainRequest("example.com")).toBe(false);
      expect((middleware as any).isSubdomainRequest("localhost:3000")).toBe(
        false
      );
    });
  });

  describe("handle", () => {
    it("should rewrite valid subdomain requests to subdomain route", async () => {
      const request = new NextRequest("https://devdugg.bioflow.app/", {
        headers: { host: "devdugg.bioflow.app" },
      });

      const response = await middleware.handle(request, null);

      expect(response.headers.get("x-middleware-rewrite")).toBe(
        "https://devdugg.bioflow.app/subdomain/devdugg"
      );
    });

    it("should redirect invalid subdomain requests to home", async () => {
      const request = new NextRequest("https://www.bioflow.app/", {
        headers: { host: "www.bioflow.app" },
      });

      const response = await middleware.handle(request, null);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("https://www.bioflow.app/");
    });

    it("should pass through non-subdomain requests", async () => {
      const request = new NextRequest("https://bioflow.app/", {
        headers: { host: "bioflow.app" },
      });

      const response = await middleware.handle(request, null);

      expect(response.headers.get("x-middleware-next")).toBe("1");
    });

    it("should handle protected routes for authenticated users", async () => {
      const request = new NextRequest("https://bioflow.app/login", {
        headers: { host: "bioflow.app" },
      });

      const mockUser = { id: "user123" } as any;
      const response = await middleware.handle(request, mockUser);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "https://bioflow.app/dashboard"
      );
    });

    it("should handle protected routes for unauthenticated users", async () => {
      const request = new NextRequest("https://bioflow.app/dashboard", {
        headers: { host: "bioflow.app" },
      });

      const response = await middleware.handle(request, null);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "https://bioflow.app/login"
      );
    });
  });
});
