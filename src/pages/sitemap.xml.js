import rates from '../data/rates_current.json';

export async function GET() {
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'hourly' },
    { url: '/dolar-kuru', priority: '0.9', changefreq: 'hourly' },
    { url: '/euro-kuru', priority: '0.9', changefreq: 'hourly' },
    { url: '/altin-fiyati', priority: '0.9', changefreq: 'hourly' },
    { url: '/sterlin-kuru', priority: '0.7', changefreq: 'daily' },
    { url: '/doviz-cevirici', priority: '0.7', changefreq: 'daily' },
    { url: '/gecmisteAlsaydim', priority: '0.7', changefreq: 'weekly' },
    { url: '/tcmb-faiz-karari', priority: '0.6', changefreq: 'weekly' },
    { url: '/enflasyon', priority: '0.6', changefreq: 'monthly' },
  ];

  const lastmod = rates.last_updated.split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>https://dolareuroaltin.com${p.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
