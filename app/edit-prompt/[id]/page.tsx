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
  X,
  Strikethrough,
  Type,
  RotateCcw,
  Copy
} from "lucide-react"
import { Lock, Unlock } from "lucide-react"
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
  private?: boolean
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
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const [clipboardNotice, setClipboardNotice] = useState<string>("")
  
  // Form data for owners
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    aiAgents: [] as string[],
    technologies: [] as string[],
    tools: [] as string[],
    private: false,
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
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/prompts/${promptId}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
      if (response.ok) {
        const data = await response.json()
        setPrompt(data)
        // Convert plain text to HTML with proper line breaks to prevent overlap
        const htmlContent = data.content.replace(/\n/g, '<br>')
        setEditedContent(htmlContent)
        setSelectedAgent(data.aiAgents[0] || "")
        
        // Initialize form data for owners
        setFormData({
          title: data.title,
          description: data.description || "",
          category: data.category,
          aiAgents: data.aiAgents || [],
          technologies: data.technologies || [],
          tools: data.tools || [],
          private: !!data.private,
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
      // Confirm if changing visibility from private -> public or public -> private
      if (typeof formData.private === 'boolean' && formData.private !== !!prompt.private) {
        const changingTo = formData.private ? 'private' : 'public'
        const confirmed = window.confirm(`Are you sure you want to make this prompt ${changingTo}?`)
        if (!confirmed) {
          setSaving(false)
          return
        }
      }

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
          private: formData.private,
        }),
      })

      if (response.ok) {
        // Clear cache when prompt is edited
        localStorage.removeItem('cachedPrompts')
        localStorage.removeItem('cachedPromptsTime')
        
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

  const handleRunWithAI = async () => {
    if (!selectedAgent) {
      toast({
        title: "Select an AI Agent",
        description: "Please select an AI agent to run this prompt",
        variant: "destructive",
      })
      return
    }

    // Convert HTML content back to plain text for AI agents
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = editedContent
    const plainTextContent = tempDiv.textContent || tempDiv.innerText || ''

    const { launchExternalAgent } = await import("@/lib/launch-agent")
    const result = await launchExternalAgent(selectedAgent, plainTextContent)

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
    const editor = document.getElementById("prompt-editor") as HTMLDivElement
    if (!editor) return

    // Focus the editor first
    editor.focus()
    
    try {
      // Handle special cases
      switch (command) {
        case "list":
          // Toggle bullet list (like MS Word)
          document.execCommand('insertUnorderedList', false)
          break
        case "ordered-list":
          // Toggle numbered list (like MS Word)
          document.execCommand('insertOrderedList', false)
          break
        case "quote":
          // Create a blockquote
          const selection = window.getSelection()
          if (selection && selection.rangeCount > 0) {
            try {
              const range = selection.getRangeAt(0)
              const blockquote = document.createElement('blockquote')
              blockquote.style.borderLeft = '4px solid #ccc'
              blockquote.style.paddingLeft = '1rem'
              blockquote.style.margin = '1rem 0'
              range.surroundContents(blockquote)
            } catch (e) {
              // If surroundContents fails, use formatBlock
              document.execCommand('formatBlock', false, 'blockquote')
            }
          }
          break
        case "code":
          document.execCommand('formatBlock', false, 'pre')
          break
        default:
          // Execute the command (bold, italic, underline, etc. auto-toggle)
          document.execCommand(command, false)
      }
      
      // Update active formats
      updateActiveFormats()
    } catch (error) {
      console.error('Format command failed:', error)
    }
    
    // Update the state with the new content
    setEditedContent(editor.innerHTML)
  }

  const updateActiveFormats = () => {
    const formats = new Set<string>()
    
    // Check which formats are currently active
    if (document.queryCommandState('bold')) formats.add('bold')
    if (document.queryCommandState('italic')) formats.add('italic')
    if (document.queryCommandState('underline')) formats.add('underline')
    if (document.queryCommandState('strikeThrough')) formats.add('strikethrough')
    if (document.queryCommandState('insertUnorderedList')) formats.add('list')
    if (document.queryCommandState('insertOrderedList')) formats.add('ordered-list')
    
    setActiveFormats(formats)
  }

  const handleUndo = () => {
    const editor = document.getElementById("prompt-editor") as HTMLDivElement
    if (!editor) return
    
    editor.focus()
    document.execCommand('undo', false, undefined as any)
    setEditedContent(editor.innerHTML)
  }

  const handleRedo = () => {
    const editor = document.getElementById("prompt-editor") as HTMLDivElement
    if (!editor) return
    
    editor.focus()
    document.execCommand('redo', false, undefined as any)
    setEditedContent(editor.innerHTML)
  }

  const handleAlignment = (align: string) => {
    const editor = document.getElementById("prompt-editor") as HTMLDivElement
    if (!editor) return
    
    editor.focus()
    document.execCommand('justify' + align, false, undefined as any)
    setEditedContent(editor.innerHTML)
    updateActiveFormats()
  }

  const handleEditorChange = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML
    setEditedContent(content)
    setShowPlaceholder(content === '' || content === '<br>' || content === '<div><br></div>')
    updateActiveFormats()
  }

  const handleEditorPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  const handleEditorFocus = () => {
    setShowPlaceholder(false)
  }

  const handleEditorBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML
    setShowPlaceholder(content === '' || content === '<br>' || content === '<div><br></div>')
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20 h-10 px-3 sm:h-11 sm:px-4"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {isOwner ? "Edit Your Prompt" : "Edit Prompt"}: {prompt.title}
                  {prompt.private && (
                    <span title="Private prompt" className="ml-2 inline-flex items-center text-yellow-600">
                      <Lock className="h-4 w-4" />
                    </span>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                  {isOwner 
                    ? "Edit and save your prompt" 
                    : "Temporary editing environment - copy or start chat with your edited version"
                  }
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {!isOwner && (
                <div className="flex flex-col gap-2 flex-1">
                  <Select value={selectedAgent} onValueChange={handleAgentChange}>
                    <SelectTrigger className="w-full sm:w-48 border-green-200 dark:border-green-700 text-xs sm:text-sm">
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
                  {clipboardNotice && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-2 text-xs text-blue-700 dark:text-blue-300">
                      ℹ️ {clipboardNotice}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-2 sm:gap-3">
                {!isOwner && (
                  <Button
                    onClick={handleRunWithAI}
                    disabled={!selectedAgent}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none text-xs sm:text-sm h-10 sm:h-11"
                  >
                    <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="hidden sm:inline">Run with AI</span>
                    <span className="sm:hidden">Run</span>
                  </Button>
                )}
                
                {isOwner && (
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!formData.private}
                        onChange={(e) => setFormData(prev => ({ ...prev, private: e.target.checked }))}
                        className="form-checkbox h-4 w-4"
                      />
                      <span className="text-sm hidden sm:inline">Private</span>
                      <span className="inline sm:hidden">
                        {formData.private ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </span>
                    </label>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none text-xs sm:text-sm h-10 sm:h-11"
                    >
                      <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span className="hidden sm:inline">{saving ? "Saving..." : "Save Changes"}</span>
                      <span className="sm:hidden">{saving ? "Saving..." : "Save"}</span>
                    </Button>
                  </div>
                )}
                
                {!isOwner && (
                  <Button
                    onClick={handleCopy}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none text-xs sm:text-sm h-10 sm:h-11"
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="hidden sm:inline">Copy</span>
                    <span className="sm:hidden">Copy</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 sm:gap-2 py-2 overflow-x-auto">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText("bold")}
                className={`h-8 w-8 p-0 ${activeFormats.has('bold') ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20'}`}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText("italic")}
                className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText("underline")}
                className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20"
              >
                <Underline className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText("strikethrough")}
                className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20"
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6 bg-green-200 dark:bg-green-700 flex-shrink-0" />
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText("list")}
                className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText("ordered-list")}
                className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText("quote")}
                className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20"
              >
                <Quote className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText("code")}
                className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20"
              >
                <Code className="h-4 w-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6 bg-green-200 dark:bg-green-700 flex-shrink-0" />
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlignment("Left")}
                className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlignment("Center")}
                className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlignment("Right")}
                className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6 bg-green-200 dark:bg-green-700" />
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20"
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText("removeFormat")}
                className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20"
                title="Clear formatting"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {isOwner ? (
          // Owner editing - content first, then sidebar
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Main Content Editor - Takes 3/4 of space */}
            <div className="lg:col-span-3">
              <Card className="min-h-[50vh] sm:min-h-[60vh] lg:min-h-[80vh] border-green-200 dark:border-green-700">
                <CardHeader className="bg-green-50 dark:bg-green-900/20 p-4 sm:p-6">
                  <CardTitle className="text-green-800 dark:text-green-200 text-base sm:text-lg lg:text-xl">Edit Prompt Content</CardTitle>
                  <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">Focus on editing your prompt content here</p>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="prose prose-lg max-w-none relative">
                    <div
                      id="prompt-editor"
                      contentEditable
                      dangerouslySetInnerHTML={{ __html: editedContent }}
                      onInput={handleEditorChange}
                      onPaste={handleEditorPaste}
                      onFocus={handleEditorFocus}
                      onBlur={handleEditorBlur}
                      className="w-full min-h-[40vh] sm:min-h-[50vh] lg:min-h-[70vh] p-3 sm:p-6 text-xs sm:text-sm lg:text-base leading-relaxed border-0 focus:outline-none resize-none font-mono outline-none focus:ring-2 focus:ring-green-500/20 whitespace-pre-wrap overflow-auto break-words"
                      style={{
                        fontSize: `${fontSize}px`,
                        fontFamily: fontFamily,
                      }}
                    />
                    {showPlaceholder && (
                      <div className="absolute top-3 sm:top-6 left-3 sm:left-6 text-green-400 dark:text-green-500 pointer-events-none text-xs sm:text-sm lg:text-base">
                        <p>Start typing your prompt here...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar with other fields - Takes 1/4 of space */}
            <div className="lg:col-span-1 space-y-3 sm:space-y-4 lg:space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Basic Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-sm">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter title"
                      className="text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-sm">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description"
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-sm">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="text-sm">
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
                  <CardTitle className="text-lg">AI Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {AI_AGENTS.map((agent) => (
                      <Button
                        key={agent}
                        variant={formData.aiAgents.includes(agent) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleAgentToggle(agent)}
                        className={`text-xs ${
                          formData.aiAgents.includes(agent) 
                            ? "bg-green-600 hover:bg-green-700 border-green-600" 
                            : ""
                        }`}
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
                    <CardTitle className="text-lg">Technologies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-32 overflow-y-auto">
                      <div className="flex flex-wrap gap-1">
                        {TECHNOLOGIES.map((tech) => (
                          <Button
                            key={tech}
                            variant={formData.technologies.includes(tech) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTechToggle(tech)}
                            className={`text-xs ${
                              formData.technologies.includes(tech) 
                                ? "bg-blue-600 hover:bg-blue-700 border-blue-600" 
                                : ""
                            }`}
                          >
                            {tech}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tools (for Development category) */}
              {formData.category === "Development" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Input
                        placeholder="e.g. VSCode, Postman"
                        value={formData.tools.join(", ")}
                        onChange={(e) => handleToolsChange(e.target.value)}
                        className="text-sm"
                      />
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.tools.map((tool) => (
                          <Badge key={tool} variant="secondary" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          // Non-owner editing - simple editor
          <Card className="min-h-[50vh] sm:min-h-[60vh] lg:min-h-[80vh]">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg lg:text-xl truncate">{prompt.title}</CardTitle>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                      Created by {prompt.createdBy.name} • {new Date(prompt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="secondary" className="text-xs">{prompt.category}</Badge>
                    {prompt.rating && (
                      <Badge variant="outline" className="text-xs">⭐ {prompt.rating.toFixed(1)}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-3 sm:p-6">
                <div className="prose prose-lg max-w-none relative">
                  <div
                    id="prompt-editor"
                    contentEditable
                    dangerouslySetInnerHTML={{ __html: editedContent }}
                    onInput={handleEditorChange}
                    onPaste={handleEditorPaste}
                    onFocus={handleEditorFocus}
                    onBlur={handleEditorBlur}
                    className="w-full min-h-[40vh] sm:min-h-[50vh] lg:min-h-[70vh] p-3 sm:p-6 text-xs sm:text-sm lg:text-base leading-relaxed border-0 focus:outline-none focus:ring-0 resize-none font-mono outline-none whitespace-pre-wrap overflow-auto break-words"
                    style={{
                      fontSize: `${fontSize}px`,
                      fontFamily: fontFamily,
                    }}
                  />
                  {showPlaceholder && (
                    <div className="absolute top-3 sm:top-6 left-3 sm:left-6 text-gray-500 dark:text-gray-400 pointer-events-none text-sm sm:text-base">
                      <p>Start typing your prompt here...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
        )}
      </div>
    </div>
  )
} 