import {
  useRef,
  useState,
  type FormEvent,
  type DragEvent,
  type ChangeEvent,
} from "react";
import { Upload, X } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";

const MAX_TOTAL_BYTES = 10 * 1024 * 1024;

type SubjectKey =
  | "order"
  | "product"
  | "prescription"
  | "shipping"
  | "partner"
  | "other";

const SUBJECT_KEYS: SubjectKey[] = [
  "order",
  "product",
  "prescription",
  "shipping",
  "partner",
  "other",
];

type Country = { code: string; dial: string };

const COUNTRIES: Country[] = [
  { code: "US", dial: "+1" },
  { code: "CA", dial: "+1" },
  { code: "GB", dial: "+44" },
  { code: "FR", dial: "+33" },
  { code: "DE", dial: "+49" },
  { code: "IT", dial: "+39" },
  { code: "ES", dial: "+34" },
  { code: "PT", dial: "+351" },
  { code: "JP", dial: "+81" },
  { code: "KR", dial: "+82" },
  { code: "CN", dial: "+86" },
  { code: "HK", dial: "+852" },
  { code: "TW", dial: "+886" },
  { code: "SG", dial: "+65" },
  { code: "AU", dial: "+61" },
  { code: "NZ", dial: "+64" },
  { code: "MX", dial: "+52" },
  { code: "BR", dial: "+55" },
  { code: "IN", dial: "+91" },
  { code: "AE", dial: "+971" },
  { code: "SA", dial: "+966" },
];

type Dict = {
  name: string;
  namePh: string;
  email: string;
  emailPh: string;
  phone: string;
  phoneHint: string;
  subject: string;
  subjectPh: string;
  message: string;
  attachments: string;
  drop: string;
  dropLimit: string;
  submit: string;
  submitting: string;
  ok: string;
  err: string;
  errSize: string;
  required: string;
  subjects: Record<SubjectKey, string>;
};

const I18N: Record<Lang, Dict> = {
  en: {
    name: "Name",
    namePh: "Your full name",
    email: "Email",
    emailPh: "Please confirm your email address.",
    phone: "Phone",
    phoneHint: "We'll only call if necessary.",
    subject: "Subject",
    subjectPh: "Choose a topic",
    message: "Message",
    attachments: "Attachments",
    drop: "Drop files here",
    dropLimit: "Attachment limit 10 MB.",
    submit: "Submit",
    submitting: "Submitting…",
    ok: "Thanks — your message is on its way. We'll reply within a few hours.",
    err: "Something went wrong. Please try again or email hello@loollook.com.",
    errSize: "Attachments exceed 10 MB.",
    required: "Required",
    subjects: {
      order: "Order question",
      product: "Product question",
      prescription: "Prescription / vision",
      shipping: "Shipping & returns",
      partner: "Partnership",
      other: "Other",
    },
  },
  zh: {
    name: "姓名",
    namePh: "你的全名",
    email: "电子邮件",
    emailPh: "请您确认一下您的邮箱地址。",
    phone: "电话",
    phoneHint: "如有必要，我们会与您联系。",
    subject: "主题",
    subjectPh: "请选择主题",
    message: "信息",
    attachments: "附件",
    drop: "将文件拖放到此处",
    dropLimit: "附件大小限制为 10 MB。",
    submit: "提交",
    submitting: "提交中…",
    ok: "感谢您的留言，我们会在数小时内回复。",
    err: "提交失败，请重试或发邮件至 hello@loollook.com。",
    errSize: "附件超过 10 MB 限制。",
    required: "必填",
    subjects: {
      order: "订单咨询",
      product: "产品咨询",
      prescription: "处方 / 视力",
      shipping: "配送 / 退换",
      partner: "商务合作",
      other: "其他",
    },
  },
  es: {
    name: "Nombre",
    namePh: "Tu nombre completo",
    email: "Correo electrónico",
    emailPh: "Confirma tu correo, por favor.",
    phone: "Teléfono",
    phoneHint: "Solo llamaremos si es necesario.",
    subject: "Asunto",
    subjectPh: "Elige un tema",
    message: "Mensaje",
    attachments: "Adjuntos",
    drop: "Suelta los archivos aquí",
    dropLimit: "Límite de adjuntos: 10 MB.",
    submit: "Enviar",
    submitting: "Enviando…",
    ok: "Gracias, tu mensaje va en camino. Responderemos en pocas horas.",
    err: "Algo salió mal. Vuelve a intentarlo o escribe a hello@loollook.com.",
    errSize: "Los adjuntos superan 10 MB.",
    required: "Obligatorio",
    subjects: {
      order: "Consulta de pedido",
      product: "Consulta de producto",
      prescription: "Receta / visión",
      shipping: "Envío y devoluciones",
      partner: "Colaboración",
      other: "Otros",
    },
  },
  fr: {
    name: "Nom",
    namePh: "Votre nom complet",
    email: "E-mail",
    emailPh: "Merci de confirmer votre adresse e-mail.",
    phone: "Téléphone",
    phoneHint: "Nous n'appellerons qu'en cas de besoin.",
    subject: "Sujet",
    subjectPh: "Choisissez un sujet",
    message: "Message",
    attachments: "Pièces jointes",
    drop: "Déposez vos fichiers ici",
    dropLimit: "Limite des pièces jointes : 10 Mo.",
    submit: "Envoyer",
    submitting: "Envoi…",
    ok: "Merci, votre message est en route. Réponse sous quelques heures.",
    err: "Une erreur est survenue. Réessayez ou écrivez à hello@loollook.com.",
    errSize: "Les pièces jointes dépassent 10 Mo.",
    required: "Obligatoire",
    subjects: {
      order: "Question commande",
      product: "Question produit",
      prescription: "Ordonnance / vision",
      shipping: "Livraison & retours",
      partner: "Partenariat",
      other: "Autre",
    },
  },
  de: {
    name: "Name",
    namePh: "Dein vollständiger Name",
    email: "E-Mail",
    emailPh: "Bitte bestätige deine E-Mail-Adresse.",
    phone: "Telefon",
    phoneHint: "Wir rufen nur an, wenn es nötig ist.",
    subject: "Betreff",
    subjectPh: "Thema wählen",
    message: "Nachricht",
    attachments: "Anhänge",
    drop: "Dateien hier ablegen",
    dropLimit: "Anhangsgröße max. 10 MB.",
    submit: "Absenden",
    submitting: "Sende…",
    ok: "Danke — deine Nachricht ist unterwegs. Antwort in wenigen Stunden.",
    err: "Etwas ist schiefgelaufen. Bitte erneut versuchen oder hello@loollook.com.",
    errSize: "Anhänge überschreiten 10 MB.",
    required: "Pflichtfeld",
    subjects: {
      order: "Bestellfrage",
      product: "Produktfrage",
      prescription: "Rezept / Sehstärke",
      shipping: "Versand & Rückgabe",
      partner: "Partnerschaft",
      other: "Sonstiges",
    },
  },
  it: {
    name: "Nome",
    namePh: "Il tuo nome completo",
    email: "Email",
    emailPh: "Conferma il tuo indirizzo email.",
    phone: "Telefono",
    phoneHint: "Chiameremo solo se necessario.",
    subject: "Oggetto",
    subjectPh: "Scegli un argomento",
    message: "Messaggio",
    attachments: "Allegati",
    drop: "Trascina i file qui",
    dropLimit: "Limite allegati 10 MB.",
    submit: "Invia",
    submitting: "Invio…",
    ok: "Grazie, il messaggio è in arrivo. Risponderemo in poche ore.",
    err: "Qualcosa è andato storto. Riprova o scrivi a hello@loollook.com.",
    errSize: "Gli allegati superano i 10 MB.",
    required: "Obbligatorio",
    subjects: {
      order: "Domanda ordine",
      product: "Domanda prodotto",
      prescription: "Ricetta / vista",
      shipping: "Spedizione e resi",
      partner: "Collaborazione",
      other: "Altro",
    },
  },
  pt: {
    name: "Nome",
    namePh: "Seu nome completo",
    email: "E-mail",
    emailPh: "Confirme seu endereço de e-mail.",
    phone: "Telefone",
    phoneHint: "Só ligamos se for necessário.",
    subject: "Assunto",
    subjectPh: "Escolha um assunto",
    message: "Mensagem",
    attachments: "Anexos",
    drop: "Solte os arquivos aqui",
    dropLimit: "Limite de anexo: 10 MB.",
    submit: "Enviar",
    submitting: "Enviando…",
    ok: "Obrigado — sua mensagem está a caminho. Responderemos em poucas horas.",
    err: "Algo deu errado. Tente de novo ou escreva para hello@loollook.com.",
    errSize: "Anexos ultrapassam 10 MB.",
    required: "Obrigatório",
    subjects: {
      order: "Dúvida de pedido",
      product: "Dúvida de produto",
      prescription: "Receita / visão",
      shipping: "Envio e devoluções",
      partner: "Parceria",
      other: "Outros",
    },
  },
  ja: {
    name: "お名前",
    namePh: "フルネーム",
    email: "メールアドレス",
    emailPh: "メールアドレスをご確認ください。",
    phone: "電話番号",
    phoneHint: "必要な場合のみご連絡します。",
    subject: "件名",
    subjectPh: "トピックを選択",
    message: "メッセージ",
    attachments: "添付ファイル",
    drop: "ここにファイルをドロップ",
    dropLimit: "添付ファイルは 10 MB まで。",
    submit: "送信",
    submitting: "送信中…",
    ok: "ありがとうございます。数時間以内にご返信いたします。",
    err: "送信に失敗しました。もう一度お試しいただくか hello@loollook.com までご連絡ください。",
    errSize: "添付ファイルが 10 MB を超えています。",
    required: "必須",
    subjects: {
      order: "注文について",
      product: "商品について",
      prescription: "処方 / 視力",
      shipping: "配送・返品",
      partner: "提携",
      other: "その他",
    },
  },
  ko: {
    name: "이름",
    namePh: "성함",
    email: "이메일",
    emailPh: "이메일 주소를 확인해 주세요.",
    phone: "전화번호",
    phoneHint: "필요한 경우에만 연락드립니다.",
    subject: "주제",
    subjectPh: "주제를 선택하세요",
    message: "메시지",
    attachments: "첨부 파일",
    drop: "여기에 파일을 놓으세요",
    dropLimit: "첨부 파일 제한 10 MB.",
    submit: "보내기",
    submitting: "전송 중…",
    ok: "감사합니다. 몇 시간 안에 답변드리겠습니다.",
    err: "전송에 실패했습니다. 다시 시도하거나 hello@loollook.com 로 이메일을 보내주세요.",
    errSize: "첨부 파일이 10 MB를 초과합니다.",
    required: "필수",
    subjects: {
      order: "주문 문의",
      product: "제품 문의",
      prescription: "처방 / 시력",
      shipping: "배송 / 반품",
      partner: "파트너십",
      other: "기타",
    },
  },
  ar: {
    name: "الاسم",
    namePh: "اسمك الكامل",
    email: "البريد الإلكتروني",
    emailPh: "يرجى تأكيد عنوان بريدك الإلكتروني.",
    phone: "الهاتف",
    phoneHint: "سنتصل عند الضرورة فقط.",
    subject: "الموضوع",
    subjectPh: "اختر موضوعًا",
    message: "الرسالة",
    attachments: "المرفقات",
    drop: "أفلت الملفات هنا",
    dropLimit: "حدّ المرفقات 10 ميغابايت.",
    submit: "إرسال",
    submitting: "جاري الإرسال…",
    ok: "شكرًا — رسالتك في طريقها إلينا، سنردّ خلال ساعات قليلة.",
    err: "حدث خطأ. يرجى المحاولة مرة أخرى أو مراسلتنا على hello@loollook.com.",
    errSize: "المرفقات تتجاوز 10 ميغابايت.",
    required: "مطلوب",
    subjects: {
      order: "استفسار طلب",
      product: "استفسار منتج",
      prescription: "وصفة / نظر",
      shipping: "الشحن والإرجاع",
      partner: "شراكة",
      other: "آخر",
    },
  },
  vi: {
    name: "Họ tên",
    namePh: "Họ và tên đầy đủ",
    email: "Email",
    emailPh: "Vui lòng xác nhận địa chỉ email của bạn.",
    phone: "Số điện thoại",
    phoneHint: "Chúng tôi chỉ gọi khi cần thiết.",
    subject: "Chủ đề",
    subjectPh: "Chọn một chủ đề",
    message: "Nội dung",
    attachments: "Tệp đính kèm",
    drop: "Thả tệp vào đây",
    dropLimit: "Giới hạn đính kèm 10 MB.",
    submit: "Gửi",
    submitting: "Đang gửi…",
    ok: "Cảm ơn bạn — tin nhắn đã được gửi. Chúng tôi sẽ phản hồi trong vài giờ.",
    err: "Có lỗi xảy ra. Vui lòng thử lại hoặc gửi email tới hello@loollook.com.",
    errSize: "Tệp đính kèm vượt quá 10 MB.",
    required: "Bắt buộc",
    subjects: {
      order: "Câu hỏi về đơn hàng",
      product: "Câu hỏi về sản phẩm",
      prescription: "Đơn kính / thị lực",
      shipping: "Vận chuyển & đổi trả",
      partner: "Hợp tác",
      other: "Khác",
    },
  },
  th: {
    name: "ชื่อ",
    namePh: "ชื่อ-นามสกุล",
    email: "อีเมล",
    emailPh: "โปรดยืนยันที่อยู่อีเมลของคุณ",
    phone: "เบอร์โทรศัพท์",
    phoneHint: "เราจะติดต่อเฉพาะเมื่อจำเป็น",
    subject: "หัวข้อ",
    subjectPh: "เลือกหัวข้อ",
    message: "ข้อความ",
    attachments: "ไฟล์แนบ",
    drop: "วางไฟล์ที่นี่",
    dropLimit: "จำกัดไฟล์แนบ 10 MB",
    submit: "ส่ง",
    submitting: "กำลังส่ง…",
    ok: "ขอบคุณค่ะ — ข้อความของคุณกำลังเดินทาง เราจะตอบกลับภายในไม่กี่ชั่วโมง",
    err: "เกิดข้อผิดพลาด กรุณาลองใหม่หรือส่งอีเมลถึง hello@loollook.com",
    errSize: "ไฟล์แนบเกิน 10 MB",
    required: "จำเป็น",
    subjects: {
      order: "สอบถามคำสั่งซื้อ",
      product: "สอบถามสินค้า",
      prescription: "ใบสั่งแว่น / สายตา",
      shipping: "การจัดส่งและคืนสินค้า",
      partner: "ความร่วมมือ",
      other: "อื่น ๆ",
    },
  },
  id: {
    name: "Nama",
    namePh: "Nama lengkap Anda",
    email: "Email",
    emailPh: "Mohon konfirmasi alamat email Anda.",
    phone: "Telepon",
    phoneHint: "Kami hanya menelepon jika perlu.",
    subject: "Topik",
    subjectPh: "Pilih topik",
    message: "Pesan",
    attachments: "Lampiran",
    drop: "Letakkan file di sini",
    dropLimit: "Batas lampiran 10 MB.",
    submit: "Kirim",
    submitting: "Mengirim…",
    ok: "Terima kasih — pesan Anda sedang dikirim. Kami akan balas dalam beberapa jam.",
    err: "Terjadi kesalahan. Coba lagi atau email ke hello@loollook.com.",
    errSize: "Lampiran melebihi 10 MB.",
    required: "Wajib",
    subjects: {
      order: "Pertanyaan pesanan",
      product: "Pertanyaan produk",
      prescription: "Resep / penglihatan",
      shipping: "Pengiriman & pengembalian",
      partner: "Kerja sama",
      other: "Lainnya",
    },
  },
  ms: {
    name: "Nama",
    namePh: "Nama penuh anda",
    email: "E-mel",
    emailPh: "Sila sahkan alamat e-mel anda.",
    phone: "Telefon",
    phoneHint: "Kami hanya akan menghubungi jika perlu.",
    subject: "Topik",
    subjectPh: "Pilih topik",
    message: "Mesej",
    attachments: "Lampiran",
    drop: "Lepaskan fail di sini",
    dropLimit: "Had lampiran 10 MB.",
    submit: "Hantar",
    submitting: "Menghantar…",
    ok: "Terima kasih — mesej anda sedang dalam perjalanan. Kami akan balas dalam beberapa jam.",
    err: "Berlaku ralat. Sila cuba lagi atau e-mel ke hello@loollook.com.",
    errSize: "Lampiran melebihi 10 MB.",
    required: "Wajib",
    subjects: {
      order: "Pertanyaan pesanan",
      product: "Pertanyaan produk",
      prescription: "Preskripsi / penglihatan",
      shipping: "Penghantaran & pemulangan",
      partner: "Perkongsian",
      other: "Lain-lain",
    },
  },
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function ContactForm() {
  const { lang } = useI18n();
  const t = I18N[lang] ?? I18N.en;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("US");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState<SubjectKey | "">("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">(
    "idle",
  );
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);

  function addFiles(incoming: FileList | File[]) {
    const next = [...files, ...Array.from(incoming)];
    const next_total = next.reduce((s, f) => s + f.size, 0);
    if (next_total > MAX_TOTAL_BYTES) {
      setErrMsg(t.errSize);
      return;
    }
    setErrMsg(null);
    setFiles(next);
  }

  function removeFile(idx: number) {
    setFiles(files.filter((_, i) => i !== idx));
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) addFiles(e.target.files);
    // Allow re-selecting the same file.
    e.target.value = "";
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!subject) return;
    setStatus("submitting");
    setErrMsg(null);

    const fd = new FormData();
    fd.append("name", name);
    fd.append("email", email);
    fd.append(
      "phoneCountry",
      COUNTRIES.find((c) => c.code === phoneCountry)?.dial ?? "",
    );
    fd.append("phone", phone);
    fd.append("subject", subject);
    fd.append("message", message);
    files.forEach((f) => fd.append("files", f));

    try {
      const res = await fetch("/api/contact", { method: "POST", body: fd });
      if (!res.ok) throw new Error("server");
      setStatus("ok");
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
      setFiles([]);
    } catch {
      setStatus("error");
      setErrMsg(t.err);
    }
  }

  if (status === "ok") {
    return <p className="text-base text-foreground">{t.ok}</p>;
  }

  const labelCls = "block text-sm font-medium text-foreground mb-1.5";
  const reqMark = <span className="text-destructive ms-0.5">*</span>;
  const inputCls =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="cf-name" className={labelCls}>
          {t.name}
          {reqMark}
        </label>
        <input
          id="cf-name"
          type="text"
          required
          maxLength={200}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.namePh}
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="cf-email" className={labelCls}>
          {t.email}
          {reqMark}
        </label>
        <input
          id="cf-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.emailPh}
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="cf-phone" className={labelCls}>
          {t.phone}
        </label>
        <div className="flex gap-2">
          <select
            aria-label={t.phone}
            value={phoneCountry}
            onChange={(e) => setPhoneCountry(e.target.value)}
            className={`${inputCls} w-32 shrink-0`}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.dial})
              </option>
            ))}
          </select>
          <input
            id="cf-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.phoneHint}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor="cf-subject" className={labelCls}>
          {t.subject}
          {reqMark}
        </label>
        <select
          id="cf-subject"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value as SubjectKey)}
          className={`${inputCls} ${!subject ? "text-muted-foreground" : ""}`}
        >
          <option value="" disabled>
            {t.subjectPh}
          </option>
          {SUBJECT_KEYS.map((k) => (
            <option key={k} value={k} className="text-foreground">
              {t.subjects[k]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cf-message" className={labelCls}>
          {t.message}
          {reqMark}
        </label>
        <textarea
          id="cf-message"
          required
          maxLength={5000}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputCls} h-auto min-h-[120px] resize-y`}
        />
      </div>

      <div>
        <span className={labelCls}>{t.attachments}</span>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-8 cursor-pointer transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/60"
          }`}
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-foreground">{t.drop}</p>
          <p className="text-xs text-muted-foreground">{t.dropLimit}</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        {files.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm"
              >
                <span className="truncate">
                  {f.name}{" "}
                  <span className="text-muted-foreground">
                    ({formatBytes(f.size)})
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="ms-3 text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${f.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
            <li className="text-xs text-muted-foreground">
              {formatBytes(totalBytes)} / 10 MB
            </li>
          </ul>
        )}
      </div>

      {errMsg && <p className="text-sm text-destructive">{errMsg}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="h-12 w-full rounded-md bg-primary text-primary-foreground text-base font-medium shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {status === "submitting" ? t.submitting : t.submit}
      </button>
    </form>
  );
}
