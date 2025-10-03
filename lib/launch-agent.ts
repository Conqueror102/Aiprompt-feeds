import AI_MODELS_CONFIG from "@/lib/ai-models-config"

export function mapAgentNameToKey(name: string) {
  const n = name.toLowerCase()
  if (n === "chatgpt") return "chatgpt"
  if (n === "claude") return "claude"
  if (n === "perplexity") return "perplexity"
  if (n === "gemini") return "gemini"
  if (n === "github copilot" || n === "github-copilot" || n === "copilot") return "github-copilot"
  if (n === "stable diffusion" || n === "stable-diffusion") return "stable-diffusion"
  if (n === "midjourney") return "midjourney"
  if (n === "runway") return "runway"
  if (n === "sora") return "sora"
  if (n === "veo") return "veo"
  return ""
}

export async function launchExternalAgent(agentName: string, prompt: string) {
  const key = mapAgentNameToKey(agentName)
  const cfg = (key && (AI_MODELS_CONFIG as any)[key]) as any

  const open = (u: string) => window.open(u, "_blank", "noopener,noreferrer")

  if (!cfg) {
    try { await navigator.clipboard.writeText(prompt) } catch {}
    return
  }

  if (cfg.type === "url" && cfg.template) {
    const url = cfg.template.replace("{PROMPT}", encodeURIComponent(prompt))
    open(url)
    return
  }

  if ((cfg.type === "clipboard" || cfg.type === "clipboard-special") && cfg.url) {
    try { await navigator.clipboard.writeText(prompt) } catch {}
    open(cfg.url)
    return
  }

  if (cfg.type === "link" && cfg.url) {
    open(cfg.url)
    return
  }

  try { await navigator.clipboard.writeText(prompt) } catch {}
}


