import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, type InfoSection } from "@/components/layout/InfoPage";
import { ContactForm } from "@/components/ContactForm";
import { getInfoContent } from "@/lib/info-content";
import { useI18n, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/contact")({
  head: () => ({
    meta: [
      { title: "lool — Contact Customer Care" },
      {
        name: "description",
        content:
          "Reach the lool team via live chat, email, or phone — most messages get a real reply within hours.",
      },
    ],
  }),
  component: ContactPage,
});

const FORM_HEADING: Record<Lang, string> = {
  en: "Email us",
  zh: "给我们发邮件",
  es: "Escríbenos",
  fr: "Écrivez-nous",
  de: "Schreib uns",
  it: "Scrivici",
  pt: "Escreva para nós",
  ja: "メールでお問い合わせ",
  ko: "이메일 보내기",
  ar: "راسلنا",
  vi: "Gửi email cho chúng tôi",
  th: "ส่งอีเมลถึงเรา",
  id: "Email kami",
  ms: "E-mel kami",
};

function ContactPage() {
  const { lang } = useI18n();
  const c = getInfoContent("contact", lang);
  const formSection: InfoSection = {
    heading: FORM_HEADING[lang] ?? FORM_HEADING.en,
    body: <ContactForm />,
  };
  return (
    <InfoPage
      eyebrow={c.eyebrow}
      title={c.title}
      intro={c.intro}
      sections={[formSection, ...c.sections]}
      cta={c.cta}
    />
  );
}
