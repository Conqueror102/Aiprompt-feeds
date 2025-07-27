import Link from "next/link"
import { Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              AI<span className="text-green-600">Prompts</span>
            </Link>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-md">
              Discover, share, and save the best AI prompts for ChatGPT, Gemini, Stable Diffusion, and more. Join our
              community of AI enthusiasts.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Platform</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors">
                  Browse Prompts
                </Link>
              </li>
              <li>
                <Link
                  href="/add-prompt"
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors"
                >
                  Add Prompt
                </Link>
              </li>
              <li>
                <Link href="/saved" className="text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors">
                  Saved Prompts
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/help" className="text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">© {new Date().getFullYear()} AIPrompts. All rights reserved.</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-1 mt-2 md:mt-0">
              Made with <Heart className="h-4 w-4 text-red-500 fill-current" /> for the AI community
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
