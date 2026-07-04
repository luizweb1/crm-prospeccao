import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Roda em tudo, exceto assets estáticos do Next.js e favicon.
     * As rotas de API e as páginas continuam passando pelo middleware.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
