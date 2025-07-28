"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { 
  Send, 
  Plus, 
  Search, 
  Settings, 
  Menu, 
  X, 
  ArrowLeft,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  FileText,
  Download,
  Trash2,
  Edit3,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  agent: string
  messages: Message[]
  createdAt: Date
  isFavorite?: boolean
}

export default function ChatPage() {
  const router = useRouter()
  const [agent, setAgent] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load chat data from localStorage
    const chatData = localStorage.getItem("chatData")
    if (chatData) {
      const data = JSON.parse(chatData)
      setAgent(data.agent)
      
      // Convert timestamps back to Date objects
      const messagesWithDates = (data.messages || []).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
      setMessages(messagesWithDates)
      
      // Create initial session
      const session: ChatSession = {
        id: Date.now().toString(),
        title: `Chat with ${data.agent}`,
        agent: data.agent,
        messages: messagesWithDates,
        createdAt: new Date(),
      }
      setCurrentSession(session)
      setChatSessions([session])
      
      // If there's an initial prompt, send it automatically
      if (data.initialPrompt && data.messages.length === 0) {
        setTimeout(() => {
          handleInitialPrompt(data.initialPrompt)
        }, 500)
      }
      
      // Clear localStorage
      localStorage.removeItem("chatData")
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsLoading(true)

    // Update current session
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        messages: updatedMessages,
      }
      setCurrentSession(updatedSession)
      setChatSessions(prev => 
        prev.map(session => 
          session.id === currentSession.id ? updatedSession : session
        )
      )
    }

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Thanks for your message! I'm processing your request. This is a simulated response from ${agent}. In a real implementation, this would connect to the actual AI service to provide intelligent responses.`,
        timestamp: new Date(),
      }
      const finalMessages = [...updatedMessages, botResponse]
      setMessages(finalMessages)
      setIsLoading(false)

      // Update session with bot response
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          messages: finalMessages,
        }
        setCurrentSession(updatedSession)
        setChatSessions(prev => 
          prev.map(session => 
            session.id === currentSession.id ? updatedSession : session
          )
        )
      }
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `New Chat ${chatSessions.length + 1}`,
      agent: agent || "AI Assistant",
      messages: [],
      createdAt: new Date(),
    }
    setChatSessions(prev => [newSession, ...prev])
    setCurrentSession(newSession)
    setMessages([])
  }

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSession(session)
    setMessages(session.messages)
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

  const handleDeleteSession = (sessionId: string) => {
    setChatSessions(prev => prev.filter(session => session.id !== sessionId))
    if (currentSession?.id === sessionId) {
      const remainingSessions = chatSessions.filter(session => session.id !== sessionId)
      if (remainingSessions.length > 0) {
        setCurrentSession(remainingSessions[0])
        setMessages(remainingSessions[0].messages)
      } else {
        setCurrentSession(null)
        setMessages([])
      }
    }
  }

  const filteredSessions = chatSessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInitialPrompt = async (initialPrompt: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: initialPrompt,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    // Update current session
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        messages: updatedMessages,
      }
      setCurrentSession(updatedSession)
      setChatSessions(prev => 
        prev.map(session => 
          session.id === currentSession.id ? updatedSession : session
        )
      )
    }

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I've received your prompt: "${initialPrompt.substring(0, 100)}${initialPrompt.length > 100 ? '...' : ''}". This is a simulated response from ${agent}. In a real implementation, this would connect to the actual AI service to provide intelligent responses based on your prompt.`,
        timestamp: new Date(),
      }
      const finalMessages = [...updatedMessages, botResponse]
      setMessages(finalMessages)
      setIsLoading(false)

      // Update session with bot response
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          messages: finalMessages,
        }
        setCurrentSession(updatedSession)
        setChatSessions(prev => 
          prev.map(session => 
            session.id === currentSession.id ? updatedSession : session
          )
        )
      }
    }, 1500)
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-full sm:w-80' : 'w-0'} transition-all duration-300 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col fixed sm:relative z-40 h-full`}>
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-400 text-base sm:text-lg">🐱</span>
              </div>
              <h2 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg truncate">Cat Bot</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="sm:hidden h-8 w-8 p-0 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            onClick={handleNewChat}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base h-10 sm:h-11"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="hidden sm:inline">New Chat</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="p-3 sm:p-4">
            <div className="relative mb-3 sm:mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <Input
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 sm:px-4">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`mb-2 p-2 sm:p-3 rounded-lg cursor-pointer transition-colors ${
                  currentSession?.id === session.id
                    ? "bg-green-100 dark:bg-green-900/20 border-l-4 border-green-500"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => handleSelectSession(session)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate text-xs sm:text-sm">
                      {session.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {session.messages.length} messages
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                        <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        {session.isFavorite ? "Unfavorite" : "Favorite"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col sm:ml-0">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between min-h-[60px]">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="sm:hidden h-10 w-10 p-0"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-3 sm:gap-4">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                  <AvatarFallback className="bg-green-100 text-green-600 text-sm sm:text-base">
                    {agent?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h1 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg truncate">
                    {currentSession?.title || "New Chat"}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500 truncate">
                    {agent || "AI Assistant"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button variant="ghost" size="sm" className="h-10 w-10 sm:h-11 sm:w-11 p-0">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/")}
                className="h-10 px-3 sm:h-11 sm:px-4 text-sm sm:text-base"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🐱</div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to Cat Bot Chat!
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                Start a conversation to see how it would work!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 sm:gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                    <AvatarFallback className="bg-green-100 text-green-600 text-xs sm:text-sm">
                      🐱
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className="max-w-[85%] sm:max-w-[70%]">
                  <div
                    className={`rounded-lg px-3 py-2 sm:px-4 sm:py-2 ${
                      message.role === "user"
                        ? "bg-green-600 text-white"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                    }`}
                  >
                    <p className="text-xs sm:text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1 sm:mt-2 px-1">
                    <span className="text-xs text-gray-500">
                      {message.timestamp instanceof Date 
                        ? message.timestamp.toLocaleTimeString()
                        : new Date(message.timestamp).toLocaleTimeString()
                      }
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyMessage(message.content)}
                        className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                      >
                        <Copy className="h-2 w-2 sm:h-3 sm:w-3" />
                      </Button>
                      {message.role === "assistant" && (
                        <>
                          <Button variant="ghost" size="sm" className="h-5 w-5 sm:h-6 sm:w-6 p-0">
                            <ThumbsUp className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-5 w-5 sm:h-6 sm:w-6 p-0">
                            <ThumbsDown className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs sm:text-sm">
                      U
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-2 sm:gap-3 justify-start">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                <AvatarFallback className="bg-green-100 text-green-600 text-xs sm:text-sm">
                  🐱
                </AvatarFallback>
              </Avatar>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 sm:px-4 sm:py-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your cat bot anything... 🐱"
              className="flex-1 resize-none text-xs sm:text-sm"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 sm:h-10 sm:w-auto p-0 sm:px-3"
            >
              <Send className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 