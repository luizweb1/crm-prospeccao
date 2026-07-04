"use client";

import clsx from "@/lib/clsx";

export default function ExternalLink({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  if (!href) {
    return <span className={clsx("text-white/40", className)}>{children}</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={clsx("text-brand-400 hover:text-brand-300 hover:underline", className)}
    >
      {children}
    </a>
  );
}
