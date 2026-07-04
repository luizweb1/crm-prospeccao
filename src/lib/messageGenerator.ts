/**
 * Gerador local de 1ª mensagem, inspirado na abordagem de "conexão antes da
 * venda" (SPIN Selling / GPCTBA&CI) descrita pelo usuário. Estrutura em 3
 * camadas para o primeiro toque frio:
 *
 *   1. Conexão específica, mostra que não é automação genérica.
 *   2. Observação estratégica, aponta oportunidade sem criticar, posicionando
 *                               o Luiz (web designer) como quem constrói
 *                               sistemas de vendas (não só páginas).
 *   3. Permissão para aprofundar, pede permissão em vez de já tentar vender.
 *
 * Perguntas de diagnóstico (SPIN completo) ficam de fora de propósito: essas
 * entram só depois que o lead responde, não no primeiro toque frio.
 */

const GREETINGS_WITH_NAME = [
  (name: string) => `Oi, ${name}!`,
  (name: string) => `Olá, ${name}, tudo bem?`,
  (name: string) => `E aí, ${name}!`,
];

const CONNECTION_WITH_NICHE = [
  (niche: string) => `Vi seu conteúdo sobre ${niche} e achei muito forte a forma como você posiciona o seu trabalho. Dá pra ver que já existe uma audiência aquecida aí.`,
  (niche: string) => `Passei pelo seu perfil de ${niche} e reparei como você já constrói autoridade com o que posta.`,
  (niche: string) => `Vi seu perfil e curti bastante como você se comunica como ${niche}, tem uma identidade bem clara aí.`,
  (niche: string) => `Dei uma olhada no seu conteúdo sobre ${niche} e dá pra perceber que você já tem um posicionamento forte.`,
];

const CONNECTION_GENERIC = [
  "Vi seu perfil e reparei como você já constrói autoridade com o seu conteúdo.",
  "Passei pelo seu Instagram e curti bastante o seu posicionamento.",
  "Vi seu perfil e dá pra perceber que já existe uma audiência aquecida por aí.",
];

const OBSERVATION_WITH_GAP = [
  (gap: string) => `Uma coisa que me chamou atenção: ${stripTrailingPeriod(gap)}. Pode ser que ainda exista espaço para transformar melhor isso em leads e vendas, com uma estrutura mais intencional.`,
  (gap: string) => `Reparei uma oportunidade aí: ${lowerFirst(gap)}. Isso costuma ser sinal de que dá pra converter mais esse tráfego com um sistema mais estratégico por trás.`,
  (gap: string) => `Uma leitura rápida que fiz: ${lowerFirst(gap)}. Talvez ainda falte só uma estrutura mais intencional pra transformar isso em resultado.`,
];

const OBSERVATION_GENERIC = [
  "Percebo que já existe uma boa base de autoridade construída, mas talvez ainda exista espaço para transformar melhor isso em leads e vendas com uma estrutura mais intencional.",
  "Dá pra ver que já existe percepção de autoridade, mas talvez falte só uma estrutura mais intencional pra transformar esse tráfego em vendas.",
];

const POSITIONING = [
  " Sou o Luiz, web designer, e é basicamente o que eu construo: sistemas de vendas completos, com design, copy, funil e implementação, não só uma página.",
  " Aqui é o Luiz, web designer. Trabalho exatamente com isso, arquitetura de sistema de vendas, não só páginas soltas.",
  "", // às vezes fica de fora pra não repetir a apresentação toda hora
  "",
];

const PERMISSION_ASKS = [
  "Faz sentido eu te mandar uma visão rápida do que enxerguei?",
  "Topa eu compartilhar rapidinho uma leitura que fiz do seu perfil, sem compromisso?",
  "Quer que eu te mande uma visão geral disso, bem direto ao ponto?",
  "Faz sentido eu te contar o que percebi, sem enrolação?",
];

function stripTrailingPeriod(text: string): string {
  return text.trim().replace(/\.$/, "");
}

function lowerFirst(text: string): string {
  const trimmed = stripTrailingPeriod(text);
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/** Extrai o primeiro nome de um nome completo, pra soar mais natural na saudação. */
function firstNameOf(fullName: string): string {
  return fullName.trim().split(/\s+/)[0];
}

/**
 * Gera um rascunho de 1ª mensagem (saudação com nome → conexão → observação
 * estratégica → permissão) com base no nome, nicho e análise de melhoria do
 * lead. Varia a combinação a cada chamada para não soar repetitivo/robótico.
 */
export function generateFirstMessage(
  contactName: string | null | undefined,
  niche: string,
  improvementOpportunity: string | null,
): string {
  const greeting = contactName?.trim() ? pickRandom(GREETINGS_WITH_NAME)(firstNameOf(contactName)) : "";

  const connection = niche.trim()
    ? pickRandom(CONNECTION_WITH_NICHE)(niche.trim())
    : pickRandom(CONNECTION_GENERIC);

  const observation = improvementOpportunity?.trim()
    ? pickRandom(OBSERVATION_WITH_GAP)(improvementOpportunity.trim())
    : pickRandom(OBSERVATION_GENERIC);

  const positioning = pickRandom(POSITIONING);
  const permission = pickRandom(PERMISSION_ASKS);

  return [greeting, connection, observation + positioning, permission].filter(Boolean).join(" ");
}
