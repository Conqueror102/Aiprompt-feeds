import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Calendar, User, Heart, Bookmark, Eye, Share2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import {
  generateMetaTitle,
  generateMetaDescription,
  generateKeywords,
  generatePromptStructuredData,
  generateBreadcrumbStructuredData,
} from "@/lib/utils"

// Fetch prompt by slug
async function getPromptBySlug(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/prompts/slug/${slug}`, {
      cache: "no-store", // Use 'force-cache' with revalidation in production
    })

    if (!res.ok) return null
    return res.json()
  } catch (error) {
    console.error("Error fetching prompt:", error)
    return null
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const prompt = await getPromptBySlug(params.slug)

  if (!prompt) {
    return {
      title: "Prompt Not Found | AI Prompt Hub",
      description: "The requested prompt could not be found.",
    }
  }

  const metaTitle = prompt.seo?.metaTitle || generateMetaTitle(prompt.title, prompt.category)
  const metaDescription = prompt.seo?.metaDescription || generateMetaDescription(prompt.description, prompt.content)
  const keywords = prompt.seo?.keywords || generateKeywords(
    prompt.title,
    prompt.category,
    prompt.aiAgents,
    prompt.technologies
  )

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: keywords.join(", "),
    authors: [{ name: prompt.createdBy.name }],
    creator: prompt.createdBy.name,
    publisher: "AI Prompt Hub",
    alternates: {
      canonical: `/prompt/${prompt.slug}`,
    },
    robots: {
      index: prompt.isIndexable && !prompt.private,
      follow: prompt.isIndexable && !prompt.private,
      googleBot: {
        index: prompt.isIndexable && !prompt.private,
        follow: prompt.isIndexable && !prompt.private,
      },
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `/prompt/${prompt.slug}`,
      type: "article",
      images: prompt.seo?.ogImage ? [
        {
          url: prompt.seo.ogImage,
          width: 1200,
          height: 630,
          alt: prompt.title,
        }
      ] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: prompt.seo?.ogImage ? [prompt.seo.ogImage] : undefined,
    },
  }
}

export default async function PromptPage({ params }: { params: { slug: string } }) {
  const prompt = await getPromptBySlug(params.slug)

  if (!prompt) {
    notFound()
  }

  // Generate structured data for SEO
  const structuredData = generatePromptStructuredData(prompt)
  
  // Generate breadcrumb structured data
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "Home", url: "/" },
    { name: prompt.category, url: `/category/${prompt.category.toLowerCase()}` },
    { name: prompt.title, url: `/prompt/${prompt.slug}` },
  ])

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-green-600 dark:hover:text-green-400">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/category/${prompt.category.toLowerCase()}`}
              className="hover:text-green-600 dark:hover:text-green-400"
            >
              {prompt.category}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 dark:text-white font-medium">{prompt.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        {prompt.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <Link
                            href={`/user/${prompt.createdBy._id}`}
                            className="hover:text-green-600 dark:hover:text-green-400"
                          >
                            {prompt.createdBy.name}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <time dateTime={prompt.createdAt}>
                            {new Date(prompt.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </time>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span>{prompt.analytics?.views || 0} views</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-600 hover:bg-green-700">{prompt.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Description */}
                  {prompt.description && (
                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                      {prompt.description}
                    </p>
                  )}

                  {/* Detailed Description */}
                  {prompt.detailedDescription && (
                    <div>
                      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                        About This Prompt
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {prompt.detailedDescription}
                      </p>
                    </div>
                  )}

                  {/* Prompt Content */}
                  <div>
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                      Prompt
                    </h2>
                    <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                      <CardContent className="p-6">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                          {prompt.content}
                        </pre>
                      </CardContent>
                    </Card>
                  </div>

                  {/* How to Use */}
                  {prompt.howToUse && (
                    <div>
                      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                        How to Use
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {prompt.howToUse}
                      </p>
                    </div>
                  )}

                  {/* Use Cases */}
                  {prompt.useCases && prompt.useCases.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                        Use Cases
                      </h2>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                        {prompt.useCases.map((useCase: string, index: number) => (
                          <li key={index} className="leading-relaxed">{useCase}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tips */}
                  {prompt.tips && prompt.tips.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                        Tips for Best Results
                      </h2>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                        {prompt.tips.map((tip: string, index: number) => (
                          <li key={index} className="leading-relaxed">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Examples */}
                  {prompt.examples && prompt.examples.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                        Examples
                      </h2>
                      <div className="space-y-4">
                        {prompt.examples.map((example: any, index: number) => (
                          <Card key={index} className="bg-gray-50 dark:bg-gray-900">
                            <CardContent className="p-4">
                              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Input:</h3>
                              <p className="text-gray-700 dark:text-gray-300 mb-3">{example.input}</p>
                              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Output:</h3>
                              <p className="text-gray-700 dark:text-gray-300">{example.output}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Prompt
                    </Button>
                    <Button variant="outline">
                      <Heart className="h-4 w-4 mr-2" />
                      Like ({prompt.likes})
                    </Button>
                    <Button variant="outline">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save ({prompt.saves})
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Agents */}
              <Card>
                <CardHeader>
                  <CardTitle>Compatible AI Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {prompt.aiAgents.map((agent: string) => (
                      <Badge key={agent} variant="outline">
                        {agent}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Technologies */}
              {prompt.technologies && prompt.technologies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Technologies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {prompt.technologies.map((tech: string) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Views</span>
                    <span className="font-semibold">{prompt.analytics?.views || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Likes</span>
                    <span className="font-semibold">{prompt.likes}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Saves</span>
                    <span className="font-semibold">{prompt.saves}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Comments</span>
                    <span className="font-semibold">{prompt.commentCount || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Author Card */}
              <Card>
                <CardHeader>
                  <CardTitle>About the Author</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/user/${prompt.createdBy._id}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-lg">
                      {prompt.createdBy.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {prompt.createdBy.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">View Profile</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
