import { createFileRoute } from "@tanstack/react-router";
import {
  adminClient,
  applyMidtransStatus,
  BillingError,
  cancelMidtransTransaction,
  fetchMidtransStatus,
  handle,
  json,
  requireUser,
} from "@/lib/server/billing";

/**
 * POST /pos-system/api/billing/cancel  { order_id }
 * Membatalkan tagihan yang masih menunggu pembayaran, di Midtrans dan di database.
 * Kalau ternyata sudah dibayar, tagihan TIDAK dibatalkan: langganan langsung diperpanjang.
 */
export const Route = createFileRoute("/api/billing/cancel")({
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
          if (!invoice || invoice.user_id !== user.id) throw new BillingError("Tagihan tidak ditemukan", 404);
          if (invoice.status !== "pending") return json({ status: invoice.status });

          // sudah terbayar di Midtrans tetapi notifikasinya belum sampai → catat sebagai lunas
          const remote = await fetchMidtransStatus(orderId);
          if (remote && remote.order_id === orderId) {
            const status = await applyMidtransStatus(admin, remote);
            if (status !== "pending") return json({ status });
            // transaksi sudah dibuat di Midtrans (mis. nomor VA sudah terbit) → batalkan di sana juga
            if (!(await cancelMidtransTransaction(orderId))) {
              throw new BillingError("Tagihan sedang diproses dan tidak bisa dibatalkan. Coba cek status.", 409);
            }
          }

          await admin
            .from("subscription_invoices")
            .update({ status: "cancelled" })
            .eq("order_id", orderId)
            .eq("status", "pending");
          return json({ status: "cancelled" });
        }),
    },
  },
});
