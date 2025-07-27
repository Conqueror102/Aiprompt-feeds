"use client"

import { useState, useEffect } from "react"
import { Terminal, Code, Cpu, Database, Globe, Zap, Tag, X, Copy, Star, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import PromptCard from "./PromptCard"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AI_AGENTS } from "@/lib/constants"

interface DevModeInterfaceProps {
  prompts: any[]
  currentUserId?: string
  onDeactivate: () => void
}

export default function DevModeInterface({ prompts, currentUserId, onDeactivate }: DevModeInterfaceProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTech, setSelectedTech] = useState<string>("")
  const [filteredPrompts, setFilteredPrompts] = useState(prompts)
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null)
  const [selectedAgent, setSelectedAgent] = useState<string>("")

  // Debug: Log prompts to see what data we're receiving
  useEffect(() => {
    console.log("DevMode prompts received:", prompts)
    if (prompts.length > 0) {
      console.log("First prompt in dev mode:", prompts[0])
      console.log("Technologies in first prompt:", prompts[0].technologies)
      console.log("Tools in first prompt:", prompts[0].tools)
    }
  }, [prompts])

  useEffect(() => {
    filterPrompts()
  }, [prompts, searchTerm, selectedTech])

  const filterPrompts = () => {
    let filtered = prompts.filter((prompt) => {
      const devCategories = ["Development", "Design", "Business"]
      return devCategories.includes(prompt.category)
    })
    if (searchTerm) {
      filtered = filtered.filter(
        (prompt) =>
          prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prompt.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (selectedTech) {
      filtered = filtered.filter((prompt) =>
        prompt.technologies && prompt.technologies.includes(selectedTech)
      )
    }
    setFilteredPrompts(filtered)
  }

  const getAllTechs = () => {
    const allTechs = new Set<string>()
    prompts.forEach((prompt) => {
      if (Array.isArray(prompt.technologies)) {
        prompt.technologies.forEach((tech: string) => allTechs.add(tech))
      }
    })
    return Array.from(allTechs).sort()
  }

  const getTechIcon = (tech: string) => {
    if (tech.includes("React") || tech.includes("Vue") || tech.includes("Angular")) return <Code className="h-4 w-4" />
    if (tech.includes("Database") || tech.includes("MongoDB") || tech.includes("SQL"))
      return <Database className="h-4 w-4" />
    if (tech.includes("Node") || tech.includes("Python") || tech.includes("Java")) return <Cpu className="h-4 w-4" />
    if (tech.includes("HTML") || tech.includes("CSS")) return <Globe className="h-4 w-4" />
    return <Terminal className="h-4 w-4" />
  }

  const handleOpenChat = (agentName: string, promptContent: string) => {
    // This would integrate with your chat system
    console.log(`Opening chat with ${agentName} using prompt: ${promptContent}`)
    // You can implement the actual chat opening logic here
  }

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 font-mono">
      {/* Header */}
      <div className="bg-black border-b border-green-500/30 p-4 relative">
        <div className="absolute right-4 top-4">
          <button
            onClick={onDeactivate}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold shadow transition-all"
          >
            Deactivate Dev Mode
          </button>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Terminal className="h-8 w-8 text-green-400" />
            <div>
              <h1 className="text-2xl font-bold text-green-400">
                <span className="text-green-300">&gt;</span> DEVELOPER MODE ACTIVATED
              </h1>
              <p className="text-green-300/70 text-sm">// Enhanced prompt discovery for developers</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Terminal className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 h-4 w-4" />
            <Input
              placeholder="$ search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-green-500/30 text-green-400 placeholder-green-400/50 focus:border-green-400"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Tech Stack Filter */}
        <Card className="mb-6 bg-gray-800 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Detected Technologies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getAllTechs().map((tech) => (
                <Badge
                  key={tech}
                  variant={selectedTech === tech ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedTech === tech
                      ? "bg-green-600 text-white border-green-400"
                      : "bg-gray-700 text-green-400 border-green-500/30 hover:bg-green-900/30"
                  }`}
                  onClick={() => setSelectedTech(selectedTech === tech ? "" : tech)}
                >
                  {getTechIcon(tech)}
                  <span className="ml-1">{tech}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gray-800 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-green-400 font-bold text-lg">{filteredPrompts.length}</p>
                  <p className="text-green-300/70 text-sm">Dev Prompts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-green-400 font-bold text-lg">{getAllTechs().length}</p>
                  <p className="text-green-300/70 text-sm">Technologies</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-green-400 font-bold text-lg">
                    {filteredPrompts.reduce((sum, p) => sum + p.likes, 0)}
                  </p>
                  <p className="text-green-300/70 text-sm">Total Likes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prompts Grid */}
        {filteredPrompts.length === 0 ? (
          <Card className="bg-gray-800 border-green-500/30">
            <CardContent className="text-center py-12">
              <Terminal className="h-16 w-16 text-green-400/50 mx-auto mb-4" />
              <h3 className="text-green-400 text-lg font-bold mb-2">// No dev prompts found</h3>
              <p className="text-green-300/70">Try adjusting your search or technology filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
              <div key={prompt._id} className="relative">
                <PromptCard 
                  prompt={prompt} 
                  currentUserId={currentUserId} 
                  onViewDetails={() => setSelectedPrompt(prompt)}
                />
                {/* Tech Tags Overlay */}
                <div className="absolute top-2 right-2 flex flex-wrap gap-1">
                  {Array.isArray(prompt.technologies) &&
                    prompt.technologies.slice(0, 3).map((tech: string) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="bg-green-900/80 text-green-300 text-xs backdrop-blur-sm"
                      >
                        {tech}
                      </Badge>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Prompt Detail Modal */}
        {selectedPrompt && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
            onClick={() => setSelectedPrompt(null)}
          >
            <div
              className="bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full p-6 relative overflow-y-auto max-h-screen"
              style={{ maxHeight: '90vh' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                onClick={() => setSelectedPrompt(null)}
              >
                <X className="h-5 w-5" />
              </button>
              
              {/* Header with Author Info */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-green-100 text-green-600">
                      {selectedPrompt.createdBy?.name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-green-400 mb-1">{selectedPrompt.title}</h2>
                  {selectedPrompt.description && (
                    <div className="mb-1 text-green-200 text-sm">{selectedPrompt.description}</div>
                  )}
                  
                  {/* Rating Display */}
                  {typeof selectedPrompt.rating === 'number' && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-400">
                        {selectedPrompt.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-xs text-green-300 space-x-4">
                    <span>Author: {selectedPrompt.createdBy?.name || "Unknown"}</span>
                    <span>Date: {new Date(selectedPrompt.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Category and Technologies */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {selectedPrompt.category}
                  </Badge>
                </div>
                
                {/* Technologies Section */}
                {Array.isArray(selectedPrompt.technologies) && selectedPrompt.technologies.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-green-400 mb-2">Technologies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrompt.technologies.map((tech: string) => (
                        <Badge key={tech} variant="outline" className="text-xs border-green-400 text-green-400">
                          {getTechIcon(tech)}
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tools Section */}
                {Array.isArray(selectedPrompt.tools) && selectedPrompt.tools.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-green-400 mb-2">Tools:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrompt.tools.map((tool: string) => (
                        <Badge key={tool} variant="outline" className="text-xs border-blue-400 text-blue-400">
                          <Zap className="h-3 w-3 mr-1" />
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Prompt Content */}
              <div className="mb-4 bg-gray-800 rounded p-4 text-green-300 font-mono whitespace-pre-wrap border">
                {selectedPrompt.content}
              </div>

              {/* AI Agents */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-green-400 mb-2">AI Agents:</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {Array.isArray(selectedPrompt.aiAgents) &&
                    selectedPrompt.aiAgents.map((agent: string) => (
                      <Badge key={agent} variant="outline" className="text-xs">
                        {agent}
                      </Badge>
                    ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <Button 
                  onClick={() => navigator.clipboard.writeText(selectedPrompt.content)} 
                  variant="outline" 
                  className="flex-1 bg-transparent"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>

                {/* AI Agent Selection */}
                <div className="flex gap-2">
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger className="flex-1">
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
                  
                  <Button 
                    onClick={() => selectedAgent && handleOpenChat(selectedAgent, selectedPrompt.content)}
                    disabled={!selectedAgent}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
