import { Link } from "@tanstack/react-router";
import { BookOpen, CalendarDays, Clock } from "lucide-react";
import { Badge } from "./primitives";
import { formatShortDate, type BlogPost } from "@/lib/mock-data";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="glass lift group flex flex-col overflow-hidden rounded-lg transition-all"
    >
      <div
        className="relative h-40 w-full overflow-hidden"
        style={
          post.cover?.startsWith("http://") ||
          post.cover?.startsWith("https://") ||
          post.cover?.startsWith("data:image/") ||
          post.cover?.startsWith("/")
            ? {
                backgroundImage: `url("${post.cover}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : { background: post.cover || "linear-gradient(135deg, #0a84ff 0%, #0056b3 100%)" }
        }
        aria-hidden="true"
      >
        <div className="absolute inset-x-4 top-4 flex items-center justify-between">
          <Badge tone="neutral">{post.tag}</Badge>
          <span className="rounded-pill bg-blue-600 text-white px-2.5 py-0.5 text-[11px] font-bold shadow-xs flex items-center gap-1">
            <BookOpen className="size-3" />
            <span>Artikel</span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="aether-meta text-ink-tertiary">Materi Edukasi</p>
        <h3 className="mt-2 line-clamp-2 text-[17px] font-semibold text-ink group-hover:text-accent transition-colors">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] text-ink-secondary">
          {post.excerpt}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[13px] text-ink-secondary">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4 text-accent" strokeWidth={1.9} />
            <span className="truncate">{formatShortDate(post.publishedAt)}</span>
          </span>
          <span className="flex items-center gap-2">
            <Clock className="size-4 text-accent" strokeWidth={1.9} />
            <span>{post.readMinutes} mnt baca</span>
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4">
          <span className="text-[13px] font-medium text-ink-tertiary">Eka Revandi</span>
          <span className="px-3.5 py-1.5 text-[12px] font-semibold transition-all rounded-pill neu-btn-blue text-white shadow-xs">
            Baca artikel &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
