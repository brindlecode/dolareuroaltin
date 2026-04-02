export async function GET() {
  const robots = `User-agent: *
Allow: /

Sitemap: https://dolareuroaltin.com/sitemap.xml

# Disallow admin and private paths
Disallow: /api/
Disallow: /_astro/
`;

  return new Response(robots, {
    headers: { 'Content-Type': 'text/plain' }
  });
}
