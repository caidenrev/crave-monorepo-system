import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/bantuan")({
  head: () => ({
    meta: [
      { title: "Bantuan & Dukungan — Crave" },
      { name: "description", content: "Pusat bantuan aplikasi" },
    ],
  }),
  component: BantuanPage,
});

function BantuanPage() {
  return (
    <AppShell title="Pusat Bantuan" subtitle="Panduan penggunaan aplikasi dan bantuan teknis">
      <div className="card-soft p-6 text-center">
        <h3 className="text-lg font-bold mb-2">Halaman Bantuan Sedang Dikembangkan</h3>
        <p className="text-sm text-muted-foreground">
          Nantinya Anda bisa menemukan FAQ, tutorial, dan kontak dukungan teknis di halaman ini.
        </p>
      </div>
    </AppShell>
  );
}
