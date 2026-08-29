export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  
  console.error("[Runtime Error]", error, context);
}
