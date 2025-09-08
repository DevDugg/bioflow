import { type NextRequest, NextResponse } from "next/server";
import { type User } from "@supabase/supabase-js";

export class Middleware {
  private protectedRoutes = ["/dashboard"];
  private authRoutes = ["/login", "/signup"];
  private publicRoutes = ["/", "/auth/confirm"];

  async handle(request: NextRequest, user: User | null) {
    const { pathname } = request.nextUrl;

    const isProtectedRoute = this.protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );
    const isAuthRoute = this.authRoutes.some((route) =>
      pathname.startsWith(route)
    );
    const isPublicRoute = this.publicRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isProtectedRoute && !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAuthRoute && user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (isPublicRoute) {
      return NextResponse.next();
    }

    return NextResponse.next();
  }
}
