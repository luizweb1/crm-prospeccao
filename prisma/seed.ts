import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import {
  normalizeWebsiteUrl,
  normalizeWhatsappUrl,
} from "../src/lib/normalize";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não configurada.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.lead.count();
  if (existing > 0) {
    console.log("Leads já existem, pulando seed.");
    return;
  }

  await prisma.lead.createMany({
    data: [
      {
        instagramUsername: "clinica.saude.sp",
        niche: "Clínica estética",
        websiteUrl: "https://clinicasaude.com.br",
        whatsappUrl: "https://wa.me/5511999990000",
        improvementOpportunity: "Site lento e sem prova social na primeira dobra.",
        notes: "Parece ter verba, posta bastante no Instagram.",
        status: "Mensagem Enviada",
        potential: "Alto",
        source: "Instagram",
        firstMessageText: "Olá! Vi o perfil de vocês e reparei em alguns pontos que podem melhorar a conversão do site...",
        firstMessageChannel: "Instagram",
      },
      {
        instagramUsername: "advogado.silva",
        niche: "Advogado",
        websiteUrl: normalizeWebsiteUrl("https://advogadosilva.adv.br"),
        whatsappUrl: normalizeWhatsappUrl("5511988887777"),
        improvementOpportunity: "Página sem CTA claro e copy pouco persuasiva.",
        notes: "Já tem site, mas parece antigo.",
        status: "Em processo",
        potential: "Médio",
        source: "Google",
      },
      {
        instagramUsername: "mentor.digital",
        niche: "Mentor",
        websiteUrl: normalizeWebsiteUrl("mentordigital.com"),
        whatsappUrl: null,
        improvementOpportunity: "Falta de posicionamento premium na landing page.",
        notes: "Produz conteúdo com frequência, público engajado.",
        status: "Ignorado",
        potential: "Baixo",
        source: "Lista fria",
      },
    ],
  });

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
