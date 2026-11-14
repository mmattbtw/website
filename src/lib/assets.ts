/** Whether a static asset was produced by the last build. Only works on demand, in the Worker. */
export async function assetExists(path: string, base: URL): Promise<boolean> {
  try {
    // Imported lazily: `cloudflare:workers` can't load in the Node prerender build.
    const { env } = await import("cloudflare:workers");
    const response = await env.ASSETS.fetch(new URL(path, base), { method: "HEAD" });

    return response.ok;
  } catch {
    return false;
  }
}

/** The prerendered 404 page with a 404 status, for on-demand routes that find nothing. */
export async function notFound(base: URL): Promise<Response> {
  try {
    const { env } = await import("cloudflare:workers");
    const page = await env.ASSETS.fetch(new URL("/404", base));

    return new Response(page.body, { status: 404, headers: page.headers });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
