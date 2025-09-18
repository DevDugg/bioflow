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
    const parts = hostname.split(".");
    if (
      parts.length >= 3 &&
      parts[parts.length - 2] === "bioflow" &&
      parts[parts.length - 1] === "app"
    ) {
      return parts[0];
    }
    return null;
  }

  private isSubdomainRequest(hostname: string): boolean {
    return this.extractSubdomain(hostname) !== null;
  }

  async handle(request: NextRequest, user: User | null) {
    const { pathname } = request.nextUrl;
    const hostname = request.headers.get("host") || "";

    if (this.isSubdomainRequest(hostname)) {
      const subdomain = this.extractSubdomain(hostname);
      if (subdomain && subdomain !== "www") {
        const url = request.nextUrl.clone();
        url.pathname = `/subdomain/${subdomain}`;
        return NextResponse.rewrite(url);
      }
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
