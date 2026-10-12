import { createFileRoute } from "@tanstack/react-router";
import {
  adminClient,
  applyMidtransStatus,
  handle,
  isValidNotification,
  json,
  type MidtransStatus,
} from "@/lib/server/billing";

/**
 * POST /pos-system/api/billing/notify
 * Payment Notification URL dari Midtrans (diisi di dashboard Midtrans → Settings →
 * Configuration). Hanya notifikasi dengan signature yang cocok yang diproses.
 */
export const Route = createFileRoute("/api/billing/notify")({
  server: {
    handlers: {
      POST: ({ request }) =>
        handle(async () => {
          const payload = (await request.json().catch(() => null)) as MidtransStatus | null;
          if (!payload || !(await isValidNotification(payload))) {
            return json({ error: "Signature tidak valid" }, 403);
          }
          // tagihan bukan milik Crave POS (mis. tes dari dashboard Midtrans) → abaikan dengan 200
          if (!payload.order_id?.startsWith("CRV-")) return json({ ok: true, ignored: true });
          const status = await applyMidtransStatus(adminClient(), payload);
          return json({ ok: true, status });
        }),
    },
  },
});
