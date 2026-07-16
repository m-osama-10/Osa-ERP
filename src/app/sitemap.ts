import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://osa-erp.com'
  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/#home`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/#features`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/#modules`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/#pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/#demo`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/#faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]
}
