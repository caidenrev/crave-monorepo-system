import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Clock,
  Crown,
  Edit3,
  Eye,
  FileText,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../../../components/aether/dashboard-shell";
import { Badge, Button, ButtonLink, FilterTabs, SearchInput } from "../../../components/aether/primitives";
import { formatShortDate, type BlogPost } from "../../../lib/mock-data";
import { useApp } from "../../../lib/store";
import { DeleteConfirmModal } from "../../../components/aether/delete-confirm-modal";

export const Route = createFileRoute("/admin/blog/")({
  component: AdminBlogListPage,
});

function AdminBlogListPage() {
  const {
    blogPosts,
    updateBlogPost,
    deleteBlogPost,
    deleteAllBlogPosts,
    resetAllBlogPosts,
    isSuperAdmin,
  } = useApp();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showResetModal, setShowResetModal] = useState(false);
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
  const [showDeleteAllBlogsModal, setShowDeleteAllBlogsModal] = useState(false);

  const filtered = blogPosts.filter((post) => {
    if (statusFilter !== "all" && post.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        post.tag.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleStatus = (post: BlogPost) => {
    const nextStatus = post.status === "published" ? "draft" : "published";
    updateBlogPost(post.id, { status: nextStatus });
    toast.success(
      nextStatus === "published" ? "Artikel Telah Dipublikasikan!" : "Artikel Disimpan ke Draf!",
      {
        description: `"${post.title}" kini ${
          nextStatus === "published" ? "dapat dibaca publik." : "hanya terlihat oleh host."
        }`,
      },
    );
  };

  const handleDeletePost = (post: BlogPost) => {
    setDeletingPost(post);
  };

  const handleConfirmDeletePost = () => {
    if (!deletingPost) return;
    deleteBlogPost(deletingPost.id);
    toast.success("Artikel Dihapus", {
      description: `"${deletingPost.title}" berhasil dihapus dari sistem.`,
    });
    setDeletingPost(null);
  };

  const filterTabs = [
    { value: "all", label: "Semua", count: blogPosts.length },
    {
      value: "published",
      label: "Dipublikasikan",
      count: blogPosts.filter((p) => p.status === "published").length,
    },
    {
      value: "draft",
      label: "Draf",
      count: blogPosts.filter((p) => p.status === "draft").length,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Blog & Materi"
        description="Tulis artikel edukasi teknis, tips karier, dan silabus webinar terstruktur."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="neu-btn-glass rounded-xl px-3.5 py-2 text-[13px] font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-2 border border-purple-200/80 bg-purple-50/60 hover:bg-purple-100/60 shadow-xs transition-all cursor-pointer"
              >
                <Crown className="size-4 text-purple-600" />
                <span>Reset Data Blog</span>
              </button>
            )}
            <ButtonLink to="/admin/blog/new" variant="primary">
              <Plus className="size-4" />
              Tulis Artikel Baru
            </ButtonLink>
          </div>
        }
      />

      {/* Super Admin Status Banner */}
      {isSuperAdmin && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50/50 border border-purple-200/80 text-[13px]">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Crown className="size-4" />
            </div>
            <div>
              <span className="font-bold text-purple-900">Mode Super Admin Aktif:</span>{" "}
              <span className="text-purple-700">Anda dapat menghapus artikel siapa pun atau mengosongkan/mereset seluruh data blog.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="neu-btn-glass text-[12px] font-bold text-purple-700 px-3 py-1.5 rounded-lg border border-purple-300 shadow-xs shrink-0 hover:bg-purple-100 cursor-pointer"
          >
            Kelola Reset Blog
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs options={filterTabs} value={statusFilter} onChange={setStatusFilter} />
        <div className="w-full sm:w-72">
          <SearchInput
            placeholder="Cari artikel, topik, atau kata kunci..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      {/* Blog Posts Table */}
      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="border-b border-hairline bg-surface/70 text-[12px] text-ink-tertiary uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Artikel &amp; Sampul</th>
                <th className="px-4 py-3.5 font-semibold">Topik</th>
                <th className="px-4 py-3.5 font-semibold">Waktu Baca</th>
                <th className="px-4 py-3.5 font-semibold">Tanggal Rilis</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((post) => {
                const cover = post?.cover || "";
                const isImageSrc =
                  Boolean(cover) &&
                  (cover.startsWith("http://") ||
                    cover.startsWith("https://") ||
                    cover.startsWith("data:image/") ||
                    cover.startsWith("/"));

                return (
                  <tr key={post.id} className="hover:bg-white/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          className="size-13 shrink-0 rounded-xl shadow-xs overflow-hidden"
                          style={
                            isImageSrc
                              ? {
                                  backgroundImage: `url("${post.cover}")`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }
                              : { background: post.cover }
                          }
                        />
                        <div className="min-w-0 max-w-md">
                          <Link
                            to="/admin/blog/$id"
                            params={{ id: post.id }}
                            className="font-semibold text-ink hover:text-accent truncate block text-[15px]"
                          >
                            {post.title}
                          </Link>
                          <p className="line-clamp-1 text-[12px] text-ink-secondary">{post.excerpt}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge tone="accent">{post.tag}</Badge>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-[13px] text-ink-secondary">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5 text-ink-tertiary" />
                        {post.readMinutes} Menit
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-[13px] text-ink-secondary">
                      {formatShortDate(post.publishedAt)}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleStatus(post)}
                        title="Klik untuk ubah status"
                        className="cursor-pointer"
                      >
                        <Badge tone={post.status === "published" ? "success" : "neutral"}>
                          {post.status === "published" ? "Dipublikasikan" : "Draf"}
                        </Badge>
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <ButtonLink
                          to="/admin/blog/$id"
                          params={{ id: post.id }}
                          variant="ghost"
                          size="sm"
                          title="Edit Artikel"
                          className="p-2"
                        >
                          <Edit3 className="size-4" />
                        </ButtonLink>
                        <Link
                          to="/blog/$slug"
                          params={{ slug: post.slug }}
                          title="Buka Halaman Baca"
                          className="rounded-pill p-2 text-ink-secondary hover:text-accent hover:bg-neutral-100 transition-colors inline-flex items-center justify-center"
                        >
                          <Eye className="size-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post)}
                          title="Hapus Artikel"
                          className="rounded-pill p-2 text-ink-secondary hover:text-danger hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink-secondary">
                    <p className="text-[15px] font-semibold text-ink">Tidak ada artikel yang sesuai.</p>
                    <p className="mt-1 text-[13px] text-ink-tertiary">
                      {blogPosts.length === 0
                        ? "Semua artikel blog telah dikosongkan (database kosong)."
                        : "Coba sesuaikan kata kunci pencarian atau tab filter status."}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      {isSuperAdmin && blogPosts.length === 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            resetAllBlogPosts();
                            toast.success("Artikel Bawaan Dipulihkan!", {
                              description: "Artikel demo telah dimuat ulang.",
                            });
                          }}
                          className="neu-btn-glass px-4 py-2 rounded-xl text-[13px] font-semibold text-purple-700 bg-purple-50/80 border border-purple-200 shadow-xs flex items-center gap-1.5 hover:bg-purple-100 cursor-pointer"
                        >
                          <RotateCcw className="size-4 text-purple-600" />
                          Pulihkan Artikel Bawaan
                        </button>
                      )}
                      <ButtonLink to="/admin/blog/new" variant="primary" size="sm">
                        <Plus className="size-4" /> Tulis Artikel Baru
                      </ButtonLink>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Super Admin Reset Blog Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 border border-purple-200">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Crown className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Reset Data Blog (Super Admin)</h3>
                  <p className="text-[12px] text-ink-tertiary">Akses Root untuk testing &amp; pembersihan artikel</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="neu-btn-glass size-8 flex items-center justify-center rounded-full text-ink-tertiary hover:text-ink cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-purple-50/70 p-3.5 border border-purple-200/80 text-[12.5px] text-purple-900 leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5 text-purple-800">
                  <ShieldAlert className="size-4 text-purple-600" />
                  Hak Akses Super Admin Penuh
                </p>
                <p className="mt-1">
                  Sebagai Super Admin, Anda dapat menghapus artikel siapa saja, mengosongkan seluruh isi blog, atau mengembalikannya ke artikel bawaan awal.
                </p>
              </div>

              {/* Action 1: Delete All */}
              <div className="rounded-xl border border-red-200/80 bg-red-50/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-[13.5px] font-bold text-red-700 flex items-center gap-1.5">
                    <Trash2 className="size-4 text-red-600" />
                    Hapus Semua Artikel (Kosongkan Blog)
                  </h4>
                  <p className="mt-0.5 text-[12px] text-ink-secondary">
                    Menghapus seluruh ({blogPosts.length}) artikel blog dari sistem &amp; Supabase Cloud.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteAllBlogsModal(true)}
                  className="neu-btn-glass shrink-0 px-3.5 py-2 rounded-xl text-[12px] font-bold text-white bg-red-600 hover:bg-red-700 border-none shadow-xs transition-colors cursor-pointer"
                >
                  Hapus Semua Blog
                </button>
              </div>

              {/* Action 2: Reset to Defaults */}
              <div className="rounded-xl border border-purple-200/80 bg-purple-50/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-[13.5px] font-bold text-purple-800 flex items-center gap-1.5">
                    <RotateCcw className="size-4 text-purple-600" />
                    Pulihkan Artikel Bawaan (Default)
                  </h4>
                  <p className="mt-0.5 text-[12px] text-ink-secondary">
                    Mengisi ulang blog dengan artikel edukasi teknis &amp; tips karier bawaan yang lengkap.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetAllBlogPosts();
                    setShowResetModal(false);
                    toast.success("Artikel Blog Dipulihkan!", {
                      description: "Artikel bawaan telah dimuat ulang.",
                    });
                  }}
                  className="neu-btn-glass shrink-0 px-3.5 py-2 rounded-xl text-[12px] font-bold text-purple-800 bg-purple-100 hover:bg-purple-200 border border-purple-300 shadow-xs transition-colors cursor-pointer"
                >
                  Pulihkan Default
                </button>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button onClick={() => setShowResetModal(false)} variant="glass" size="sm">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Delete single post modal */}
      <DeleteConfirmModal
        open={!!deletingPost}
        title="Hapus Artikel?"
        description={
          <>
            Apakah Anda yakin ingin menghapus artikel{" "}
            <span className="font-semibold text-gray-900">"{deletingPost?.title}"</span>?
          </>
        }
        confirmLabel="Hapus Artikel"
        onConfirm={handleConfirmDeletePost}
        onCancel={() => setDeletingPost(null)}
      />

      {/* Delete all blogs modal */}
      <DeleteConfirmModal
        open={showDeleteAllBlogsModal}
        title="Hapus Semua Artikel?"
        subtitle="Tindakan ini TIDAK dapat dibatalkan."
        description={
          <>
            Anda akan menghapus{" "}
            <span className="font-semibold text-gray-900">{blogPosts.length} artikel</span>{" "}
            secara permanen dari sistem dan Supabase Cloud.
          </>
        }
        confirmLabel="Hapus Semua Blog"
        onConfirm={() => {
          deleteAllBlogPosts();
          setShowDeleteAllBlogsModal(false);
          setShowResetModal(false);
          toast.success("Semua Artikel Blog Berhasil Dihapus!", {
            description: "Kini database blog bersih dan kosong.",
          });
        }}
        onCancel={() => setShowDeleteAllBlogsModal(false)}
      />
    </div>
  );
}
