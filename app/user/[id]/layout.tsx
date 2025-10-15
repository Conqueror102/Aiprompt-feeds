import { Metadata } from "next"
import { notFound } from "next/navigation"

// Fetch user profile for metadata
async function getUserProfile(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/user/profile/${id}`, {
      cache: "no-store",
    })

    if (!res.ok) return null
    return res.json()
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

// Generate dynamic metadata for user profiles
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const profile = await getUserProfile(params.id)

  if (!profile) {
    return {
      title: "User Not Found | AI Prompt Hub",
      description: "The requested user profile could not be found.",
    }
  }

  const title = `${profile.name} - AI Prompt Creator | AI Prompt Hub`
  const description = profile.bio 
    ? `${profile.bio} - ${profile.promptsCount} prompts created on AI Prompt Hub`
    : `${profile.name} has created ${profile.promptsCount} AI prompts. Follow them on AI Prompt Hub to discover their latest prompts.`

  // Generate dynamic OG image URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(profile.name)}&description=${encodeURIComponent(`${profile.promptsCount} AI Prompts Created`)}&category=${encodeURIComponent('Profile')}&author=${encodeURIComponent('AI Prompt Hub')}`

  return {
    title,
    description,
    authors: [{ name: profile.name }],
    creator: profile.name,
    publisher: "AI Prompt Hub",
    alternates: {
      canonical: `/user/${profile.id}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      title,
      description,
      url: `/user/${profile.id}`,
      type: "profile",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${profile.name} - AI Prompt Creator`,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
