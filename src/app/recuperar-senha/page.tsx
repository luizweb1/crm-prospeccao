"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/alterar-senha`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo,
    });

    setLoading(false);

    if (resetError) {
      setError("Não foi possível enviar o link agora. Aguarde alguns minutos e tente novamente.");
      return;
    }

    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm card p-6">
        <div className="flex flex-col items-center gap-2 pb-6 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl brand-gradient text-white font-bold shadow-sm">
            C
          </div>
          <p className="text-lg font-semibold text-white">Recuperar senha</p>
          <p className="text-sm text-white/50">
            {sent ? "Confira sua caixa de entrada" : "Enviaremos um link seguro para o seu email"}
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <p className="rounded-lg bg-emerald-500/10 px-3 py-3 text-sm text-emerald-300">
              Se o email estiver cadastrado, você receberá um link para criar uma nova senha.
            </p>
            <p className="text-center text-xs text-white/40">
              Verifique também a pasta de spam. O envio pode levar alguns minutos.
            </p>
            <button type="button" onClick={() => setSent(false)} className="btn-secondary w-full justify-center">
              Enviar novamente
            </button>
            <Link href="/login" className="btn-ghost flex w-full justify-center">
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

            <div>
              <label className="field-label">Email cadastrado</label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 field-input"
                autoComplete="email"
                autoFocus
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? "Enviando..." : "Enviar link de recuperação"}
            </button>

            <Link href="/login" className="btn-ghost flex w-full justify-center">
              Voltar ao login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
