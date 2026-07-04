"use client";

import ExternalLink from "@/components/ExternalLink";
import { displayInstagramHandle, getInstagramUrl } from "@/lib/normalize";

export default function InstagramLink({ username, className }: { username: string; className?: string }) {
  if (!username) return <span className="text-white/40">—</span>;
  return (
    <ExternalLink href={getInstagramUrl(username)} className={className}>
      {displayInstagramHandle(username)}
    </ExternalLink>
  );
}
