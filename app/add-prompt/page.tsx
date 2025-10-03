"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Navbar from "@/components/Navbar"
import { AI_AGENTS, CATEGORIES } from "@/lib/constants"
import Footer from "@/components/Footer"

interface User {
  id: string
  name: string
  email: string
}

const TECHNOLOGIES = [
  "React", "Vue", "Angular", "HTML", "CSS", "JavaScript", "TypeScript",
  "Node.js", "Python", "Java", "C#", "PHP", "Ruby", "Go", "Rust",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "SQLite",
  "AWS", "Docker", "Kubernetes", "Git",
  "TensorFlow", "PyTorch", "Machine Learning"
];

export default function AddPromptPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    description: "",
    category: "",
    aiAgents: [] as string[],
    technologies: [] as string[],
    tools: [] as string[],
  })
  const [toolsInput, setToolsInput] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
      router.push("/login")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAgentToggle = (agent: string) => {
    setFormData((prev) => ({
      ...prev,
      aiAgents: prev.aiAgents.includes(agent) ? prev.aiAgents.filter((a) => a !== agent) : [...prev.aiAgents, agent],
    }))
  }

  const handleTechToggle = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.includes(tech)
        ? prev.technologies.filter((t) => t !== tech)
        : [...prev.technologies, tech],
    }))
  }

  const handleToolsChange = (value: string) => {
    setToolsInput(value)
    setFormData((prev) => ({
      ...prev,
      tools: value.split(",").map((t) => t.trim()).filter(Boolean),
    }))
  }

  const handleTechnologiesChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: value.split(",").map((t) => t.trim()).filter(Boolean),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.content || !formData.category || formData.aiAgents.length === 0) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/prompts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...formData, private: isPrivate }),
      })

      if (response.ok) {
        // Clear cache when new prompt is created
        localStorage.removeItem('cachedPrompts')
        localStorage.removeItem('cachedPromptsTime')
        
        toast({
          title: "Success!",
          description: "Your prompt has been created",
        })
        router.push("/")
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to create prompt",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create prompt",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create New Prompt</h1>
          <p className="text-gray-600 dark:text-gray-400">Share your AI prompt with the community</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prompt Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter a descriptive title for your prompt"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of what this prompt does"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="content">Prompt Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  placeholder="Enter your prompt here. Use {variables} for dynamic content..."
                  className="mt-1 min-h-[200px] font-mono"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
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
              {formData.category === "Development" && (
                <>
                  <div>
                    <Label>Technologies</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Select the technologies relevant to this prompt</p>
                    <div className="flex flex-wrap gap-2">
                      {TECHNOLOGIES.map((tech) => (
                        <Button
                          key={tech}
                          type="button"
                          variant={formData.technologies.includes(tech) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleTechToggle(tech)}
                          className={formData.technologies.includes(tech) ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          {tech}
                        </Button>
                      ))}
                    </div>
                    {formData.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.technologies.map((tech) => (
                          <Badge key={tech} variant="secondary" className="bg-green-100 text-green-800">
                            {tech}
                            <button
                              type="button"
                              onClick={() => handleTechToggle(tech)}
                              className="ml-2 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="tools">Tools (comma separated)</Label>
                    <Input
                      id="tools"
                      placeholder="e.g. VSCode, Postman, Docker"
                      value={toolsInput}
                      onChange={(e) => handleToolsChange(e.target.value)}
                      className="mt-1"
                    />
                    {formData.tools.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tools.map((tool) => (
                          <Badge key={tool} variant="secondary" className="bg-green-100 text-green-800">{tool}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div>
                <Label>AI Agents *</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Select which AI agents this prompt works with
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {AI_AGENTS.map((agent) => (
                    <Button
                      key={agent}
                      type="button"
                      variant={formData.aiAgents.includes(agent) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAgentToggle(agent)}
                      className={formData.aiAgents.includes(agent) ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {agent}
                    </Button>
                  ))}
                </div>
                {formData.aiAgents.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.aiAgents.map((agent) => (
                      <Badge key={agent} variant="secondary" className="bg-green-100 text-green-800">
                        {agent}
                        <button
                          type="button"
                          onClick={() => handleAgentToggle(agent)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                  Cancel
                </Button>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="form-checkbox h-4 w-4"
                    />
                    <span className="text-sm">Make this prompt private</span>
                  </label>
                  <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                    {loading ? "Creating..." : "Create Prompt"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
