import { supabase } from "@/integrations/supabase/client";

/**
 * Invokes the consolidated `api` Supabase Edge Function.
 * All server-side actions in this app dispatch through this helper.
 */
export async function invokeAction<T = unknown>(
  action: string,
  payload: unknown = {},
): Promise<T> {
  const { data, error } = await supabase.functions.invoke<{ data?: T; error?: string }>(
    "api",
    { body: { action, payload } },
  );
  if (error) {
    // FunctionsHttpError exposes the response on .context
    const ctx = (error as unknown as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const j = (await ctx.json()) as { error?: string };
        if (j?.error) throw new Error(j.error);
      } catch {
        // fall through
      }
    }
    throw new Error(error.message ?? "Request failed");
  }
    if (data && typeof data === "object" && "error" in data && (data as { error?: string }).error) {
    throw new Error((data as { error: string }).error);
  }
  return (data?.data ?? data) as T;
}

/** Wrap an action so callers can keep the `fn({ data: payload })` signature. */
export function action<P, R>(name: string) {
  return async (args?: { data?: P }): Promise<R> => invokeAction<R>(name, args?.data ?? {});
}