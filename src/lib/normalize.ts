/**
 * Normaliza qualquer formato de entrada de Instagram (@user, user,
 * instagram.com/user, https://www.instagram.com/user/?hl=en, etc.)
 * para apenas o username limpo.
 */
export function normalizeInstagramUsername(input: string): string {
  if (!input) return "";

  let value = input.trim();

  // Remove protocolo e domínio do instagram, se presentes.
  value = value.replace(/^https?:\/\//i, "");
  value = value.replace(/^(www\.)?instagram\.com\//i, "");

  // Remove querystring e âncoras.
  value = value.split("?")[0].split("#")[0];

  // Remove barras (inicial e final) e espaços internos.
  value = value.replace(/\/+$/g, "");
  value = value.replace(/^\/+/g, "");
  value = value.trim();

  // Remove arroba inicial.
  value = value.replace(/^@/, "");

  // Remove espaços remanescentes.
  value = value.replace(/\s+/g, "");

  return value;
}

/** Gera o link do perfil do Instagram a partir do username limpo. */
export function getInstagramUrl(username: string): string {
  const clean = normalizeInstagramUsername(username);
  return clean ? `https://instagram.com/${clean}` : "";
}

/** Formata o username para exibição visual (com @). */
export function displayInstagramHandle(username: string): string {
  const clean = normalizeInstagramUsername(username);
  return clean ? `@${clean}` : "";
}

/**
 * Normaliza uma URL de site/página. Aceita com ou sem protocolo.
 * Retorna string vazia se a entrada estiver vazia.
 */
export function normalizeWebsiteUrl(input: string): string {
  if (!input) return "";
  let value = input.trim();
  if (!value) return "";

  value = value.replace(/\s+/g, "");

  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`;
  }

  try {
    const url = new URL(value);
    return url.toString();
  } catch {
    return value;
  }
}

/**
 * Normaliza número/link de WhatsApp para um link https://wa.me/<numero> válido.
 * Aceita links wa.me, api.whatsapp.com/send?phone=..., ou número puro
 * com espaços, parênteses, traços, etc.
 */
export function normalizeWhatsappUrl(input: string): string {
  if (!input) return "";
  const raw = input.trim();
  if (!raw) return "";

  // Link api.whatsapp.com/send?phone=NUMERO
  const apiMatch = raw.match(/api\.whatsapp\.com\/send\?.*phone=(\d+)/i);
  if (apiMatch) {
    return `https://wa.me/${apiMatch[1]}`;
  }

  // Link wa.me/NUMERO
  const waMatch = raw.match(/wa\.me\/(\d+)/i);
  if (waMatch) {
    return `https://wa.me/${waMatch[1]}`;
  }

  // Já é uma URL de whatsapp em outro formato: mantém como está (normalizada).
  if (/^https?:\/\//i.test(raw) && /whatsapp/i.test(raw)) {
    return raw;
  }

  // Número puro: remove tudo que não for dígito.
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  return `https://wa.me/${digits}`;
}

/** Extrai apenas os dígitos de um número de WhatsApp já normalizado. */
export function extractWhatsappNumber(whatsappUrl: string): string {
  const match = whatsappUrl.match(/(\d{8,15})/);
  return match ? match[1] : "";
}
