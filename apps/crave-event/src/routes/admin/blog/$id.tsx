import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, FileText, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../../../components/aether/dashboard-shell";
import { ImageUploader, DEFAULT_PRESET_BANNERS } from "../../../components/aether/image-uploader";
import { MarkdownEditor } from "../../../components/aether/markdown-editor";
import { Button, ButtonLink } from "../../../components/aether/primitives";
import { DeleteConfirmModal } from "../../../components/aether/delete-confirm-modal";
import { useApp } from "../../../lib/store";

export const Route = createFileRoute("/admin/blog/$id")({
  component: AdminEditBlogPage,
});

function AdminEditBlogPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { blogPosts, updateBlogPost, deleteBlogPost, playlists } = useApp();

  const post = blogPosts.find((p) => p.id === id || p.slug === id);

  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [tag, setTag] = useState(post?.tag || playlists[0]?.tag || "#TechTalk");
  const [readMinutes, setReadMinutes] = useState(post?.readMinutes || 4);
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [bodyText, setBodyText] = useState(post?.body ? post.body[0] || post.body.join("\n\n") : "");
  const [cover, setCover] = useState(post?.cover || DEFAULT_PRESET_BANNERS[0]!.value);
  const [status, setStatus] = useState<"published" | "draft">(post?.status || "published");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setSlug(post.slug);
      setTag(post.tag);
      setReadMinutes(post.readMinutes);
      setExcerpt(post.excerpt);
      setBodyText(post.body[0] || post.body.join("\n\n"));
      setCover(post.cover || DEFAULT_PRESET_BANNERS[0]!.value);
      setStatus(post.status);
    }
  }, [post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!post) {
      toast.error("Artikel tidak ditemukan!");
      return;
    }

    if (!title.trim()) {
      toast.error("Judul artikel tidak boleh kosong!");
      return;
    }

    updateBlogPost(post.id, {
      title,
      slug,
      tag,
      excerpt,
      body: [bodyText],
      readMinutes: Number(readMinutes) || 4,
      cover,
      status,
    });

    toast.success("Perubahan Artikel Berhasil Disimpan!", {
      description: `"${title}" telah diperbarui.`,
    });

    navigate({ to: "/admin/blog" });
  };

  const handleDelete = () => {
    if (!post) return;
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!post) return;
    deleteBlogPost(post.id);
    toast.success("Artikel Dihapus", {
      description: `"${post.title}" telah dihapus.`,
    });
    navigate({ to: "/admin/blog" });
  };

  if (!post) {
    return (
      <div className="space-y-6 max-w-4xl py-12 text-center">
        <h2 className="text-xl font-bold text-ink">Artikel Tidak Ditemukan</h2>
        <p className="text-ink-secondary text-sm">
          Artikel dengan ID &quot;{id}&quot; mungkin telah dihapus atau tidak tersedia.
        </p>
        <ButtonLink to="/admin/blog" variant="primary">
          Kembali ke Daftar Artikel
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <ButtonLink to="/admin/blog" variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          Kembali ke Daftar Artikel
        </ButtonLink>

        <Button
          type="button"
          onClick={handleDelete}
          variant="danger"
          size="sm"
          className="gap-1.5"
        >
          <Trash2 className="size-4" />
          Hapus Artikel
        </Button>
      </div>

      <PageHeader
        title="Edit Artikel Blog"
        description={`Mengubah detail dan konten materi untuk "${post.title}".`}
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
              onChange={(e) => setTitle(e.target.value)}
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
            helperText="Upload gambar sampul baru ke Cloud Storage atau pilih preset gradien modern."
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
            placeholder="Tuliskan materi artikel di sini..."
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
                <span className="font-semibold text-[14px] text-ink">Dipublikasikan</span>
              </div>
              <p className="mt-1 text-[12px] text-ink-secondary">
                Artikel dapat diakses dan dibaca oleh publik di portal blog.
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
                <span className="font-semibold text-[14px] text-ink">Draf</span>
              </div>
              <p className="mt-1 text-[12px] text-ink-secondary">
                Disimpan sebagai konsep, belum terlihat oleh pengunjung umum.
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
            <Save className="size-4" />
            Simpan Perubahan
          </Button>
        </div>
      </form>
      <DeleteConfirmModal
        open={showDeleteModal}
        title="Hapus Artikel?"
        description={
          <>
            Apakah Anda yakin ingin menghapus artikel{" "}
            <span className="font-semibold text-gray-900">"{post?.title}"</span>?
          </>
        }
        confirmLabel="Hapus Artikel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
