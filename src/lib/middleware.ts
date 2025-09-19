import { type NextRequest, NextResponse } from "next/server";
import { type User } from "@supabase/supabase-js";

const PROTECTED_ROUTES = ["/dashboard", "/onboarding"];
const AUTH_ROUTES = ["/login", "/signup"];

interface RouteRule {
  routes: string[];
  condition: (user: User | null) => boolean;
  redirect: string;
}

export class Middleware {
  private routeRules: RouteRule[] = [
    {
      routes: PROTECTED_ROUTES,
      condition: (user) => !user,
      redirect: "/login",
    },
    {
      routes: AUTH_ROUTES,
      condition: (user) => !!user,
      redirect: "/dashboard",
    },
  ];

  private extractSubdomain(hostname: string): string | null {
    const rootDomain = process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
      : null;

    if (!rootDomain) {
      return null;
    }

    const hostnameWithoutPort = hostname.split(":")[0];

    if (!hostnameWithoutPort.endsWith(rootDomain)) {
      return null;
    }

    const rootDomainParts = rootDomain.split(".");
    const hostnameParts = hostnameWithoutPort.split(".");

    if (hostnameParts.length > rootDomainParts.length) {
      return hostnameParts
        .slice(0, hostnameParts.length - rootDomainParts.length)
        .join(".");
    }

    return null;
  }

  private isValidSubdomain(subdomain: string): boolean {
    const reservedSubdomains = [
      "www",
      "api",
      "admin",
      "app",
      "mail",
      "ftp",
      "blog",
      "shop",
      "store",
      "support",
      "help",
      "docs",
      "status",
      "cdn",
      "assets",
      "static",
      "media",
      "images",
      "files",
      "download",
      "upload",
      "dev",
      "staging",
      "test",
      "demo",
      "beta",
      "alpha",
      "preview",
      "sandbox",
    ];

    if (reservedSubdomains.includes(subdomain.toLowerCase())) {
      return false;
    }

    const subdomainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
    return (
      subdomainRegex.test(subdomain) &&
      subdomain.length >= 2 &&
      subdomain.length <= 63
    );
  }

  async handle(request: NextRequest, user: User | null) {
    const { pathname } = request.nextUrl;
    const hostname = request.headers.get("host") || "";
    const subdomain = this.extractSubdomain(hostname);

    if (subdomain) {
      if (this.isValidSubdomain(subdomain)) {
        const url = request.nextUrl.clone();
        url.pathname = `/subdomain/${subdomain}`;
        return NextResponse.rewrite(url);
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    for (const rule of this.routeRules) {
      const isMatch = rule.routes.some((route) => pathname.startsWith(route));
      if (isMatch && rule.condition(user)) {
        return NextResponse.redirect(new URL(rule.redirect, request.url));
      }
    }

    return NextResponse.next();
  }
}
