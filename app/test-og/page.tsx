import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Test OG Image | AI Prompt Hub",
  description: "Testing Open Graph image generation for social media sharing",
  openGraph: {
    title: "Test OG Image",
    description: "Testing Open Graph image generation for social media sharing",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/og?title=${encodeURIComponent('Test OG Image')}&description=${encodeURIComponent('Testing Open Graph image generation')}&category=${encodeURIComponent('Test')}&author=${encodeURIComponent('AI Prompt Hub')}`,
        width: 1200,
        height: 630,
        alt: 'Test OG Image',
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Test OG Image",
    description: "Testing Open Graph image generation for social media sharing",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/og?title=${encodeURIComponent('Test OG Image')}&description=${encodeURIComponent('Testing Open Graph image generation')}&category=${encodeURIComponent('Test')}&author=${encodeURIComponent('AI Prompt Hub')}`],
  },
}

export default function TestOGPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const dynamicOgUrl = `${baseUrl}/api/og?title=${encodeURIComponent('Test OG Image')}&description=${encodeURIComponent('Testing Open Graph image generation')}&category=${encodeURIComponent('Test')}&author=${encodeURIComponent('AI Prompt Hub')}`
  const staticOgUrl = `${baseUrl}/logoBG.png`

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          OG Image Test Page
        </h1>
        
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Dynamic OG Image Preview</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This page tests the dynamic OG image generation. Share this page on social media to see the custom image.
          </p>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium mb-2">Dynamic OG Image URL:</h3>
            <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded block break-all">
              {dynamicOgUrl}
            </code>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Static Logo URL:</h3>
            <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded block break-all">
              {staticOgUrl}
            </code>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Dynamic OG Image Preview</h2>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <img 
              src={dynamicOgUrl} 
              alt="Generated Dynamic OG Image" 
              className="w-full h-auto"
              style={{ aspectRatio: '1200/630' }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Static Logo Preview</h2>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <img 
              src={staticOgUrl} 
              alt="Static Logo Image" 
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            How to Test
          </h3>
          <ul className="text-blue-800 dark:text-blue-200 space-y-2">
            <li>• Copy this page's URL</li>
            <li>• Share it on WhatsApp, Facebook, Twitter, or LinkedIn</li>
            <li>• The custom OG image should appear in the preview</li>
            <li>• You can also use Facebook's Sharing Debugger or Twitter Card Validator</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
