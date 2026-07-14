import { NextResponse } from "next/server";

import { STANDARD_SITE_PUBLICATION_URI } from "#/lib/api";

export const dynamic = "force-static";

/**
 * Standard.site publication verification endpoint.
 *
 * The response must be the AT-URI of the publication record, with no JSON
 * wrapper or redirect.
 */
export function GET() {
  return new NextResponse(STANDARD_SITE_PUBLICATION_URI, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
