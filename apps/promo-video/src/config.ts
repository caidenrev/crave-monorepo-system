export const VIDEO_CONFIG = {
  fps: 30,
  durationInFrames: 900, // 30 seconds
  
  // Format Resoluci
  formats: {
    vertical: { width: 1080, height: 1920, id: "CravePromoVertical" },
    square: { width: 1080, height: 1080, id: "CravePromoSquare" },
    landscape: { width: 1920, height: 1080, id: "CravePromoLandscape" },
  },

  // Scene Timings in Frames (30fps)
  timing: {
    hook: { duration: 90 },             // 0-3s
    dashboardHero: { duration: 150 },    // 3-8s
    sidebarDiagonal: { duration: 150 },  // 8-13s
    flipCards: { duration: 180 },        // 13-19s
    itemCards: { duration: 120 },        // 19-23s
    interactiveCta: { duration: 210 },   // 23-30s
  },

  // Color Palette (Light-Mode SaaS Tokens)
  colors: {
    background: "#F8FAFC",
    backgroundGradStart: "#EFF6FF",
    backgroundGradEnd: "#FFFFFF",
    foreground: "#0F172A",
    primary: "#2563EB",
    primaryDark: "#1D4ED8",
    primaryLight: "#DBEAFE",
    cardBg: "#FFFFFF",
    cardBorder: "#E2E8F0",
    muted: "#F1F5F9",
    mutedText: "#64748B",
    success: "#10B981",
    warning: "#F59E0B",
    destructive: "#EF4444",
  },

  // Copy & Texts
  copy: {
    brandName: "Crave POS",
    brandDomain: "pos.crave.id",
    tagline: "Sistem Kasir Pintar UMKM",
    
    // Scene 1: Hook
    hook: {
      badge: "Sistem POS Modern #1",
      headline: "Kelola kasir & pesanan, lebih cepat.",
      subheadline: "Tinggalkan cara manual. Kendalikan seluruh cabang toko dalam satu genggaman.",
    },

    // Scene 2: Dashboard
    dashboard: {
      badge: "Dasbor Analitik Real-Time",
      headline: "Pantau Performa Bisnis Kapan Saja",
      revenue: 14850000,
      revenueDelta: "+12,4%",
      transactions: 184,
      transactionsDelta: "+8,1%",
      lowStock: 4,
      avgBasket: 80700,
    },

    // Scene 3: Sidebar
    sidebar: {
      badge: "Navigasi Cepat",
      headline: "Semua Menu Terintegrasi",
      items: [
        { label: "Kasir", desc: "Transaksi kilat & scan barcode" },
        { label: "Dasbor", desc: "Statistik & analitik harian" },
        { label: "Stok", desc: "Inventaris otomatis berkurang" },
        { label: "Laporan", desc: "Export Excel & rekap instan" },
        { label: "Pengaturan", desc: "Multi-outlet & hak akses" },
      ],
    },

    // Scene 4: Flip Cards
    features: [
      {
        id: "feat-1",
        title: "Kasir Cepat & Barcode",
        subtitle: "Checkout dalam 3 detik",
        tag: "0.5s Scanner",
        desc: "Scan otomatis, hitung kembalian cepat, dan cetak struk bluetooth tanpa lag.",
      },
      {
        id: "feat-2",
        title: "QRIS Dinamis Otomatis",
        subtitle: "Settlement ShopeePay instan",
        tag: "Auto-Check",
        desc: "QRIS unik tiap transaksi, konfirmasi pembayaran otomatis tanpa upload bukti transfer.",
      },
      {
        id: "feat-3",
        title: "Laporan & Rekap Real-time",
        subtitle: "Analitik omzet akurat",
        tag: "Cloud Sync",
        desc: "Pantau omzet, laba bersih, dan produk terlaris langsung dari smartphone Anda.",
      },
      {
        id: "feat-4",
        title: "Manajemen Multi-Cabang",
        subtitle: "Akses kasir & owner aman",
        tag: "RLS Security",
        desc: "Kelola banyak outlet dan staf dengan hak akses bertingkat dan audit log lengkap.",
      },
    ],

    // Scene 5: Products
    products: [
      { id: "p1", name: "Es Kopi Susu", category: "Minuman", price: 18000, stock: 42, sku: "8991001" },
      { id: "p2", name: "Americano", category: "Minuman", price: 16000, stock: 35, sku: "8991002" },
      { id: "p3", name: "Croissant Butter", category: "Makanan", price: 25000, stock: 14, sku: "8991005" },
      { id: "p4", name: "Kentang Goreng", category: "Snack", price: 15000, stock: 30, sku: "8991008" },
    ],

    // Scene 6: CTA
    cta: {
      badge: "Uji Coba Gratis 14 Hari",
      textSequence: [
        "Mulai Sekarang Gratis",
        "Tanpa Kartu Kredit",
        "Setup dalam 2 Menit",
      ],
      inputPlaceholder: "nama@bisnisanda.com",
      successText: "Undangan Terkirim!",
      buttonText: "Daftar Sekarang",
      footerUrl: "pos.crave.id",
      socialHandle: "@cravepos.id",
    },
  },
};
