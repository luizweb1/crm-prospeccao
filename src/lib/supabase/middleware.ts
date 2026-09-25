import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Atualiza a sessão do Supabase a cada requisição e aplica a trava de acesso:
 * - Rotas de API sem sessão: 401 em JSON.
 * - Páginas sem sessão (exceto as rotas públicas de autenticação): redireciona para /login.
 * - /login com sessão ativa: redireciona para o Dashboard.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Login sozinho não concede acesso aos dados do CRM. O banco também atende
  // outros sistemas e usuários futuros do Supabase Auth.
  const allowedUserId = process.env.CRM_ALLOWED_USER_ID;
  const authorized = !!user && !!allowedUserId && user.id === allowedUserId;

  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith("/api");
  const isLoginRoute = pathname === "/login";
  const isPublicAuthRoute =
    isLoginRoute || pathname === "/recuperar-senha" || pathname === "/auth/callback";

  if (isApiRoute && !authorized) {
    return NextResponse.json({ error: user ? "Acesso não autorizado." : "Não autenticado." }, { status: user ? 403 : 401 });
  }

  if (user && !authorized && !isPublicAuthRoute) {
    return new NextResponse("Acesso não autorizado.", { status: 403 });
  }

  if (!user && !isPublicAuthRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (authorized && isLoginRoute) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  return response;
}
