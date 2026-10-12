import { createFileRoute } from "@tanstack/react-router";
import { adminClient, billingHealth, handle, json, requireUser, BillingError } from "@/lib/server/billing";

/**
 * GET /pos-system/api/billing/health
 * Untuk halaman Pengaturan founder: apakah kunci server sudah terpasang. Hanya
 * mengembalikan ya/tidak, tidak pernah nilai kuncinya.
 */
export const Route = createFileRoute("/api/billing/health")({
  server: {
    handlers: {
      GET: ({ request }) =>
        handle(async () => {
          const health = billingHealth();
          if (!health.configured) return json(health);
          const admin = adminClient();
          const user = await requireUser(request, admin);
          const { data: isAdmin } = await admin
            .from("app_admins")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();
          if (!isAdmin) throw new BillingError("Khusus founder", 403);
          return json(health);
        }),
    },
  },
});
