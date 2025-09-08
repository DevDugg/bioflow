import { type NextRequest } from "next/server";
import { updateSession } from "../supabase/server";
import { Middleware } from "./lib/middleware";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const middleware = new Middleware();
  return middleware.handle(request, user);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
