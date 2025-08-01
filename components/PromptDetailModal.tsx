"use client"

import { useState, useEffect } from "react"
import { Copy, MessageSquare, Heart, Bookmark, Calendar, Tag, Zap, Star, Edit3, Share } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { AI_AGENTS } from "@/lib/constants"
import { useRouter } from "next/navigation"

interface PromptDetailModalProps {
  prompt: {
    _id: string
    title: string
    content: string
    description?: string
    aiAgents: string[]
    category: string
    createdBy: {
      _id: string
      name: string
    }
    likes: number
    saves: number
    createdAt: string
    rating?: number
  } | null
  isOpen: boolean
  onClose: () => void
  currentUserId?: string
  onOpenChat: (agentName: string, prompt: string) => void
  onRated?: (promptId: string, newRating: number) => void
}

export default function PromptDetailModal({
  prompt,
  isOpen,
  onClose,
  currentUserId,
  onOpenChat,
  onRated,
}: PromptDetailModalProps) {
  const router = useRouter()
  const [selectedAgent, setSelectedAgent] = useState<string>("")
  const [userRating, setUserRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [averageRating, setAverageRating] = useState<number | null>(prompt?.rating ?? null)
  const [ratingCount, setRatingCount] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!prompt || !currentUserId || !isOpen) return
    const fetchUserRating = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`/api/prompts/${prompt._id}/rate`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (res.ok) {
          const data = await res.json()
          if (typeof data.value === "number") setUserRating(data.value)
        }
      } catch {}
    }
    fetchUserRating()
    // eslint-disable-next-line
  }, [prompt?._id, currentUserId, isOpen])

  useEffect(() => {
    if (prompt) {
      setAverageRating(prompt.rating ?? null);
      setRatingCount(null);
      setHoverRating(0);
    }
  }, [prompt?._id, isOpen]);

  if (!prompt) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    if (!prompt) return
    
    const shareLink = `${window.location.origin}?prompt=${prompt._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: prompt.title,
          text: prompt.description || 'Check out this prompt!',
          url: shareLink,
        });
      } catch (error) {
        console.error('Share failed:', error);
        // Fallback to clipboard
        await handleCopyLink(shareLink);
      }
    } else {
      // Fallback for browsers without native sharing
      await handleCopyLink(shareLink);
    }
  };

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Link Copied!",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleRunChat = () => {
    if (!selectedAgent) {
      toast({
        title: "Select an AI Agent",
        description: "Please select an AI agent to start chatting",
        variant: "destructive",
      })
      return
    }

    onOpenChat(selectedAgent, prompt.content)
  }

  const handleRate = async (star: number) => {
    if (!currentUserId) {
      toast({ title: "Sign in required", description: "Please sign in to rate prompts", variant: "destructive" })
      return
    }
    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/prompts/${prompt._id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: star }),
      })
      if (res.ok) {
        const data = await res.json()
        setAverageRating(data.average)
        setRatingCount(data.count)
        setUserRating(star)
        
        // Update the prompt with the new rating data
        if (data.prompt && onRated) {
          onRated(prompt._id, data.average)
        }
        
        toast({ title: "Thank you!", description: "Your rating has been submitted." })
      } else {
        const err = await res.json()
        toast({ title: "Error", description: err.error || "Failed to submit rating", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit rating", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditPrompt = () => {
    if (prompt) {
      router.push(`/edit-prompt/${prompt._id}`)
      onClose()
    }
  }

  const isOwner = currentUserId === prompt?.createdBy._id

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] sm:max-h-[90vh] h-[95vh] sm:h-auto overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{prompt.title}</h2>
              {prompt.description && <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{prompt.description}</p>}
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Prompt details and actions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Author and Meta Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarFallback className="bg-green-100 text-green-600">
                  {prompt.createdBy.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{prompt.createdBy.name}</p>
                <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0 sm:space-x-4">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {new Date(prompt.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {prompt.likes} likes
                  </span>
                  <span className="flex items-center">
                    <Bookmark className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {prompt.saves} saves
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
              <Tag className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
              {prompt.category}
            </Badge>
            {prompt.aiAgents.map((agent) => (
              <Badge key={agent} variant="outline" className="text-xs">
                {agent}
              </Badge>
            ))}
          </div>

          {/* Prompt Content */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Prompt Content</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 sm:p-6 border">
              <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                {prompt.content}
              </pre>
            </div>
          </div>

          {/* Star Rating Input */}
          <div className="flex flex-col items-start gap-2 pt-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Rate this prompt:</span>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={submitting}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors ${
                      (hoverRating || userRating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {averageRating !== null && (
                <span className="ml-2 text-xs text-gray-500">{averageRating.toFixed(1)} avg{ratingCount !== null ? ` (${ratingCount})` : ""}</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:gap-4 pt-4 border-t">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleCopy} variant="outline" className="flex-1 bg-transparent text-xs sm:text-sm">
                <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                <span className="hidden sm:inline">Copy to Clipboard</span>
                <span className="sm:hidden">Copy</span>
              </Button>
              
              <Button onClick={handleShare} variant="outline" className="flex-1 bg-transparent text-xs sm:text-sm">
                <Share className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                <span className="hidden sm:inline">Share</span>
                <span className="sm:hidden">Share</span>
              </Button>
              
              {isOwner && (
                <Button 
                  onClick={handleEditPrompt}
                  variant="outline" 
                  className="flex-1 bg-transparent text-xs sm:text-sm"
                >
                  <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  <span className="hidden sm:inline">Edit Prompt</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder="Select AI Agent" />
                </SelectTrigger>
                <SelectContent>
                  {AI_AGENTS.map((agent) => (
                    <SelectItem key={agent} value={agent}>
                      {agent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleRunChat} className="w-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Run Chat</span>
                <span className="sm:hidden">Chat</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
