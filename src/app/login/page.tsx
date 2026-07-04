"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError("Email ou senha incorretos.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm card p-6 space-y-4">
        <div className="flex flex-col items-center gap-2 pb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl brand-gradient text-white font-bold shadow-sm">
            C
          </div>
          <p className="text-lg font-semibold text-white">CRM Prospecção</p>
          <p className="text-sm text-white/50">Entre para continuar</p>
        </div>

        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

        <div>
          <label className="field-label">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 field-input"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="field-label">Senha</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 field-input"
            autoComplete="current-password"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
