"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AlterarSenhaPage() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("Não foi possível alterar a senha. Solicite um novo link e tente novamente.");
      return;
    }

    setPassword("");
    setConfirmation("");
    setSuccess(true);
  }

  return (
    <div className="-mt-14 flex min-h-screen items-center justify-center px-4 md:mt-0">
      <div className="w-full max-w-sm card p-6">
        <div className="flex flex-col items-center gap-2 pb-6 text-center">
          <Image src="/brand/symbol.svg" alt="Símbolo LUIIZWEB" width={48} height={48} />
          <p className="text-lg font-semibold text-white">Alterar senha</p>
          <p className="text-sm text-white/50">Cadastre uma senha nova para acessar o CRM</p>
        </div>

        {success ? (
          <div className="space-y-4">
            <p className="rounded-lg bg-emerald-500/10 px-3 py-3 text-sm text-emerald-300">
              Senha alterada com sucesso.
            </p>
            <Link href="/" className="btn-primary flex w-full justify-center">
              Ir para o CRM
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

            <div>
              <label className="field-label">Nova senha</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 field-input"
                autoComplete="new-password"
                autoFocus
              />
              <p className="mt-1.5 text-xs text-white/35">Use pelo menos 8 caracteres.</p>
            </div>

            <div>
              <label className="field-label">Confirmar nova senha</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="mt-1 field-input"
                autoComplete="new-password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? "Alterando..." : "Salvar nova senha"}
            </button>

            <Link href="/" className="btn-ghost flex w-full justify-center">
              Cancelar
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
