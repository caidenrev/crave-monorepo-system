import { createFileRoute } from "@tanstack/react-router";
import { handleGatewayAdmin } from "@/lib/server/gateway";

/**
 * POST /pos-system/api/gateway/admin  { action, payload }
 * Dipakai halaman Founder → Gateway QRIS. Meneruskan ke /api/v2/admin/* di gateway
 * dengan token admin dari server; browser tidak pernah memegang token itu.
 */
export const Route = createFileRoute("/api/gateway/admin")({
  server: {
    handlers: {
      POST: ({ request }) => handleGatewayAdmin(request),
    },
  },
});
