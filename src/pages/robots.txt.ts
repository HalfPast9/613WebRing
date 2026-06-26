import type { APIRoute } from "astro";
import { SITE_URL } from "../consts";

// Generated so the sitemap reference always matches SITE_URL.
export const GET: APIRoute = () =>
  new Response(
    `User-agent: *
Allow: /
Disallow: /nav

Sitemap: ${SITE_URL}/sitemap-index.xml
`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
