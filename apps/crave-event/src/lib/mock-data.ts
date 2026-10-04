export type Playlist = {
  id: string;
  tag: string;
  title: string;
  description: string;
  eventCount: number;
};

export type EventItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  playlist: string;
  category: string;
  type: "free" | "paid";
  price: number;
  startsAt: string;
  durationMinutes: number;
  platform: string;
  location: string;
  zoomLink: string;
  quota: number;
  registered: number;
  attended: number;
  thumbnail: string;
  status: "upcoming" | "live" | "past";
  speaker: string;
  attendanceCode?: string;
};

export type MyEvent = {
  eventId: string;
  registeredAt: string;
  paid: boolean;
  attended: boolean;
  certificateId: string | null;
};

export type Attendee = {
  id: string;
  name: string;
  email: string;
  eventId: string;
  paid: boolean;
  attended: boolean;
  checkInAt: string | null;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  tag: string;
  readMinutes: number;
  publishedAt: string;
  cover: string;
  status: "published" | "draft";
};

export const playlists: Playlist[] = [
  {
    id: "pl-1",
    tag: "#TechTalk",
    title: "Tech Talk",
    description: "Diskusi teknologi, tooling, dan karier di industri digital.",
    eventCount: 12,
  },
  {
    id: "pl-2",
    tag: "#BelajarBareng",
    title: "Belajar Bareng",
    description: "Sesi praktik terpandu, dari dasar sampai studi kasus.",
    eventCount: 9,
  },
  {
    id: "pl-3",
    tag: "#EnglishClub",
    title: "English Club",
    description: "Latihan speaking dan pronunciation bersama native speaker.",
    eventCount: 7,
  },
  {
    id: "pl-4",
    tag: "#CareerLab",
    title: "Career Lab",
    description: "Review CV, interview simulation, dan personal branding.",
    eventCount: 5,
  },
];

export function normalizePlaylistName(name: string): string {
  if (!name) return "";
  return name.replace(/^#/, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function isPlaylistMatch(eventPlaylist: string, target: string): boolean {
  if (!eventPlaylist || !target) return false;
  if (target === "all") return true;

  const normEvent = normalizePlaylistName(eventPlaylist);
  const normTarget = normalizePlaylistName(target);

  if (normEvent === normTarget) return true;

  // Semantic keyword matching between tag, database naming, and title
  if (normEvent.includes("tech") && normTarget.includes("tech")) return true;
  if (normEvent.includes("english") && normTarget.includes("english")) return true;
  if (normEvent.includes("career") && normTarget.includes("career")) return true;
  if (normEvent.includes("belajar") && normTarget.includes("belajar")) return true;

  return normEvent.includes(normTarget) || normTarget.includes(normEvent);
}

export const events: EventItem[] = [
  {
    id: "ev-1",
    slug: "speaking-confidence-lab",
    title: "Speaking Confidence Lab: Ngomong Inggris Tanpa Grogi",
    description: "Teknik praktis membangun percaya diri saat presentasi berbahasa Inggris.",
    longDescription:
      "Sesi 90 menit penuh praktik. Kita bedah kebiasaan yang bikin grogi, latihan pacing, filler control, dan struktur kalimat yang bikin kamu terdengar jelas. Ada breakout room untuk latihan berpasangan dan feedback langsung.",
    playlist: "#EnglishClub",
    category: "Workshop",
    type: "free",
    price: 0,
    startsAt: "2026-10-04T13:00:00+07:00",
    durationMinutes: 90,
    platform: "Zoom",
    location: "Online · Zoom Meeting",
    zoomLink: "https://zoom.us/j/9812341234",
    quota: 300,
    registered: 214,
    attended: 0,
    thumbnail: "linear-gradient(135deg, #0a84ff 0%, #4c9beb 100%)",
    status: "upcoming",
    speaker: "Eka Revandi",
    attendanceCode: "SPEAK-9812",
  },
  {
    id: "ev-2",
    slug: "tech-talk-ai-workflow",
    title: "Tech Talk: Merancang Workflow Harian dengan AI",
    description: "Studi kasus workflow nyata, bukan teori. Lengkap dengan template.",
    longDescription:
      "Kita bahas cara menyusun workflow harian yang realistis dengan bantuan AI: riset, drafting, review, dan otomasi tugas repetitif. Peserta mendapat template Notion dan checklist evaluasi tools.",
    playlist: "#TechTalk",
    category: "Webinar",
    type: "paid",
    price: 79000,
    startsAt: "2026-10-11T19:30:00+07:00",
    durationMinutes: 120,
    platform: "Zoom",
    location: "Online · Zoom Webinar",
    zoomLink: "https://zoom.us/j/5540099881",
    quota: 200,
    registered: 168,
    attended: 0,
    thumbnail: "linear-gradient(135deg, #0056b3 0%, #0a84ff 100%)",
    status: "upcoming",
    speaker: "Eka Revandi",
    attendanceCode: "TECH-2026",
  },
  {
    id: "ev-3",
    slug: "belajar-bareng-pronunciation",
    title: "Belajar Bareng: Pronunciation Clinic Batch 4",
    description: "Klinik pelafalan dengan koreksi langsung per peserta.",
    longDescription:
      "Format klinik: setiap peserta membaca satu paragraf, mendapat koreksi fonetik langsung, lalu latihan minimal pairs. Rekaman sesi dibagikan setelah acara.",
    playlist: "#BelajarBareng",
    category: "Klinik",
    type: "paid",
    price: 49000,
    startsAt: "2026-10-18T10:00:00+07:00",
    durationMinutes: 100,
    platform: "Zoom",
    location: "Online · Zoom Meeting",
    zoomLink: "https://zoom.us/j/7712309981",
    quota: 60,
    registered: 52,
    attended: 0,
    thumbnail: "linear-gradient(135deg, #4c9beb 0%, #e6eef9 100%)",
    status: "upcoming",
    speaker: "Eka Revandi",
    attendanceCode: "CLINIC-4911",
  },
  {
    id: "ev-4",
    slug: "career-lab-cv-review",
    title: "Career Lab: Live CV Review untuk Posisi Global",
    description: "Bedah CV peserta secara live dengan standar rekrutmen internasional.",
    longDescription:
      "Sepuluh CV dibedah live, sisanya dapat checklist penilaian yang sama. Fokus pada bullet impact, keyword ATS, dan cara menulis pengalaman non-linear.",
    playlist: "#CareerLab",
    category: "Webinar",
    type: "free",
    price: 0,
    startsAt: "2026-09-13T19:00:00+07:00",
    durationMinutes: 110,
    platform: "Zoom",
    location: "Online · Zoom Webinar",
    zoomLink: "https://zoom.us/j/3391120044",
    quota: 250,
    registered: 243,
    attended: 198,
    thumbnail: "linear-gradient(135deg, #0a84ff 0%, #0056b3 100%)",
    status: "past",
    speaker: "Eka Revandi",
    attendanceCode: "CAREER-7709",
  },
  {
    id: "ev-5",
    slug: "tech-talk-remote-team",
    title: "Tech Talk: Komunikasi Efektif di Tim Remote Lintas Negara",
    description: "Pola komunikasi async yang bikin tim remote tetap sinkron.",
    longDescription:
      "Membahas written communication, meeting hygiene, dan cara menyampaikan disagreement secara profesional dalam bahasa Inggris di tim lintas zona waktu.",
    playlist: "#TechTalk",
    category: "Webinar",
    type: "paid",
    price: 99000,
    startsAt: "2026-08-23T20:00:00+07:00",
    durationMinutes: 120,
    platform: "Zoom",
    location: "Online · Zoom Webinar",
    zoomLink: "https://zoom.us/j/1129930022",
    quota: 150,
    registered: 141,
    attended: 117,
    thumbnail: "linear-gradient(135deg, #0056b3 0%, #4c9beb 100%)",
    status: "past",
    speaker: "Eka Revandi",
  },
  {
    id: "ev-6",
    slug: "belajar-bareng-email-writing",
    title: "Belajar Bareng: Business Email Writing",
    description: "Template email kerja yang sopan, singkat, dan tepat sasaran.",
    longDescription:
      "Sesi praktik menulis email: request, follow-up, apology, dan negotiation. Setiap peserta menulis dua email dan mendapat koreksi struktur serta tone.",
    playlist: "#BelajarBareng",
    category: "Workshop",
    type: "free",
    price: 0,
    startsAt: "2026-07-19T13:00:00+07:00",
    durationMinutes: 90,
    platform: "Zoom",
    location: "Online · Zoom Meeting",
    zoomLink: "https://zoom.us/j/8890012233",
    quota: 200,
    registered: 187,
    attended: 149,
    thumbnail: "linear-gradient(135deg, #4c9beb 0%, #0a84ff 100%)",
    status: "past",
    speaker: "Eka Revandi",
  },
];

export const myEvents: MyEvent[] = [];


export const attendees: Attendee[] = [];


export const blogPosts: BlogPost[] = [
  {
    id: "bp-1",
    slug: "5-kebiasaan-speaking-harian",
    title: "5 Kebiasaan Harian yang Bikin Speaking-mu Lebih Lancar",
    excerpt:
      "Bukan soal menghafal kosakata. Lima kebiasaan kecil ini yang benar-benar menggeser kelancaranmu dalam sebulan.",
    body: [
      "Banyak orang mengira kelancaran berbicara datang dari jumlah kosakata. Kenyataannya, yang paling menentukan adalah seberapa sering kamu memakai kembali kosakata yang sudah kamu punya.",
      "Kebiasaan pertama: shadowing lima menit setiap pagi. Pilih satu potongan audio pendek, ulangi persis seperti yang kamu dengar, termasuk jedanya. Jeda adalah bagian dari makna.",
      "Kebiasaan kedua: rekam dirimu sekali sehari. Satu menit cukup. Dengarkan lagi dan tandai satu hal saja yang ingin kamu perbaiki besok.",
      "Kebiasaan ketiga: kurangi filler dengan mengganti 'umm' menjadi jeda diam. Jeda terdengar percaya diri; filler terdengar ragu.",
      "Kebiasaan keempat dan kelima kita bahas lebih dalam di sesi #EnglishClub, lengkap dengan latihan berpasangan.",
    ],
    tag: "#EnglishClub",
    readMinutes: 5,
    publishedAt: "2026-09-18",
    cover: "linear-gradient(135deg, #0a84ff 0%, #4c9beb 100%)",
    status: "published",
  },
  {
    id: "bp-2",
    slug: "menyusun-materi-webinar",
    title: "Cara Saya Menyusun Materi Webinar dalam 3 Jam",
    excerpt:
      "Kerangka yang saya pakai untuk setiap sesi: satu janji, tiga bukti, satu latihan.",
    body: [
      "Setiap webinar yang saya bawakan memakai kerangka yang sama: satu janji besar di awal, tiga bukti atau demonstrasi di tengah, dan satu latihan yang bisa langsung dikerjakan peserta.",
      "Janji harus spesifik. 'Belajar bahasa Inggris' bukan janji. 'Mengurangi filler word saat presentasi' adalah janji.",
      "Bukti sebaiknya berupa demonstrasi langsung, bukan slide teori. Peserta mengingat apa yang mereka lihat dikerjakan.",
      "Latihan penutup membuat sesi terasa selesai dan memberi alasan alami untuk absensi serta sertifikat.",
    ],
    tag: "#TechTalk",
    readMinutes: 4,
    publishedAt: "2026-09-05",
    cover: "linear-gradient(135deg, #0056b3 0%, #0a84ff 100%)",
    status: "published",
  },
  {
    id: "bp-3",
    slug: "email-follow-up-yang-dibalas",
    title: "Anatomi Email Follow-up yang Dibalas",
    excerpt: "Tiga kalimat, satu pertanyaan tertutup, dan tanpa basa-basi panjang.",
    body: [
      "Email follow-up gagal biasanya karena terlalu sopan sampai maksudnya hilang. Struktur yang bekerja: konteks satu kalimat, permintaan satu kalimat, tenggat satu kalimat.",
      "Akhiri dengan pertanyaan tertutup agar penerima cukup menjawab ya atau tidak. Semakin ringan beban membalas, semakin cepat balasan datang.",
      "Contoh lengkapnya kita praktikkan di sesi Business Email Writing.",
    ],
    tag: "#BelajarBareng",
    readMinutes: 3,
    publishedAt: "2026-08-21",
    cover: "linear-gradient(135deg, #4c9beb 0%, #e6eef9 100%)",
    status: "published",
  },
  {
    id: "bp-4",
    slug: "draft-interview-simulation",
    title: "Panduan Interview Simulation (Draf)",
    excerpt: "Kerangka latihan interview untuk sesi Career Lab berikutnya.",
    body: ["Draf ini sedang disusun untuk sesi Career Lab batch berikutnya."],
    tag: "#CareerLab",
    readMinutes: 6,
    publishedAt: "2026-09-24",
    cover: "linear-gradient(135deg, #0a84ff 0%, #0056b3 100%)",
    status: "draft",
  },
];

export const revenueTrend = [
  { month: "Apr", peserta: 180, hadir: 142 },
  { month: "Mei", peserta: 220, hadir: 171 },
  { month: "Jun", peserta: 260, hadir: 205 },
  { month: "Jul", peserta: 310, hadir: 249 },
  { month: "Agu", peserta: 348, hadir: 281 },
  { month: "Sep", peserta: 402, hadir: 333 },
];

export const currentUser = {
  name: "Rani Maheswari",
  email: "rani@mail.com",
  role: "Peserta",
  joinedAt: "Maret 2026",
};

export const host = {
  name: "Eka Revandi",
  email: "eka@aether.id",
  role: "Host / Admin",
};

export function getEvent(slug: string) {
  return events.find((e) => e.slug === slug);
}

export function getEventById(id: string) {
  return events.find((e) => e.id === id);
}

export function getPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}

export function formatPrice(price: number) {
  return price === 0 ? "Gratis" : `Rp${price.toLocaleString("id-ID")}`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(iso: string) {
  return `${new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })} WIB`;
}
