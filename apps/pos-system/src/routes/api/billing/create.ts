import { createFileRoute } from "@tanstack/react-router";
import {
  adminClient,
  BillingError,
  createSnapTransaction,
  handle,
  json,
  notifyUrlFor,
  requireUser,
  type InvoiceRow,
} from "@/lib/server/billing";

/**
 * POST /pos-system/api/billing/create  { months: 1 | 6 | 12 }
 * Membuat tagihan langganan + halaman pembayaran Midtrans Snap untuk akun yang login.
 * Harga diambil dari database (subscription_plans), bukan dari browser.
 */
export const Route = createFileRoute("/api/billing/create")({
  server: {
    handlers: {
      POST: ({ request }) =>
        handle(async () => {
          const admin = adminClient();
          const user = await requireUser(request, admin);
          const body = (await request.json().catch(() => null)) as { months?: unknown } | null;
          const months = Number(body?.months);
          if (![1, 6, 12].includes(months)) throw new BillingError("Durasi langganan tidak valid");

          const { data, error } = await admin.rpc("create_subscription_invoice", {
            p_user: user.id,
            p_months: months,
          });
          if (error || !data) {
            console.error("[billing] create_subscription_invoice", error?.message);
            throw new BillingError("Gagal membuat tagihan", 500);
          }
          const invoice = data as InvoiceRow;

          const origin = request.headers.get("origin") ?? new URL(request.url).origin;
          const snap = await createSnapTransaction({
            invoice,
            email: user.email ?? "",
            name: String(user.user_metadata?.["name"] ?? user.email?.split("@")[0] ?? ""),
            finishUrl: `${origin}/pos-system/langganan?order_id=${encodeURIComponent(invoice.order_id)}`,
            notifyUrl: notifyUrlFor(origin),
          });

          await admin
            .from("subscription_invoices")
            .update({ snap_token: snap.token, snap_redirect_url: snap.redirect_url })
            .eq("id", invoice.id);

          return json({
            order_id: invoice.order_id,
            amount: invoice.amount,
            redirect_url: snap.redirect_url,
          });
        }),
    },
  },
});
