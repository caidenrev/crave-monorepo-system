import { createFileRoute } from "@tanstack/react-router";
import { Filter, X, Sparkles, Video, BookOpen } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { EventCard } from "../../components/aether/event-card";
import { BlogCard } from "../../components/aether/blog-card";
import { Badge, Button, FilterTabs, SearchInput } from "../../components/aether/primitives";
import { SiteFooter, SiteHeader } from "../../components/aether/site-header";
import { useApp } from "../../lib/store";
import { isPlaylistMatch, type EventItem, type BlogPost } from "../../lib/mock-data";

type SearchParams = {
  playlist?: string | undefined;
};

export const Route = createFileRoute("/events/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const p = search["playlist"];
    return {
      playlist: typeof p === "string" ? p : undefined,
    };
  },
  component: EventsCatalogPage,
});

type MixedItem =
  | { kind: "event"; id: string; timestamp: number; data: EventItem }
  | { kind: "blog"; id: string; timestamp: number; data: BlogPost };

function EventsCatalogPage() {
  const { playlist: initialPlaylist } = Route.useSearch();
  const { events, blogPosts, playlists } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>(initialPlaylist || "all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [contentFilter, setContentFilter] = useState<"all" | "events" | "blogs">("all");

  // Sync selected playlist if initialPlaylist search param changes
  useEffect(() => {
    if (initialPlaylist) {
      setSelectedPlaylist(initialPlaylist);
    }
  }, [initialPlaylist]);

  const activePlaylist = useMemo(() => {
    if (selectedPlaylist === "all") return null;
    return (
      playlists.find(
        (p) =>
          isPlaylistMatch(p.tag, selectedPlaylist) || isPlaylistMatch(p.title, selectedPlaylist),
      ) || null
    );
  }, [playlists, selectedPlaylist]);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          ev.title.toLowerCase().includes(q) ||
          ev.description.toLowerCase().includes(q) ||
          ev.speaker.toLowerCase().includes(q) ||
          ev.playlist.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (selectedPlaylist !== "all" && !isPlaylistMatch(ev.playlist, selectedPlaylist)) {
        return false;
      }

      if (typeFilter !== "all" && ev.type !== typeFilter) {
        return false;
      }

      if (statusFilter !== "all" && ev.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [events, searchQuery, selectedPlaylist, typeFilter, statusFilter]);

  const filteredBlogs = useMemo(() => {
    return blogPosts.filter((b) => {
      if (b.status !== "published") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          b.title.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q) ||
          b.tag.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (selectedPlaylist !== "all" && !isPlaylistMatch(b.tag, selectedPlaylist)) {
        return false;
      }

      return true;
    });
  }, [blogPosts, searchQuery, selectedPlaylist]);

  const mixedItems = useMemo<MixedItem[]>(() => {
    const list: MixedItem[] = [];

    if (contentFilter === "all" || contentFilter === "events") {
      filteredEvents.forEach((ev) => {
        list.push({
          kind: "event",
          id: `evt-${ev.id}`,
          timestamp: new Date(ev.startsAt).getTime() || 0,
          data: ev,
        });
      });
    }

    if (contentFilter === "all" || contentFilter === "blogs") {
      filteredBlogs.forEach((b) => {
        list.push({
          kind: "blog",
          id: `blog-${b.id}`,
          timestamp: new Date(b.publishedAt).getTime() || 0,
          data: b,
        });
      });
    }

    // Sort newest first
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [contentFilter, filteredEvents, filteredBlogs]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedPlaylist("all");
    setTypeFilter("all");
    setStatusFilter("all");
    setContentFilter("all");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedPlaylist !== "all" ||
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    contentFilter !== "all";

  const totalResults = filteredEvents.length + filteredBlogs.length;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="max-w-2xl">
          <Badge tone="accent">
            {activePlaylist ? `Playlist: ${activePlaylist.tag}` : "Katalog Lengkap & Playlist"}
          </Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {activePlaylist ? activePlaylist.title : "Jelajahi Event & Materi Playlist"}
          </h1>
          <p className="mt-2 text-[15px] text-ink-secondary">
            {activePlaylist?.description
              ? activePlaylist.description
              : "Ikuti webinar interaktif dan baca materi edukasi terkurasi langsung dari host dalam satu kesatuan playlist."}
          </p>
        </div>

        {/* Filter Bar Controls */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Cari webinar, materi blog, judul, atau topik..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Type Filter */}
              <FilterTabs
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { value: "all", label: "Semua Harga" },
                  { value: "free", label: "Gratis" },
                  { value: "paid", label: "Berbayar" },
                ]}
              />

              {/* Status Filter */}
              <FilterTabs
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "all", label: "Semua Waktu" },
                  { value: "upcoming", label: "Mendatang" },
                  { value: "past", label: "Selesai" },
                ]}
              />
            </div>
          </div>

          {/* Playlist Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[13px] font-medium text-ink-secondary">Playlist:</span>
            <button
              onClick={() => setSelectedPlaylist("all")}
              className={`rounded-pill px-3.5 py-1.5 text-[12px] font-semibold transition-all cursor-pointer ${
                selectedPlaylist === "all"
                  ? "neu-btn-blue text-white shadow-sm"
                  : "neu-badge-glass text-ink-secondary hover:text-accent"
              }`}
            >
              Semua Playlist
            </button>
            {playlists.map((pl) => {
              const isSelected = isPlaylistMatch(selectedPlaylist, pl.tag);
              return (
                <button
                  key={pl.id}
                  onClick={() => setSelectedPlaylist(isSelected ? "all" : pl.tag)}
                  className={`rounded-pill px-3.5 py-1.5 text-[12px] font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "neu-btn-blue text-white shadow-sm"
                      : "neu-badge-glass text-ink-secondary hover:text-accent"
                  }`}
                >
                  {pl.tag}
                </button>
              );
            })}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="neu-btn-danger-glass ml-auto shadow-xs cursor-pointer"
              >
                <X className="size-3.5" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>

          {/* Content Type Filter: All (Mixed), Webinars only, Blogs only */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-hairline">
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] font-medium text-ink-secondary">Format Konten:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setContentFilter("all")}
                  className={`rounded-pill px-3 py-1 text-[12px] font-semibold transition-all cursor-pointer ${
                    contentFilter === "all"
                      ? "neu-btn-blue text-white shadow-xs"
                      : "neu-badge-glass text-ink-secondary hover:text-accent"
                  }`}
                >
                  Semua ({totalResults})
                </button>
                <button
                  onClick={() => setContentFilter("events")}
                  className={`rounded-pill px-3 py-1 text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    contentFilter === "events"
                      ? "neu-btn-blue text-white shadow-xs"
                      : "neu-badge-glass text-ink-secondary hover:text-accent"
                  }`}
                >
                  <Video className="size-3" />
                  <span>Webinar ({filteredEvents.length})</span>
                </button>
                <button
                  onClick={() => setContentFilter("blogs")}
                  className={`rounded-pill px-3 py-1 text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    contentFilter === "blogs"
                      ? "neu-btn-blue text-white shadow-xs"
                      : "neu-badge-glass text-ink-secondary hover:text-accent"
                  }`}
                >
                  <BookOpen className="size-3" />
                  <span>Artikel Blog ({filteredBlogs.length})</span>
                </button>
              </div>
            </div>

            <span className="text-[12px] text-ink-tertiary">
              {filteredEvents.length} Webinar · {filteredBlogs.length} Artikel
            </span>
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="mt-6 flex items-center justify-between border-b border-hairline pb-4 text-[13px] text-ink-secondary">
          <span>
            Menampilkan <strong className="text-ink font-semibold">{mixedItems.length}</strong> konten
            {selectedPlaylist !== "all" && ` di playlist "${selectedPlaylist}"`}
          </span>
          {selectedPlaylist !== "all" && (
            <Badge tone="accent">Playlist: {selectedPlaylist}</Badge>
          )}
        </div>

        {/* Unified Mixed Grid (Events & Blogs side by side) */}
        {mixedItems.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mixedItems.map((item) =>
              item.kind === "event" ? (
                <EventCard key={item.id} event={item.data} />
              ) : (
                <BlogCard key={item.id} post={item.data} />
              ),
            )}
          </div>
        ) : (
          <div className="my-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-hairline bg-surface/50 p-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-pill bg-accent-tint text-accent-strong">
              <Filter className="size-6" />
            </div>
            <h3 className="mt-4 text-[18px] font-semibold text-ink">Tidak ada konten ditemukan</h3>
            <p className="mt-1 max-w-sm text-[14px] text-ink-secondary">
              Belum ada webinar atau artikel blog yang sesuai dengan kata kunci atau filter yang kamu pilih.
            </p>
            <Button onClick={resetFilters} variant="primary" className="mt-5" size="sm">
              Tampilkan Semua Konten
            </Button>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
