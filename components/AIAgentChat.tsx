"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Copy, ArrowLeft, Zap, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIAgentChatProps {
  agentName: string
  initialPrompt?: string
  onClose: () => void
}

export default function AIAgentChat({ agentName, initialPrompt, onClose }: AIAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showFullScreenModal, setShowFullScreenModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialPrompt) {
      setInputValue(initialPrompt)
    }
  }, [initialPrompt])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getAgentTheme = (agent: string) => {
    const themes: { [key: string]: { bg: string; accent: string; logo: string } } = {
      ChatGPT: { bg: "bg-green-50 dark:bg-green-900/20", accent: "text-green-600", logo: "🤖" },
      Gemini: { bg: "bg-blue-50 dark:bg-blue-900/20", accent: "text-blue-600", logo: "✨" },
      Claude: { bg: "bg-purple-50 dark:bg-purple-900/20", accent: "text-purple-600", logo: "🧠" },
      "Stable Diffusion": { bg: "bg-pink-50 dark:bg-pink-900/20", accent: "text-pink-600", logo: "🎨" },
      "DALL-E": { bg: "bg-orange-50 dark:bg-orange-900/20", accent: "text-orange-600", logo: "🖼️" },
      Midjourney: { bg: "bg-indigo-50 dark:bg-indigo-900/20", accent: "text-indigo-600", logo: "🌟" },
    }
    return themes[agent] || themes.ChatGPT
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `This is a simulated response from ${agentName}. In a real implementation, this would connect to the actual ${agentName} API to provide intelligent responses based on your prompt.

Your message: "${userMessage.content}"

This interface demonstrates how the chat would work with real AI integration.`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
      
      // Show full screen modal after first exchange
      if (messages.length === 0) {
        setTimeout(() => {
          setShowFullScreenModal(true)
        }, 500)
      }
    }, 1500)
  }

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive",
      })
    }
  }

  const handleGoToFullScreen = () => {
    // Store chat data in localStorage for the full screen page
    localStorage.setItem("chatData", JSON.stringify({
      agent: agentName,
      messages,
      initialPrompt
    }))
    window.open("/chat", "_blank")
    onClose()
  }

  const handleStayInModal = () => {
    setShowFullScreenModal(false)
  }

  const theme = getAgentTheme(agentName)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-4xl h-[90vh]  flex flex-col ${theme.bg}`}>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{theme.logo}</div>
              <div>
                <CardTitle className={`${theme.accent} text-xl`}>{agentName} Chat</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered conversation interface</p>
              </div>
              <Badge variant="secondary" className="ml-2">
                <Zap className="h-3 w-3 mr-1" />
                Demo Mode
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoToFullScreen}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                title="Open in full screen"
              >
                <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={onClose}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0  overflow-scroll">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4 ">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">{theme.logo}</div>
                <h3 className={`text-lg font-semibold ${theme.accent} mb-2`}>Welcome to {agentName} Chat</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  This is a demo interface. Start a conversation to see how it would work!
                </p>
                {initialPrompt && (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-sm">
                    <p className="font-medium mb-1">Ready to use prompt:</p>
                    <p className="text-gray-600 dark:text-gray-400">{initialPrompt.slice(0, 100)}...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`${theme.bg} ${theme.accent}`}>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.role === "user" ? "bg-green-600 text-white" : "bg-white dark:bg-gray-800 border"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyMessage(message.content)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-green-100 text-green-600">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`${theme.bg} ${theme.accent}`}>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white dark:bg-gray-800 border rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Message ${agentName}...`}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isLoading}
                className="flex max-h-56 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()} className={theme.accent}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Screen Modal */}
      {showFullScreenModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowUpRight className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Continue Chat in Full Screen?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Would you like to continue this conversation in a dedicated chat page with more features?
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleStayInModal}
                  className="flex-1"
                >
                  Stay Here
                </Button>
                <Button
                  onClick={handleGoToFullScreen}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Full Screen
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
