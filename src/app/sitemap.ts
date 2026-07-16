import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://osa-erp.example.com'
  const now = new Date()
  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/#dashboard`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/#accounting`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/#sales`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/#inventory`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/#hr`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/#reports`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
  ]
}
