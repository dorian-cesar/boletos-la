import { MetadataRoute } from 'next';
import { getPasajesRoutes } from '@/lib/pasajes-urls';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://boletos.la';
  const now = new Date();

  // Páginas estáticas principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/paraguay`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/argentina`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/brasil`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/chile`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/colombia`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Rutas dinámicas leídas de url.txt
  const pasajesRoutes = getPasajesRoutes();
  const dynamicPasajesPages: MetadataRoute.Sitemap = pasajesRoutes.map((route) => ({
    url: route.url.startsWith('http') ? route.url : `${baseUrl}${route.url}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...staticPages, ...dynamicPasajesPages];
}
