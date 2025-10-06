import AI_MODELS_CONFIG from "@/lib/ai-models-config"

export function mapAgentNameToKey(name: string) {
  const n = name.toLowerCase()
  if (n === "chatgpt") return "chatgpt"
  if (n === "claude") return "claude"
  if (n === "perplexity") return "perplexity"
  if (n === "v0") return "v0"
  if (n === "lovable") return "lovable"
  if (n === "bolt") return "bolt"
  if (n === "replit") return "replit"
  if (n === "gemini") return "gemini"
  if (n === "github copilot" || n === "github-copilot" || n === "copilot") return "github-copilot"
  if (n === "stable diffusion" || n === "stable-diffusion") return "stable-diffusion"
  if (n === "midjourney") return "midjourney"
  if (n === "runway") return "runway"
  if (n === "sora") return "sora"
  if (n === "veo") return "veo"
  return ""
}

export async function launchExternalAgent(agentName: string, prompt: string): Promise<{
  success: boolean
  message?: string
  needsClipboard?: boolean
}> {
  const key = mapAgentNameToKey(agentName)
  const cfg = (key && (AI_MODELS_CONFIG as any)[key]) as any

  const open = (u: string) => window.open(u, "_blank", "noopener,noreferrer")

  if (!cfg) {
    try { 
      await navigator.clipboard.writeText(prompt)
      return { success: true, message: "Prompt copied to clipboard!", needsClipboard: true }
    } catch {
      return { success: false, message: "Failed to copy prompt" }
    }
  }

  if (cfg.type === "url" && cfg.template) {
    const url = cfg.template.replace("{PROMPT}", encodeURIComponent(prompt))
    open(url)
    return { success: true, message: `Opening ${cfg.label}...` }
  }

  if ((cfg.type === "clipboard" || cfg.type === "clipboard-special") && cfg.url) {
    try { 
      await navigator.clipboard.writeText(prompt)
      open(cfg.url)
      return { 
        success: true, 
        message: cfg.instruction || `Prompt copied! Opening ${cfg.label}...`,
        needsClipboard: true 
      }
    } catch {
      return { success: false, message: "Failed to copy prompt" }
    }
  }

  if (cfg.type === "link" && cfg.url) {
    open(cfg.url)
    return { success: true, message: `Opening ${cfg.label}...` }
  }

  try { 
    await navigator.clipboard.writeText(prompt)
    return { success: true, message: "Prompt copied to clipboard!", needsClipboard: true }
  } catch {
    return { success: false, message: "Failed to copy prompt" }
  }
}


