import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, FileText, Plus, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../../../components/aether/dashboard-shell";
import { ImageUploader, DEFAULT_PRESET_BANNERS } from "../../../components/aether/image-uploader";
import { MarkdownEditor } from "../../../components/aether/markdown-editor";
import { Button, ButtonLink } from "../../../components/aether/primitives";
import { useApp } from "../../../lib/store";

export const Route = createFileRoute("/admin/blog/new")({
  component: AdminNewBlogPage,
});

function AdminNewBlogPage() {
  const navigate = useNavigate();
  const { playlists, createBlogPost } = useApp();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tag, setTag] = useState(playlists[0]?.tag || "#TechTalk");
  const [readMinutes, setReadMinutes] = useState(4);
  const [excerpt, setExcerpt] = useState("");
  const [bodyText, setBodyText] = useState(
    `## Pengantar Materi\n\nSelamat datang di artikel pembelajaran kali ini. Topik ini dirancang khusus untuk membagikan wawasan praktis, teknik langsung, dan studi kasus nyata yang relevan.\n\n### Poin-Poin Utama yang Dipelajari:\n- Penguasaan konsep arsitektur & implementasi nyata\n- Best practice komunikasi dan kolaborasi tim\n- Otomasi alur kerja harian untuk efisiensi maksimal\n\n> "Pembelajaran terbaik lahir dari konsistensi praktik terpandu, bukan sekadar hafalan teori."\n\n\`\`\`typescript\n// Contoh struktur implementasi\nexport function solveChallenge() {\n  return "Fokus pada satu prioritas utama setiap sesi";\n}\n\`\`\`\n\nMari kita telaah langkah implementasinya secara terstruktur pada sub-bab berikut!`,
  );
  const [cover, setCover] = useState(DEFAULT_PRESET_BANNERS[0]!.value);
  const [status, setStatus] = useState<"published" | "draft">("published");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(generatedSlug);
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Judul artikel tidak boleh kosong!");
      return;
    }

    setLoading(true);
    try {
      await createBlogPost({
        slug: slug || `post-${Date.now()}`,
        title,
        tag,
        excerpt: excerpt || "Artikel pembelajaran dan materi webinar Crave Event.",
        body: [bodyText],
        readMinutes: Number(readMinutes) || 4,
        cover,
        publishedAt: new Date().toISOString().split("T")[0]!,
        status,
      });

      toast.success("Artikel Berhasil Dibuat!", {
        description: `"${title}" telah ${
          status === "published" ? "dipublikasikan di portal blog" : "tersimpan sebagai draf"
        }.`,
      });

      navigate({ to: "/admin/blog" });
    } catch (err: any) {
      toast.error("Gagal membuat artikel: " + (err?.message || "Terjadi kesalahan."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <ButtonLink to="/admin/blog" variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          Kembali ke Daftar Artikel
        </ButtonLink>
      </div>

      <PageHeader
        title="Tulis Artikel Blog Baru"
        description="Lengkapi materi edukasi dengan hypertext editor dan gambar banner pendukung."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 border-b border-hairline/80 pb-3">
            <span className="neu-icon-sphere size-8 text-white">
              <FileText className="size-4" />
            </span>
            <h3 className="text-[17px] font-bold text-ink">Informasi Utama Artikel</h3>
          </div>

          <div>
            <label className="aether-meta block text-ink-tertiary">Judul Artikel</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Misal: 5 Prinsip Membangun Microservices Skala Jutaan Request"
              className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[15px] font-medium text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="aether-meta block text-ink-tertiary">Slug URL</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="membangun-microservices-skala-besar"
                className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 font-mono text-[13px] text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              />
            </div>

            <div>
              <label className="aether-meta block text-ink-tertiary">Topik Playlist</label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] font-medium text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              >
                {playlists.map((pl) => (
                  <option key={pl.id} value={pl.tag}>
                    {pl.tag} — {pl.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="aether-meta block text-ink-tertiary">Estimasi Waktu Baca (Menit)</label>
            <input
              type="number"
              min={1}
              max={60}
              required
              value={readMinutes}
              onChange={(e) => setReadMinutes(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] font-medium text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
            />
          </div>

          <div>
            <label className="aether-meta block text-ink-tertiary">Ringkasan / Excerpt</label>
            <textarea
              rows={2}
              required
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Ringkasan singkat 1-2 kalimat untuk kartu pratinjau artikel..."
              className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 p-4 text-[14px] text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
            />
          </div>
        </div>

        {/* Thumbnail Card */}
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <ImageUploader
            value={cover}
            onChange={setCover}
            label="Thumbnail & Sampul Artikel"
            helperText="Upload gambar sampul ke Cloud Storage atau pilih salah satu preset gradien modern beresolusi tinggi."
            previewTitle={title || "Judul Artikel Blog"}
            previewBadge={tag}
            folder="blogs"
          />
        </div>

        {/* Content & Markdown Editor Card */}
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <MarkdownEditor
            value={bodyText}
            onChange={setBodyText}
            label="Materi & Konten Lengkap Artikel (Editor Hypertext & Markdown)"
            placeholder="Tuliskan materi pembelajaran, tips praktis, panduan kode, atau rangkuman webinar di sini..."
            minHeight="600px"
          />
        </div>

        {/* Publication Status Card */}
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <h3 className="text-[17px] font-bold text-ink">Status Publikasi</h3>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStatus("published")}
              className={`flex-1 rounded-xl p-4 text-left border transition-all ${
                status === "published"
                  ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                  : "border-hairline bg-surface hover:border-hairline/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`size-2.5 rounded-full ${
                    status === "published" ? "bg-accent" : "bg-neutral-300"
                  }`}
                />
                <span className="font-semibold text-[14px] text-ink">Publikasikan Langsung</span>
              </div>
              <p className="mt-1 text-[12px] text-ink-secondary">
                Artikel akan segera tampil di katalog publik dan siap dibaca oleh semua peserta.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setStatus("draft")}
              className={`flex-1 rounded-xl p-4 text-left border transition-all ${
                status === "draft"
                  ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                  : "border-hairline bg-surface hover:border-hairline/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`size-2.5 rounded-full ${
                    status === "draft" ? "bg-accent" : "bg-neutral-300"
                  }`}
                />
                <span className="font-semibold text-[14px] text-ink">Simpan sebagai Draf</span>
              </div>
              <p className="mt-1 text-[12px] text-ink-secondary">
                Hanya host/speaker yang dapat melihat artikel ini di dashboard admin.
              </p>
            </button>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <ButtonLink to="/admin/blog" variant="glass" size="md">
            Batal
          </ButtonLink>
          <Button type="submit" variant="primary" size="md" className="gap-2">
            <Send className="size-4" />
            {status === "published" ? "Terbitkan Artikel Sekarang" : "Simpan Draf Artikel"}
          </Button>
        </div>
      </form>
    </div>
  );
}
