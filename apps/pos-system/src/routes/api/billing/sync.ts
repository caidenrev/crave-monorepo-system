import { createFileRoute } from "@tanstack/react-router";
import {
  adminClient,
  applyMidtransStatus,
  BillingError,
  fetchMidtransStatus,
  handle,
  json,
  requireUser,
} from "@/lib/server/billing";

/**
 * POST /pos-system/api/billing/sync  { order_id }
 * Dipanggil saat pengguna kembali dari halaman pembayaran: menanyakan status terbaru
 * langsung ke Midtrans, jadi masa aktif tetap bertambah walau notifikasi terlambat.
 */
export const Route = createFileRoute("/api/billing/sync")({
  server: {
    handlers: {
      POST: ({ request }) =>
        handle(async () => {
          const admin = adminClient();
          const user = await requireUser(request, admin);
          const body = (await request.json().catch(() => null)) as { order_id?: unknown } | null;
          const orderId = typeof body?.order_id === "string" ? body.order_id : "";
          if (!orderId) throw new BillingError("order_id wajib diisi");

          const { data: invoice } = await admin
            .from("subscription_invoices")
            .select("order_id, status, user_id")
            .eq("order_id", orderId)
            .maybeSingle();
          if (!invoice) throw new BillingError("Tagihan tidak ditemukan", 404);
          if (invoice.user_id !== user.id) {
            // founder boleh mengecek tagihan merchant mana pun dari dashboard-nya
            const { data: isAdmin } = await admin
              .from("app_admins")
              .select("user_id")
              .eq("user_id", user.id)
              .maybeSingle();
            if (!isAdmin) throw new BillingError("Tagihan tidak ditemukan", 404);
          }
          if (invoice.status === "paid") return json({ status: "paid" });

          const remote = await fetchMidtransStatus(orderId);
          if (!remote) return json({ status: invoice.status });
          // status dari API Midtrans (server-ke-server) sudah tepercaya; pastikan order_id-nya sama
          if (remote.order_id !== orderId) throw new BillingError("Status pembayaran tidak cocok", 502);
          return json({ status: await applyMidtransStatus(admin, remote) });
        }),
    },
  },
});
