"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { copyToClipboard, shareContent } from "@/utils/clipboard"
import PromptCardHeader from "@/components/prompts/PromptCardHeader"
import PromptCardActions from "@/components/prompts/PromptCardActions"
import RunPromptDialog from "@/components/prompts/RunPromptDialog"
import { BadgeTier } from "@/types/badge"

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
      highestTier?: BadgeTier
    }
    likes: number
    saves: number
    createdAt: string
    rating?: number
    private?: boolean
    tools?: string[]
    technologies?: string[]
    commentCount?: number
  }
  isLiked?: boolean
  isSaved?: boolean
  isSelected?: boolean
  tempSelectedPromptId?: string | null
  onLike?: (promptId: string) => void
  onSave?: (promptId: string) => void
  currentUserId?: string
  onViewDetails?: (promptId: string) => void
  onComment?: (promptId: string) => void
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
  onComment,
}: PromptCardProps) {
  const router = useRouter()
  const [liked, setLiked] = useState(isLiked)
  const [saved, setSaved] = useState(isSaved)
  const [likesCount, setLikesCount] = useState(prompt.likes)
  const [selectedAgent, setSelectedAgent] = useState<string>("none")
  const [isRunModalOpen, setIsRunModalOpen] = useState(false)
  const [clipboardNotice, setClipboardNotice] = useState<string>("")

  const handleRun = () => {
    setIsRunModalOpen(true)
    setClipboardNotice("") // Reset notice when opening modal
  }

  const handleAgentChange = async (agent: string) => {
    setSelectedAgent(agent)

    // Check if this agent needs clipboard
    const { mapAgentNameToKey } = await import("@/lib/launch-agent")
    const AI_MODELS_CONFIG = (await import("@/lib/ai-models-config")).default

    const key = mapAgentNameToKey(agent)
    const cfg = key ? AI_MODELS_CONFIG[key] : null

    if (cfg && (cfg.type === "clipboard" || cfg.type === "clipboard-special")) {
      setClipboardNotice(cfg.instruction || "Prompt will be copied to clipboard when you click Run")
    } else {
      setClipboardNotice("")
    }
  }

  const handleConfirmRun = async () => {
    if (selectedAgent === "none") return

    const { launchExternalAgent } = await import("@/lib/launch-agent")
    const result = await launchExternalAgent(selectedAgent, prompt.content)

    if (result.success) {
      toast({
        title: result.needsClipboard ? "Prompt Copied!" : "Success",
        description: result.message,
      })
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to launch AI agent",
        variant: "destructive",
      })
    }

    setIsRunModalOpen(false)
  }

  const handleToolClick = async (tool: string) => {
    await copyToClipboard(tool)
    toast({ title: "Tool copied", description: tool })
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

  // Sync likes count with prompt.likes when it changes
  useEffect(() => {
    setLikesCount(prompt.likes)
  }, [prompt.likes])

  const isOwner = currentUserId === prompt.createdBy._id

  const handleEdit = () => {
    router.push(`/edit-prompt/${prompt._id}`)
  }

  const handleCopy = async () => {
    const success = await copyToClipboard(prompt.content)
    if (success) {
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      })
    } else {
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

    // If onLike callback is provided, use it (this means parent manages state)
    if (onLike) {
      console.log('Using parent onLike callback for:', prompt._id)
      onLike(prompt._id)
      return
    }

    // Fallback: manage state locally (for pages that don't use the hook)
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
    const shareLink = `${window.location.origin}?prompt=${prompt._id}`
    const shared = await shareContent(
      prompt.title,
      prompt.description || 'Check out this prompt!',
      shareLink
    )

    if (!shared) {
      const copied = await copyToClipboard(shareLink)
      if (copied) {
        toast({
          title: "Link Copied!",
          description: "Share link copied to clipboard",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive",
        })
      }
    }
  }

  const handleComment = () => {
    // Use dedicated comment modal if provided
    if (onComment) {
      onComment(prompt._id)
      return
    }
    // Fallback: open details modal if provided
    if (onViewDetails) {
      onViewDetails(prompt._id)
      return
    }
    // Final fallback: navigate to home with shared prompt param to open modal
    router.push(`/?prompt=${prompt._id}`)
  }

  const highlight = isSelected || tempSelectedPromptId === prompt._id;

  return (
    <Card className={`w-full max-h-[500px] hover:shadow-lg transition-all duration-200 ${highlight ? 'border-2 border-green-500 shadow-lg' : 'border border-green-500/40'
      }`}>
      <CardHeader className="pb-3">
        <PromptCardHeader
          creatorName={prompt.createdBy.name}
          creatorId={prompt.createdBy._id}
          createdAt={prompt.createdAt}
          rating={prompt.rating}
          isPrivate={prompt.private}
          isOwner={isOwner}
          category={prompt.category}
          tools={prompt.tools}
          technologies={prompt.technologies}
          creatorHighestTier={prompt.createdBy.highestTier}
          onViewDetails={() => onViewDetails?.(prompt._id)}
          onShare={handleShare}
          onEdit={handleEdit}
          onToolClick={handleToolClick}
        />

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
        <PromptCardActions
          liked={liked}
          saved={saved}
          likesCount={likesCount}
          commentCount={prompt.commentCount || 0}
          onLike={handleLike}
          onSave={handleSave}
          onCopy={handleCopy}
          onRun={handleRun}
          onComment={handleComment}
        />
      </CardFooter>

      <RunPromptDialog
        isOpen={isRunModalOpen}
        selectedAgent={selectedAgent}
        onAgentChange={handleAgentChange}
        onConfirm={handleConfirmRun}
        onCancel={() => setIsRunModalOpen(false)}
        clipboardNotice={clipboardNotice}
      />
    </Card>
  )
}
