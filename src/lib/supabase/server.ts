import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Client de Supabase para uso em Server Components e Route Handlers. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // chamado de um Server Component sem permissão de escrita de cookie;
            // o middleware já cuida de manter a sessão atualizada nesse caso.
          }
        },
      },
    },
  );
}
