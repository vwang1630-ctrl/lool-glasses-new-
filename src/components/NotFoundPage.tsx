// 404 page — rendered (with an HTTP 404 status) for unknown URLs instead of
// silently redirecting them to the home page ("soft 404").
import { useRouterState } from "@tanstack/react-router";
import { langFromPath, type Lang } from "@/lib/i18n";

const TEXT: Record<Lang, [title: string, body: string, home: string, shop: string]> = {
  en: ["Page not found", "The page you're looking for doesn't exist or has moved.", "Back to home", "Shop eyeglasses"],
  zh: ["页面不存在", "你访问的页面不存在或已移动。", "返回首页", "选购眼镜"],
  es: ["Página no encontrada", "La página que buscas no existe o se ha movido.", "Volver al inicio", "Comprar gafas"],
  fr: ["Page introuvable", "La page que vous cherchez n'existe pas ou a été déplacée.", "Retour à l'accueil", "Voir les lunettes"],
  de: ["Seite nicht gefunden", "Die gesuchte Seite existiert nicht oder wurde verschoben.", "Zur Startseite", "Brillen ansehen"],
  it: ["Pagina non trovata", "La pagina che cerchi non esiste o è stata spostata.", "Torna alla home", "Acquista occhiali"],
  pt: ["Página não encontrada", "A página que você procura não existe ou foi movida.", "Voltar ao início", "Comprar óculos"],
  ja: ["ページが見つかりません", "お探しのページは存在しないか、移動した可能性があります。", "ホームに戻る", "メガネを見る"],
  ko: ["페이지를 찾을 수 없습니다", "찾으시는 페이지가 없거나 이동되었습니다.", "홈으로 돌아가기", "안경 쇼핑"],
  ar: ["الصفحة غير موجودة", "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.", "العودة إلى الرئيسية", "تسوّق النظارات"],
  vi: ["Không tìm thấy trang", "Trang bạn tìm không tồn tại hoặc đã được chuyển.", "Về trang chủ", "Mua kính"],
  th: ["ไม่พบหน้านี้", "หน้าที่คุณค้นหาไม่มีอยู่หรือถูกย้ายแล้ว", "กลับหน้าแรก", "เลือกซื้อแว่นตา"],
  id: ["Halaman tidak ditemukan", "Halaman yang Anda cari tidak ada atau telah dipindahkan.", "Kembali ke beranda", "Belanja kacamata"],
  ms: ["Halaman tidak ditemui", "Halaman yang anda cari tidak wujud atau telah dialihkan.", "Kembali ke laman utama", "Beli cermin mata"],
};

export function NotFoundPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lang = langFromPath(pathname) ?? "en";
  const [title, body, home, shop] = TEXT[lang] ?? TEXT.en;
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
      <meta name="robots" content="noindex" />
      <p className="font-display text-7xl font-semibold text-primary/80">404</p>
      <h1 className="mt-4 text-2xl md:text-3xl font-semibold font-display">{title}</h1>
      <p className="mt-3 text-muted-foreground">{body}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href={`/${lang}/`}
          className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {home}
        </a>
        <a
          href={`/${lang}/products`}
          className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-medium hover:bg-muted"
        >
          {shop}
        </a>
      </div>
    </div>
  );
}
