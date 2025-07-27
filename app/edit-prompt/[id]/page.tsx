"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { 
  Save, 
  Send, 
  ArrowLeft, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Settings,
  Play,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { AI_AGENTS } from "@/lib/constants"

const CATEGORIES = [
  "Development",
  "Writing",
  "Creative",
  "Business",
  "Education",
  "Health",
  "Entertainment",
  "Other"
]

const TECHNOLOGIES = [
  "JavaScript", "Python", "React", "Node.js", "TypeScript", "Vue.js", "Angular",
  "PHP", "Java", "C#", "Go", "Rust", "Swift", "Kotlin", "Dart", "Flutter",
  "Django", "Flask", "Express", "Laravel", "Spring", "ASP.NET", "FastAPI",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase", "AWS", "Docker",
  "Kubernetes", "Git", "Docker", "Jenkins", "CI/CD", "REST API", "GraphQL",
  "WebSocket", "OAuth", "JWT", "OAuth2", "Stripe", "PayPal", "Twilio",
  "SendGrid", "Cloudinary", "Vercel", "Netlify", "Heroku", "DigitalOcean"
]

interface Prompt {
  _id: string
  title: string
  content: string
  description?: string
  aiAgents: string[]
  category: string
  technologies?: string[]
  tools?: string[]
  createdBy: {
    _id: string
    name: string
  }
  likes: number
  saves: number
  rating?: number
  createdAt: string
}

export default function EditPromptPage() {
  const router = useRouter()
  const params = useParams()
  const promptId = params.id as string
  
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [editedContent, setEditedContent] = useState("")
  const [selectedAgent, setSelectedAgent] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState("Inter")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Form data for owners
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    aiAgents: [] as string[],
    technologies: [] as string[],
    tools: [] as string[],
  })

  useEffect(() => {
    fetchUser()
    fetchPrompt()
  }, [promptId])

  useEffect(() => {
    // Check ownership after both user and prompt are loaded
    if (currentUser && prompt) {
      setIsOwner(currentUser.id === prompt.createdBy._id)
    }
  }, [currentUser, prompt])

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setCurrentUser(userData)
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
    }
  }

  const fetchPrompt = async () => {
    try {
      const response = await fetch(`/api/prompts/${promptId}`)
      if (response.ok) {
        const data = await response.json()
        setPrompt(data.prompt)
        setEditedContent(data.prompt.content)
        setSelectedAgent(data.prompt.aiAgents[0] || "")
        
        // Initialize form data for owners
        setFormData({
          title: data.prompt.title,
          description: data.prompt.description || "",
          category: data.prompt.category,
          aiAgents: data.prompt.aiAgents || [],
          technologies: data.prompt.technologies || [],
          tools: data.prompt.tools || [],
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch prompt",
          variant: "destructive",
        })
        router.push("/")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch prompt",
        variant: "destructive",
      })
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!prompt || !isOwner) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: formData.title,
          content: editedContent,
          description: formData.description,
          category: formData.category,
          aiAgents: formData.aiAgents,
          technologies: formData.technologies,
          tools: formData.tools,
        }),
      })

      if (response.ok) {
        toast({
          title: "Saved!",
          description: "Your prompt has been updated",
        })
        // Navigate back to the main page
        router.push("/")
      } else {
        toast({
          title: "Error",
          description: "Failed to save prompt",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save prompt",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedContent)
      toast({
        title: "Copied!",
        description: "Edited prompt copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
      })
    }
  }

  const handleStartChat = () => {
    if (!selectedAgent) {
      toast({
        title: "Select AI Agent",
        description: "Please select an AI agent to start chatting",
        variant: "destructive",
      })
      return
    }

    // Store chat data in localStorage for the full screen page
    localStorage.setItem("chatData", JSON.stringify({
      agent: selectedAgent,
      messages: [],
      initialPrompt: editedContent
    }))
    window.open("/chat", "_blank")
  }

  const handleAgentToggle = (agent: string) => {
    setFormData(prev => ({
      ...prev,
      aiAgents: prev.aiAgents.includes(agent)
        ? prev.aiAgents.filter(a => a !== agent)
        : [...prev.aiAgents, agent]
    }))
  }

  const handleTechToggle = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.includes(tech)
        ? prev.technologies.filter(t => t !== tech)
        : [...prev.technologies, tech]
    }))
  }

  const handleToolsChange = (value: string) => {
    const tools = value.split(",").map(tool => tool.trim()).filter(tool => tool.length > 0)
    setFormData(prev => ({
      ...prev,
      tools
    }))
  }

  const formatText = (command: string) => {
    const textarea = document.getElementById("prompt-editor") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = editedContent.substring(start, end)
    let replacement = ""

    switch (command) {
      case "bold":
        replacement = `**${selectedText}**`
        break
      case "italic":
        replacement = `*${selectedText}*`
        break
      case "underline":
        replacement = `__${selectedText}__`
        break
      case "code":
        replacement = `\`${selectedText}\``
        break
      case "quote":
        replacement = `> ${selectedText}`
        break
      case "list":
        replacement = `- ${selectedText}`
        break
      case "ordered-list":
        replacement = `1. ${selectedText}`
        break
      default:
        return
    }

    const newContent = editedContent.substring(0, start) + replacement + editedContent.substring(end)
    setEditedContent(newContent)
    
    // Set cursor position after the replacement
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + replacement.length, start + replacement.length)
    }, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Prompt Not Found</h2>
            <Button onClick={() => router.push("/")}>Go Back</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isOwner ? "Edit Your Prompt" : "Edit Prompt"}: {prompt.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {isOwner 
                    ? "Edit and save your prompt" 
                    : "Temporary editing environment - copy or start chat with your edited version"
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!isOwner && (
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="w-48">
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
              )}
              
              {!isOwner && (
                <Button
                  onClick={handleStartChat}
                  disabled={!selectedAgent}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              )}
              
              {isOwner && (
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  variant="outline"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              )}
              
              {!isOwner && (
                <Button
                  onClick={handleCopy}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText("bold")}
                className="h-8 w-8 p-0"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText("italic")}
                className="h-8 w-8 p-0"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText("underline")}
                className="h-8 w-8 p-0"
              >
                <Underline className="h-4 w-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText("ordered-list")}
                className="h-8 w-8 p-0"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText("quote")}
                className="h-8 w-8 p-0"
              >
                <Quote className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText("code")}
                className="h-8 w-8 p-0"
              >
                <Code className="h-4 w-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isOwner ? (
          // Owner editing - full form
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter prompt title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter prompt description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* AI Agents */}
            <Card>
              <CardHeader>
                <CardTitle>AI Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {AI_AGENTS.map((agent) => (
                    <Button
                      key={agent}
                      variant={formData.aiAgents.includes(agent) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAgentToggle(agent)}
                      className={formData.aiAgents.includes(agent) ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {agent}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Technologies (for Development category) */}
            {formData.category === "Development" && (
              <Card>
                <CardHeader>
                  <CardTitle>Technologies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {TECHNOLOGIES.map((tech) => (
                      <Button
                        key={tech}
                        variant={formData.technologies.includes(tech) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTechToggle(tech)}
                        className={formData.technologies.includes(tech) ? "bg-blue-600 hover:bg-blue-700" : ""}
                      >
                        {tech}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tools (for Development category) */}
            {formData.category === "Development" && (
              <Card>
                <CardHeader>
                  <CardTitle>Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Input
                      placeholder="e.g. VSCode, Postman, Docker"
                      value={formData.tools.join(", ")}
                      onChange={(e) => handleToolsChange(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tools.map((tool) => (
                        <Badge key={tool} variant="secondary">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Prompt Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none">
                  <textarea
                    id="prompt-editor"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full min-h-[40vh] p-6 text-base leading-relaxed border-0 focus:outline-none focus:ring-0 resize-none font-mono"
                    placeholder="Edit your prompt here..."
                    style={{
                      fontSize: `${fontSize}px`,
                      fontFamily: fontFamily,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Non-owner editing - simple editor
          <Card className="min-h-[80vh]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{prompt.title}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Created by {prompt.createdBy.name} • {new Date(prompt.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{prompt.category}</Badge>
                  {prompt.rating && (
                    <Badge variant="outline">⭐ {prompt.rating.toFixed(1)}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="prose prose-lg max-w-none">
                <textarea
                  id="prompt-editor"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full min-h-[60vh] p-6 text-base leading-relaxed border-0 focus:outline-none focus:ring-0 resize-none font-mono"
                  placeholder="Edit your prompt here..."
                  style={{
                    fontSize: `${fontSize}px`,
                    fontFamily: fontFamily,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 