/**
 * Leaderboard Page
 * 
 * Displays the badge leaderboard with various filtering options
 */

'use client'

import { useState, useEffect } from 'react'
import { LeaderboardView } from '@/components/leaderboard'
import { Trophy, Award, Star } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface User {
  id: string
  name: string
  email: string
}

export default function LeaderboardPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
      }
    }

    fetchUser()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="h-12 w-12 text-green-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-500 via-green-600 to-green-500 bg-clip-text text-transparent">
              Badge Leaderboard
            </h1>
            <Trophy className="h-12 w-12 text-green-500" />
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compete with the community! Earn badges and climb the ranks to become the ultimate AI prompt champion.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
            <StatCard
              icon={<Trophy className="h-6 w-6 text-green-500" />}
              label="Overall Ranking"
              description="All-time badge collectors"
            />
            <StatCard
              icon={<Award className="h-6 w-6 text-green-600" />}
              label="Weekly Champions"
              description="Recent badge earners"
            />
            <StatCard
              icon={<Star className="h-6 w-6 text-green-700" />}
              label="Category Leaders"
              description="Specialized achievements"
            />
          </div>
        </div>

        {/* Leaderboard */}
        <LeaderboardView />
      </div>
      <Footer />
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  description: string
}

function StatCard({ icon, label, description }: StatCardProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
      <div className="mt-1">{icon}</div>
      <div className="text-left">
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
