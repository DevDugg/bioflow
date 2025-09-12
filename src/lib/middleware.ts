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

  async handle(request: NextRequest, user: User | null) {
    const { pathname } = request.nextUrl;

    for (const rule of this.routeRules) {
      const isMatch = rule.routes.some((route) => pathname.startsWith(route));
      if (isMatch && rule.condition(user)) {
        return NextResponse.redirect(new URL(rule.redirect, request.url));
      }
    }

    return NextResponse.next();
  }
}
