"use client"

import { useState } from "react"
import { Heart, Bookmark, Copy, ExternalLink, MoreHorizontal, Eye, Star, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface PromptCardProps {
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
  }
  isLiked?: boolean
  isSaved?: boolean
  isSelected?: boolean
  tempSelectedPromptId?: string | null
  onLike?: (promptId: string) => void
  onSave?: (promptId: string) => void
  currentUserId?: string
  onViewDetails?: (promptId: string) => void
}

export default function PromptCard({
  prompt,
  isLiked = false,
  isSaved = false,
  isSelected = false,
  tempSelectedPromptId,
  onLike,
  onSave,
  currentUserId,
  onViewDetails,
}: PromptCardProps) {
  const router = useRouter()
  const [liked, setLiked] = useState(isLiked)
  const [saved, setSaved] = useState(isSaved)
  const [likesCount, setLikesCount] = useState(prompt.likes)

  const isOwner = currentUserId === prompt.createdBy._id

  const handleEdit = () => {
    router.push(`/edit-prompt/${prompt._id}`)
  }

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

  const handleLike = async () => {
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like prompts",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/user/like-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ promptId: prompt._id }),
      })

      if (response.ok) {
        setLiked(!liked)
        setLikesCount((prev) => (liked ? prev - 1 : prev + 1))
        onLike?.(prompt._id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like prompt",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save prompts",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/user/save-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ promptId: prompt._id }),
      })

      if (response.ok) {
        setSaved(!saved)
        onSave?.(prompt._id)
        toast({
          title: saved ? "Removed from saved" : "Saved!",
          description: saved ? "Prompt removed from your saved list" : "Prompt saved to your collection",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save prompt",
        variant: "destructive",
      })
    }
  }

  const highlight = isSelected || tempSelectedPromptId === prompt._id;

  return (
    <Card className={`w-full hover:shadow-lg transition-all duration-200 ${
      highlight ? 'border-2 border-green-500 shadow-lg' : 'border border-green-500/40'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-green-100 text-green-600 text-sm">
                {prompt.createdBy.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{prompt.createdBy.name}</p>
              <p className="text-xs text-muted-foreground">{new Date(prompt.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            {typeof prompt.rating === 'number' && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                  {prompt.rating.toFixed(1)}
                </span>
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails?.(prompt._id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>Report</DropdownMenuItem>
                {isOwner && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold line-clamp-2">{prompt.title}</h3>
          {prompt.description && <p className="text-sm text-muted-foreground line-clamp-2">{prompt.description}</p>}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-4">
          <p className="text-sm font-mono line-clamp-4 whitespace-pre-wrap">{prompt.content}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            {prompt.category}
          </Badge>
          {prompt.aiAgents.map((agent) => (
            <Badge key={agent} variant="outline" className="text-xs">
              {agent}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`hover:scale-105 transition-transform ${
                liked ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500"
              }`}
            >
              <Heart className={`h-4 w-4 mr-1 ${liked ? "fill-current" : ""}`} />
              {likesCount}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={`hover:scale-105 transition-transform ${
                saved ? "text-blue-500 hover:text-blue-600" : "text-gray-500 hover:text-blue-500"
              }`}
            >
              <Bookmark className={`h-4 w-4 mr-1 ${saved ? "fill-current" : ""}`} />
              Save
            </Button>
          </div>

          <Button
            onClick={handleCopy}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white hover:scale-105 transition-transform"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
