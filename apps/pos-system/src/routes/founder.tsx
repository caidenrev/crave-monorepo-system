import { createFileRoute, Outlet } from "@tanstack/react-router";
import { FounderShell } from "@/components/founder/FounderShell";

/** Dashboard founder: terpisah dari aplikasi kasir (lihat FounderGate di __root). */
export const Route = createFileRoute("/founder")({
  head: () => ({ meta: [{ title: "Founder Console — Crave" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <FounderShell>
      <Outlet />
    </FounderShell>
  ),
});
