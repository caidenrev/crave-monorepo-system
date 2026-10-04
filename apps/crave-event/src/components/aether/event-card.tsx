import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "./primitives";
import { formatPrice, formatShortDate, formatTime, type EventItem } from "@/lib/mock-data";
import { useApp } from "@/lib/store";

export function EventCard({ event }: { event: EventItem }) {
  const { isRegistered, currentUser } = useApp();
  const registered = Boolean(currentUser && isRegistered(event.id));

  return (
    <Link
      to="/events/$slug"
      params={{ slug: event.slug }}
      className="glass lift group flex flex-col overflow-hidden rounded-lg"
    >
      <div
        className="relative h-40 w-full overflow-hidden"
        style={
          event.thumbnail.startsWith("http://") ||
          event.thumbnail.startsWith("https://") ||
          event.thumbnail.startsWith("data:image/") ||
          event.thumbnail.startsWith("/")
            ? {
                backgroundImage: `url("${event.thumbnail}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : { background: event.thumbnail }
        }
        aria-hidden="true"
      >
        <div className="absolute inset-x-4 top-4 flex items-center justify-between">
          <Badge tone="neutral">{event.playlist}</Badge>
          {registered ? (
            <span className="rounded-pill bg-emerald-500 text-white px-2.5 py-0.5 text-[11px] font-bold shadow-xs">
              Terdaftar ✓
            </span>
          ) : (
            <Badge tone="neutral">
              {formatPrice(event.price)}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="aether-meta text-ink-tertiary">{event.category}</p>
        <h3 className="mt-2 line-clamp-2 text-[17px] font-semibold text-ink">{event.title}</h3>
        <p className="mt-2 line-clamp-2 text-[13px] text-ink-secondary">{event.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[13px] text-ink-secondary">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4 text-accent" strokeWidth={1.9} />
            {formatShortDate(event.startsAt)}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="size-4 text-accent" strokeWidth={1.9} />
            {formatTime(event.startsAt)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-4 text-accent" strokeWidth={1.9} />
            {event.platform}
          </span>
          <span className="flex items-center gap-2">
            <Users className="size-4 text-accent" strokeWidth={1.9} />
            {event.registered}/{event.quota}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4">
          <span className="text-[13px] font-medium text-ink-tertiary">{event.speaker}</span>
          <span
            className={`px-3.5 py-1.5 text-[12px] font-semibold transition-all rounded-pill ${
              registered
                ? "neu-btn-glass text-accent font-bold shadow-xs"
                : "neu-btn-blue text-white shadow-xs"
            }`}
          >
            {registered ? "Akses Tiket →" : "Lihat detail →"}
          </span>
        </div>
      </div>
    </Link>
  );
}
