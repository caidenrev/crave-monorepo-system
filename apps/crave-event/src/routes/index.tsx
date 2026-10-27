import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CraveNav } from "../components/aether/crave-nav";
import {
  ArticlesSection,
  BigFooter,
  CtaSection,
  FaqSection,
  PulseHero,
  RolesSection,
  ScheduleSection,
  SpeakersSection,
  WhySection,
} from "../components/aether/landing";
import { useApp } from "../lib/store";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const { events, playlists, blogPosts } = useApp();

  // The live session wins; then the nearest upcoming one that hasn't started yet;
  // if every "upcoming" date already passed, fall back to the latest of them.
  const featured = useMemo(() => {
    const live = events.find((e) => e.status === "live");
    if (live) return live;
    const upcoming = events
      .filter((e) => e.status === "upcoming")
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    const now = Date.now();
    return upcoming.find((e) => new Date(e.startsAt).getTime() > now) ?? upcoming.at(-1) ?? null;
  }, [events]);

  const recentPosts = blogPosts.filter((p) => p.status === "published").slice(0, 6);

  return (
    <div className="min-h-screen bg-white text-ink">
      <CraveNav />
      <main>
        <PulseHero featured={featured} />
        <WhySection featured={featured} />
        <RolesSection />
        <ScheduleSection events={events} playlists={playlists} />
        <SpeakersSection events={events} />
        <FaqSection />
        <ArticlesSection posts={recentPosts} />
        <CtaSection featured={featured} />
      </main>
      <BigFooter />
    </div>
  );
}
