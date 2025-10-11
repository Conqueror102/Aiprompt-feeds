import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Metadata } from "next"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// SEO UTILITY FUNCTIONS
// ============================================

/**
 * Generate SEO-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .substring(0, 100) // Limit length
}

/**
 * Generate unique slug by appending random string if needed
 */
export function generateUniqueSlug(title: string, existingSlugs: string[] = []): string {
  let slug = generateSlug(title)
  
  if (existingSlugs.includes(slug)) {
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    slug = `${slug}-${randomSuffix}`
  }
  
  return slug
}

/**
 * Generate meta title (max 60 characters for SEO)
 */
export function generateMetaTitle(title: string, category?: string): string {
  const suffix = " | AI Prompt Hub"
  const maxLength = 60
  
  let metaTitle = title
  
  if (category) {
    metaTitle = `${title} - ${category}`
  }
  
  // Truncate if too long
  if (metaTitle.length + suffix.length > maxLength) {
    metaTitle = metaTitle.substring(0, maxLength - suffix.length - 3) + "..."
  }
  
  return metaTitle + suffix
}

/**
 * Generate meta description (max 160 characters for SEO)
 */
export function generateMetaDescription(description: string, content: string): string {
  const maxLength = 160
  
  // Use description if available, otherwise use content
  let metaDesc = description || content
  
  // Clean HTML tags if any
  metaDesc = metaDesc.replace(/<[^>]*>/g, "")
  
  // Truncate if too long
  if (metaDesc.length > maxLength) {
    metaDesc = metaDesc.substring(0, maxLength - 3) + "..."
  }
  
  return metaDesc
}

/**
 * Generate keywords from prompt data
 */
export function generateKeywords(
  title: string,
  category: string,
  aiAgents: string[],
  technologies: string[] = [],
  customKeywords: string[] = []
): string[] {
  const keywords = new Set<string>()
  
  // Add custom keywords first
  customKeywords.forEach(k => keywords.add(k.toLowerCase()))
  
  // Add category
  keywords.add(category.toLowerCase())
  
  // Add AI agents
  aiAgents.forEach(agent => keywords.add(agent.toLowerCase()))
  
  // Add technologies
  technologies.forEach(tech => keywords.add(tech.toLowerCase()))
  
  // Add words from title (longer than 3 chars)
  title
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .forEach(word => keywords.add(word))
  
  // Add generic keywords
  keywords.add("ai prompt")
  keywords.add("prompt template")
  keywords.add("ai assistant")
  
  return Array.from(keywords).slice(0, 15) // Limit to 15 keywords
}

/**
 * Generate structured data (JSON-LD) for a prompt
 */
export function generatePromptStructuredData(prompt: {
  title: string
  description: string
  content: string
  category: string
  createdBy: { name: string; _id: string }
  rating?: number
  likes: number
  createdAt: string
  updatedAt: string
  slug: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://aiprompts.com"
  
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: prompt.title,
    description: prompt.description || prompt.content.substring(0, 160),
    articleBody: prompt.content,
    author: {
      "@type": "Person",
      name: prompt.createdBy.name,
      url: `${baseUrl}/user/${prompt.createdBy._id}`,
    },
    datePublished: prompt.createdAt,
    dateModified: prompt.updatedAt,
    publisher: {
      "@type": "Organization",
      name: "AI Prompt Hub",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logoAI.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/prompt/${prompt.slug}`,
    },
    keywords: prompt.category,
    aggregateRating: prompt.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: prompt.rating,
          ratingCount: prompt.likes,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  }
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://aiprompts.com"
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  }
}

/**
 * Generate Open Graph metadata
 */
export function generateOpenGraphMetadata({
  title,
  description,
  image,
  url,
  type = "article",
}: {
  title: string
  description: string
  image?: string
  url: string
  type?: "article" | "website"
}): Metadata["openGraph"] {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://aiprompts.com"
  
  return {
    title,
    description,
    url: `${baseUrl}${url}`,
    type,
    images: image
      ? [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: title,
          },
        ]
      : [
          {
            url: `${baseUrl}/logoBG.png`,
            width: 1200,
            height: 630,
            alt: "AI Prompt Hub",
          },
        ],
    siteName: "AI Prompt Hub",
  }
}

/**
 * Generate Twitter Card metadata
 */
export function generateTwitterMetadata({
  title,
  description,
  image,
}: {
  title: string
  description: string
  image?: string
}): Metadata["twitter"] {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://aiprompts.com"
  
  return {
    card: "summary_large_image",
    title,
    description,
    images: image ? [image] : [`${baseUrl}/logoBG.png`],
    creator: "@aiprompts",
  }
}

/**
 * Extract plain text from HTML content
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + "..."
}
