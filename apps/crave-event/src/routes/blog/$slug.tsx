import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import { toast } from "sonner";
import { MarkdownRenderer } from "../../components/aether/markdown-renderer";
import { Badge, ButtonLink } from "../../components/aether/primitives";
import { SiteFooter, SiteHeader } from "../../components/aether/site-header";
import { GlassButton } from "../../components/ui/glass";
import { formatDate } from "../../lib/mock-data";
import { useApp } from "../../lib/store";
import { shareContent } from "../../lib/utils";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostDetailPage,
});

function BlogPostDetailPage() {
  const { slug } = Route.useParams();
  const { blogPosts, events } = useApp();

  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-canvas text-ink">
        <SiteHeader />
        <main className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
          <h1 className="text-3xl font-bold">Artikel Tidak Ditemukan</h1>
          <p className="mt-2 text-ink-secondary">
            Artikel yang kamu cari tidak tersedia atau URL telah dipindahkan.
          </p>
          <ButtonLink to="/blog" className="mt-6">
            Kembali ke Blog
          </ButtonLink>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const handleShare = async () => {
    const result = await shareContent({
      title: post.title,
      text: post.excerpt,
      path: `/blog/${post.slug}`,
    });

    if (result.copied) {
      toast.success("Tautan artikel publik berhasil disalin!", {
        description: "Link siap dibagikan ke teman atau media sosial.",
      });
    }
  };

  const relatedEvents = events.filter((e) => e.playlist === post.tag).slice(0, 2);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-10">

        {/* Hero Banner with Glass Buttons overlay */}
        <div
          className="relative h-56 sm:h-72 w-full rounded-3xl shadow-lg overflow-hidden"
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
              : { background: post?.cover || "linear-gradient(135deg, #1c8eff 0%, #7c3aed 55%, #0070e6 100%)" }
          }
        >
          {/* Subtle dark scrim for button readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/10" />

          {/* Glass Buttons — overlaid on the hero */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <Link to="/blog" className="no-underline">
              <GlassButton size="sm" className="gap-1.5">
                <ArrowLeft className="size-3.5" />
                Kembali
              </GlassButton>
            </Link>
            <GlassButton size="sm" onClick={handleShare} className="gap-1.5">
              <Share2 className="size-3.5" />
              Bagikan
            </GlassButton>
          </div>

          {/* Tag badge at bottom-left of hero — glass pill */}
          <div className="absolute bottom-4 left-4">
            <GlassButton
              size="sm"
              className="pointer-events-none cursor-default text-[11px] font-semibold tracking-wider uppercase opacity-90"
            >
              {post.tag}
            </GlassButton>
          </div>
        </div>

        {/* Article Header below hero */}
        <div className="mt-7 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl sm:leading-tight">
            {post.title}
          </h1>

          {/* Author & Meta bar */}
          <div className="mt-5 border-y border-hairline py-3.5 text-[13px] text-ink-secondary">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4 sm:flex-wrap text-left">
              <div className="shrink-0">
                <p className="font-semibold text-ink leading-tight">Eka Revandi</p>
                <p className="text-[11px] text-ink-tertiary">Host &amp; Speaker Utama</p>
              </div>
              <span className="hidden sm:inline text-hairline">|</span>
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[12px] sm:text-[13px] text-ink-secondary">
                <span>{formatDate(post.publishedAt)}</span>
                <span className="text-hairline">·</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="size-3.5 text-accent" />
                  <span>{post.readMinutes} menit membaca</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <article className="mt-10 space-y-6 text-[16px] leading-[1.8] text-ink-secondary">
          {/* Excerpt callout — pure glass, no colored wrapper */}
          <div
            className="rounded-3xl px-7 py-6 sm:px-8 sm:py-7"
            style={{
              background: "rgba(255,255,255,0.45)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.7)",
              boxShadow:
                "inset 0 1.5px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.03), 0 4px 20px rgba(15,23,42,0.06)",
            }}
          >
            <p className="text-[16px] sm:text-[18px] font-[500] italic leading-[1.8] text-ink/80 tracking-[-0.015em]">
              <span className="not-italic font-bold text-accent mr-1">"</span>
              {post.excerpt}
              <span className="not-italic font-bold text-accent ml-1">"</span>
            </p>
          </div>


          <MarkdownRenderer
            content={
              Array.isArray(post.body)
                ? post.body.join("\n\n")
                : ((post as any).body || post.excerpt || "")
            }
          />
        </article>



        {/* Related Webinar CTA */}
        {relatedEvents.length > 0 && (
          <div className="glass mt-12 rounded-2xl p-6 text-center sm:text-left sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <Badge tone="accent">Webinar Terkait</Badge>
              <h3 className="mt-2 text-xl font-bold text-ink">
                Ingin Berlatih Langsung dengan Topik Ini?
              </h3>
              <p className="mt-1 text-[14px] text-ink-secondary">
                Daftar ke sesi {post.tag} terdekat dan dapatkan feedback interaktif.
              </p>
            </div>
            <ButtonLink to="/events" search={{ playlist: post.tag }} className="shrink-0">
              Lihat Webinar {post.tag}
            </ButtonLink>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
