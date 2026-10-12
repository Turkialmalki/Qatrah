import { store } from "@/lib/demo/store";

/**
 * Serves images uploaded during a demo session straight out of memory.
 * Uploads vanish on restart, so this 404s rather than caching aggressively.
 */
export async function GET(_request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const key = path.join("/");
  const image = store().images.get(key);

  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "private, max-age=60",
    },
  });
}
