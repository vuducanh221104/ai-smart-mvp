import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BUCKET = "temp";
const MAX_PAGE = 1000; // page size

Deno.serve(async () => {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const now = Date.now();
  const threshold = now - 24 * 60 * 60 * 1000; // 24 hours

  let offset = 0;
  let totalChecked = 0;
  let totalDeleted = 0;
  const errors: string[] = [];

  while (true) {
    const { data: list, error } = await supabase.storage
      .from(BUCKET)
      .list("", { limit: MAX_PAGE, offset, search: "" });

    if (error) {
      console.error("List error:", error);
      errors.push(`List error: ${error.message}`);
      break;
    }
    if (!list || list.length === 0) break;

    const toDelete = list
      .map((o) => {
        let timestampMs = o.created_at ? Date.parse(o.created_at as unknown as string) : undefined;
        // Fallback to parsing filename if created_at is not available or invalid
        if (!timestampMs || isNaN(timestampMs)) {
          const timestampMatch = o.name.match(/z(\d+)_/);
          if (timestampMatch && timestampMatch[1]) {
            timestampMs = parseInt(timestampMatch[1]);
          }
        }
        return {
          path: o.name,
          timestampMs: timestampMs,
        };
      })
      .filter((o) => o.timestampMs && o.timestampMs < threshold)
      .map((o) => o.path);

    totalChecked += list.length;

    if (toDelete.length > 0) {
      const { error: delErr } = await supabase.storage.from(BUCKET).remove(toDelete);
      if (delErr) {
        console.error("Delete error:", delErr);
        errors.push(`Delete error for paths [${toDelete.join(', ')}]: ${delErr.message}`);
      } else {
        totalDeleted += toDelete.length;
      }
    }

    offset += list.length;
    if (list.length < MAX_PAGE) break;
  }

  return new Response(JSON.stringify({ checked: totalChecked, deleted: totalDeleted, errors }), {
    headers: { "Content-Type": "application/json" },
  });
});
