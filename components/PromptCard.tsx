"use client"

import { useState, useEffect } from "react"
import { Heart, Bookmark, Copy, ExternalLink, MoreHorizontal, Eye, Star, Edit3, Share, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AI_AGENTS } from "@/lib/constants"
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
    private?: boolean
    tools?: string[]
    technologies?: string[]
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
  const [selectedAgent, setSelectedAgent] = useState<string>("none")
  const [isRunModalOpen, setIsRunModalOpen] = useState(false)

  const handleRun = () => {
    setIsRunModalOpen(true)
  }

  const handleConfirmRun = () => {
    if (selectedAgent === "none") return
    import("@/lib/launch-agent").then(({ launchExternalAgent }) => {
      launchExternalAgent(selectedAgent, prompt.content)
      setIsRunModalOpen(false)
    })
  }

  const handleToolClick = async (tool: string) => {
    try {
      await navigator.clipboard.writeText(tool)
      toast({ title: "Tool copied", description: tool })
    } catch {}
    const q = encodeURIComponent(`${tool} documentation`)
    window.open(`https://www.google.com/search?q=${q}`, "_blank", "noopener,noreferrer")
  }

  // Update local state when props change
  useEffect(() => {
    setLiked(isLiked)
  }, [isLiked])

  useEffect(() => {
    setSaved(isSaved)
  }, [isSaved])

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

  const handleShare = async () => {
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

  const highlight = isSelected || tempSelectedPromptId === prompt._id;

  return (
    <Card className={`w-full hover:shadow-lg transition-all duration-200 ${
      highlight ? 'border-2 border-green-500 shadow-lg' : 'border border-green-500/40'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
              <AvatarFallback className="bg-green-100 text-green-600 text-xs sm:text-sm">
                {prompt.createdBy.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs sm:text-sm font-medium">{prompt.createdBy.name}</p>
              <p className="text-xs text-muted-foreground">{new Date(prompt.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {typeof prompt.rating === 'number' && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                  {prompt.rating.toFixed(1)}
                </span>
              </div>
            )}
            {prompt.private && isOwner && (
              <Badge variant="destructive" className="text-xs mr-2">
                Private
              </Badge>
            )}
            {/* Debug: Show wrench for all Development prompts, then we'll add tools condition */}
            {prompt.category === "Development" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Recommended Tools">
                    <Wrench className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Array.isArray(prompt.tools) && prompt.tools.length > 0 && (
                    <>
                      <DropdownMenuItem disabled className="text-xs font-semibold text-gray-500">Tools</DropdownMenuItem>
                      {prompt.tools.map((tool) => (
                        <DropdownMenuItem key={tool} onClick={() => handleToolClick(tool)}>
                          {tool}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                  {Array.isArray(prompt.technologies) && prompt.technologies.length > 0 && (
                    <>
                      <DropdownMenuItem disabled className="text-xs font-semibold text-gray-500">Technologies</DropdownMenuItem>
                      {prompt.technologies.map((tech) => (
                        <DropdownMenuItem key={tech} onClick={() => handleToolClick(tech)}>
                          {tech}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                  {(!Array.isArray(prompt.tools) || prompt.tools.length === 0) && 
                   (!Array.isArray(prompt.technologies) || prompt.technologies.length === 0) && (
                    <DropdownMenuItem disabled>No tools or technologies specified</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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
                <DropdownMenuItem onClick={handleShare}>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  {isOwner ? "Edit" : "Use & Edit"}
                </DropdownMenuItem>
                <DropdownMenuItem>Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-semibold line-clamp-2">{prompt.title}</h3>
          {prompt.description && <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{prompt.description}</p>}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm font-mono line-clamp-4 whitespace-pre-wrap">{prompt.content}</p>
        </div>

        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
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
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`hover:scale-105 transition-transform ${
                liked ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500"
              }`}
            >
              <Heart className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${liked ? "fill-current" : ""}`} />
              <span className="text-xs sm:text-sm">{likesCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={`hover:scale-105 transition-transform ${
                saved ? "text-blue-500 hover:text-blue-600" : "text-gray-500 hover:text-blue-500"
              }`}
            >
              <Bookmark className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${saved ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">Save</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopy}
              size="sm"
              variant="outline"
              className="hover:scale-105 transition-transform text-xs"
            >
              <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Copy</span>
            </Button>

            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white h-8"
              onClick={handleRun}
            >
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Run
            </Button>
            
          </div>
        </div>
      </CardFooter>

      <Dialog open={isRunModalOpen} onOpenChange={setIsRunModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Run with AI</DialogTitle>
            <DialogDescription>Select an AI agent to run this prompt with.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select AI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select AI</SelectItem>
                {AI_AGENTS.map((agent) => (
                  <SelectItem key={agent} value={agent}>
                    {agent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRunModalOpen(false)}>Cancel</Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={selectedAgent === "none"}
                onClick={handleConfirmRun}
              >
                Run
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </Card>
  )
}
