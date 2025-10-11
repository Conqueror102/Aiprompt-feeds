import { MetadataRoute } from 'next'
import dbConnect from '@/lib/mongodb'
import Prompt from '@/lib/models/Prompt'

/**
 * Dynamic Sitemap Generation for Google Search Console
 * This generates a sitemap.xml file that lists all public pages
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aiprompts.com'

  try {
    await dbConnect()

    // Fetch all public prompts with slugs
    const prompts = await Prompt.find(
      { 
        private: { $ne: true }, 
        isIndexable: { $ne: false },
        slug: { $exists: true, $ne: null }
      },
      { slug: 1, updatedAt: 1 }
    ).lean()

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/explore`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/add-prompt`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
    ]

    // Dynamic prompt pages
    const promptPages: MetadataRoute.Sitemap = prompts.map((prompt: any) => ({
      url: `${baseUrl}/prompt/${prompt.slug}`,
      lastModified: new Date(prompt.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Category pages
    const categories = [
      'Development',
      'Writing',
      'Creative',
      'Business',
      'Education',
      'Health',
      'Entertainment',
      'Other',
    ]

    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/category/${category.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...promptPages, ...categoryPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return at least static pages if database fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}
