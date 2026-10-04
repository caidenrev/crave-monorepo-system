import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Newspaper } from "lucide-react";
import { useState } from "react";
import { Badge, SearchInput } from "../../components/aether/primitives";
import { SiteFooter, SiteHeader } from "../../components/aether/site-header";
import { formatShortDate } from "../../lib/mock-data";
import { useApp } from "../../lib/store";

export const Route = createFileRoute("/blog/")({
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const { blogPosts, playlists } = useApp();
  const [selectedTag, setSelectedTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const publishedPosts = blogPosts.filter((p) => p.status === "published");

  const filteredPosts = publishedPosts.filter((p) => {
    if (selectedTag !== "all" && p.tag !== selectedTag) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const featuredPost = publishedPosts[0];

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="max-w-2xl">
          <Badge tone="accent">Pusat Belajar &amp; Wawasan</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Blog &amp; Catatan Host
          </h1>
          <p className="mt-2 text-[15px] text-ink-secondary">
            Wawasan seputar teknik komunikasi, presentasi berbahasa Inggris, dan otomasi alur kerja
            langsung dari Eka Revandi.
          </p>
        </div>

        {/* Featured Post Card */}
        {featuredPost && (
          <div className="mt-8">
            <Link
              to="/blog/$slug"
              params={{ slug: featuredPost.slug }}
              className="glass lift group relative flex flex-col overflow-hidden rounded-2xl md:flex-row shadow-sm hover:shadow-md transition-all"
            >
              <div
                className="h-56 w-full md:h-auto md:w-2/5 shrink-0"
                style={
                  featuredPost?.cover &&
                  (featuredPost.cover.startsWith("http") ||
                    featuredPost.cover.startsWith("data:") ||
                    featuredPost.cover.startsWith("/"))
                    ? {
                        backgroundImage: `url("${featuredPost.cover}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : { background: featuredPost?.cover || "linear-gradient(135deg, #0a84ff 0%, #0056b3 100%)" }
                }
              />
              <div className="flex flex-1 flex-col justify-between p-5 sm:p-8">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="aether-meta rounded-pill bg-accent-tint px-3 py-1 font-semibold text-accent-strong">
                      {featuredPost.tag}
                    </span>
                    <span className="text-[12px] font-medium text-accent">Artikel Pilihan</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-ink group-hover:text-accent transition-colors sm:text-3xl">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink-secondary">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="mt-5 sm:mt-6 flex items-center justify-between gap-2 border-t border-hairline pt-3.5 sm:pt-4 text-ink-tertiary">
                  <div className="flex items-center gap-2 sm:gap-3.5 text-[11px] sm:text-[13px] text-ink-secondary">
                    <span className="whitespace-nowrap">{formatShortDate(featuredPost.publishedAt)}</span>
                    <span className="text-hairline">·</span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Clock className="size-3 sm:size-3.5 text-accent shrink-0" />
                      <span>{featuredPost.readMinutes} mnt baca</span>
                    </span>
                  </div>
                  <span className="neu-btn-blue px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-[12px] font-semibold text-white shadow-xs whitespace-nowrap shrink-0">
                    Baca Selengkapnya &rarr;
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Filter Controls */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedTag("all")}
              className={`rounded-pill px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                selectedTag === "all"
                  ? "neu-btn-blue text-white shadow-sm"
                  : "neu-badge-glass text-ink-secondary hover:text-accent"
              }`}
            >
              Semua Topik
            </button>
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => setSelectedTag(pl.tag)}
                className={`rounded-pill px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                  selectedTag === pl.tag
                    ? "neu-btn-blue text-white shadow-sm"
                    : "neu-badge-glass text-ink-secondary hover:text-accent"
                }`}
              >
                {pl.tag}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari artikel..."
            />
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="glass lift group flex flex-col justify-between overflow-hidden rounded-2xl p-6 shadow-xs hover:shadow-md transition-all"
            >
              <div>
                {/* Card Thumbnail */}
                <div
                  className="-mx-6 -mt-6 mb-4 h-36 w-[calc(100%+3rem)] shrink-0 overflow-hidden"
                  style={
                    post?.cover &&
                    (post.cover.startsWith("http") ||
                      post.cover.startsWith("data:") ||
                      post.cover.startsWith("/"))
                      ? {
                          backgroundImage: `url("${post.cover}")`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : { background: post?.cover || "linear-gradient(135deg, #0a84ff 0%, #0056b3 100%)" }
                  }
                />

                <div className="flex items-center justify-between">
                  <Badge tone="neutral">{post.tag}</Badge>
                  <span className="flex items-center gap-1 text-[12px] text-ink-tertiary">
                    <Clock className="size-3" />
                    {post.readMinutes} mnt
                  </span>
                </div>
                <h3 className="mt-3 text-[17px] font-semibold text-ink group-hover:text-accent transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink-secondary">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between gap-2 border-t border-hairline pt-4 text-[11px] sm:text-[12px] text-ink-tertiary">
                <span className="whitespace-nowrap">{formatShortDate(post.publishedAt)}</span>
                <span className="neu-btn-blue px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-[12px] font-semibold text-white shadow-xs whitespace-nowrap">
                  Baca artikel &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
