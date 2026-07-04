"use client";

import { useState } from "react";
import clsx from "@/lib/clsx";

export default function CopyButton({
  text,
  label = "Copiar",
  className,
}: {
  text: string | null | undefined;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  if (!text) return null;

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text as string);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignora falha de clipboard (ex: contexto não seguro)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={clsx(
        "inline-flex items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-xs font-medium text-white/70 hover:bg-white/[0.08] transition-colors",
        copied && "border-green-700 bg-green-500/10 text-green-300",
        className,
      )}
    >
      {copied ? "Copiado com sucesso ✓" : label}
    </button>
  );
}
