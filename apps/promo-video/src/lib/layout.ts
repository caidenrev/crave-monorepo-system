/** Tata letak per format. Koordinat dalam piksel kanvas video. */
export type Layout = {
  vertical: boolean;
  /** ukuran layar app virtual */
  app: { width: number; height: number };
  /** jendela app untuk scene fitur */
  feature: { left: number; top: number; width: number; height: number };
  /** jendela app untuk scene overview (hero) */
  hero: { left: number; top: number; width: number; height: number };
  /** posisi blok title pada scene fitur */
  title: { left: number; top: number; width: number };
  heroTitle: { top: number };
  /** kolom grid produk & stok (mengikuti breakpoint pos-system di lebar viewport video) */
  kasirCols: number;
  stokCols: number;
  contentWidth: number;
};

export const LANDSCAPE: Layout = {
  vertical: false,
  app: { width: 1440, height: 1080 },
  feature: { left: 790, top: 150, width: 1040, height: 780 },
  hero: { left: 240, top: 330, width: 1440, height: 1080 },
  title: { left: 120, top: 330, width: 600 },
  heroTitle: { top: 92 },
  kasirCols: 4,
  stokCols: 3,
  contentWidth: 1440 - 288 - 48,
};

export const VERTICAL: Layout = {
  vertical: true,
  app: { width: 1080, height: 1192 },
  feature: { left: 60, top: 740, width: 960, height: 1060 },
  hero: { left: 60, top: 760, width: 960, height: 1060 },
  title: { left: 90, top: 210, width: 900 },
  heroTitle: { top: 210 },
  kasirCols: 3,
  stokCols: 2,
  contentWidth: 1080 - 288 - 48,
};
