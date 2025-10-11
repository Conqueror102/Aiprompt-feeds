"use client"

import { useState, useEffect, useRef } from "react"
import { X, MessageCircle, Send, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useComments } from "@/hooks/use-comments"
import { useIsMobile } from "@/hooks/use-mobile"
import CommentThread from "./CommentThread"
import { Prompt } from "@/types"
import { CommentWithReplies } from "@/types/comment"

interface CommentModalProps {
  prompt: Prompt | null
  isOpen: boolean
  onClose: () => void
  currentUserId?: string
}

export default function CommentModal({
  prompt,
  isOpen,
  onClose,
  currentUserId,
}: CommentModalProps) {
  const isMobile = useIsMobile()
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const {
    comments,
    loading,
    total,
    createComment,
    updateComment,
    deleteComment,
    refresh: refreshComments,
  } = useComments({
    promptId: prompt?._id,
    userId: currentUserId,
  })

  // Handle mobile keyboard
  useEffect(() => {
    if (!isOpen || !isMobile) return

    const handleResize = () => {
      if (textareaRef.current && document.activeElement === textareaRef.current) {
        // Scroll the input into view when keyboard appears
        setTimeout(() => {
          textareaRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          })
        }, 100)
      }
    }

    const handleFocus = () => {
      // Add padding to bottom when keyboard is likely to appear
      if (modalRef.current) {
        modalRef.current.style.paddingBottom = '20vh'
      }
    }

    const handleBlur = () => {
      // Remove padding when keyboard disappears
      if (modalRef.current) {
        modalRef.current.style.paddingBottom = '0'
      }
    }

    window.addEventListener('resize', handleResize)
    textareaRef.current?.addEventListener('focus', handleFocus)
    textareaRef.current?.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('resize', handleResize)
      textareaRef.current?.removeEventListener('focus', handleFocus)
      textareaRef.current?.removeEventListener('blur', handleBlur)
    }
  }, [isOpen, isMobile])

  // Auto-focus on desktop, manual focus on mobile
  useEffect(() => {
    if (isOpen && !isMobile && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen, isMobile])

  const handleSubmit = async () => {
    if (!newComment.trim() || !currentUserId || isSubmitting) return

    setIsSubmitting(true)
    try {
      await createComment(newComment.trim())
      setNewComment("")
      // Keep focus on input for easy follow-up comments
      if (!isMobile) {
        textareaRef.current?.focus()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Handler functions for CommentThread
  const handleCommentUpdate = async (commentId: string, updatedComment: CommentWithReplies) => {
    // Since CommentThread makes its own API calls, we just need to refresh the comments
    // to ensure consistency with the server state
    await refreshComments()
  }

  const handleCommentDelete = async (commentId: string) => {
    // Since CommentThread makes its own API calls, we just need to refresh the comments
    // to ensure consistency with the server state
    await refreshComments()
  }

  const handleReplyAdded = async (parentId: string, newReply: CommentWithReplies) => {
    // Since CommentThread makes its own API calls, we just need to refresh the comments
    // to ensure consistency with the server state
    await refreshComments()
  }

  if (!prompt) return null

  const modalContent = (
    <div 
      ref={modalRef}
      className={`flex flex-col h-full ${isMobile ? 'h-screen' : 'max-h-[80vh]'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <MessageCircle className="h-5 w-5 text-gray-600" />
          <div>
            <h2 className="font-semibold text-lg">Comments</h2>
            <p className="text-sm text-gray-500">{total} comments</p>
          </div>
        </div>
        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Prompt Preview */}
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="text-xs">
              {prompt.createdBy.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{prompt.createdBy.name}</span>
              <Badge variant="outline" className="text-xs">
                {prompt.category}
              </Badge>
            </div>
            <h3 className="font-semibold text-sm mb-2 line-clamp-2">{prompt.title}</h3>
            {prompt.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {prompt.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No comments yet</p>
            <p className="text-sm text-gray-400">Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentThread
              key={comment._id}
              comment={comment}
              currentUserId={currentUserId}
              promptId={prompt._id}
              onUpdate={handleCommentUpdate}
              onDelete={handleCommentDelete}
              onReplyAdded={handleReplyAdded}
            />
          ))
        )}
      </div>

      {/* Comment Input - Fixed at bottom */}
      <div className="border-t bg-white dark:bg-gray-900 p-4 flex-shrink-0">
        {currentUserId ? (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="text-xs">
                {/* You'd get this from user context */}
                U
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment..."
                className="min-h-[80px] resize-none border-gray-200 focus:border-green-500 focus:ring-green-500"
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {isMobile ? 'Tap' : 'Press Enter'} to post
                </p>
                <Button
                  onClick={handleSubmit}
                  disabled={!newComment.trim() || isSubmitting}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-3">Sign in to join the conversation</p>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    // Full-screen modal on mobile
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="p-0 m-0 max-w-none w-full h-full rounded-none border-0">
          {modalContent}
        </DialogContent>
      </Dialog>
    )
  }

  // Overlay modal on desktop
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl w-full max-h-[90vh]">
        {modalContent}
      </DialogContent>
    </Dialog>
  )
}
