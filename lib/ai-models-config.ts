export type AIModelConfig = {
  type: "url" | "clipboard" | "clipboard-special" | "link"
  template?: string
  url?: string
  label?: string
  instruction?: string
}

const AI_MODELS_CONFIG: Record<string, AIModelConfig> = {
  chatgpt: {
    type: "url",
    template: "https://chat.openai.com/?q={PROMPT}",
    label: "ChatGPT",
  },
  claude: {
    type: "url",
    template: "https://claude.ai/new?q={PROMPT}",
    label: "Claude",
  },
  perplexity: {
    type: "url",
    template: "https://www.perplexity.ai/?q={PROMPT}",
    label: "Perplexity",
  },
  v0: {
    type: "url",
    template: "https://v0.dev/chat?q={PROMPT}",
    label: "v0",
  },
  lovable: {
    type: "url",
    template: "https://lovable.dev/projects/create?prompt={PROMPT}",
    label: "Lovable",
  },
  bolt: {
    type: "url",
    template: "https://bolt.new/?prompt={PROMPT}",
    label: "Bolt",
  },
  replit: {
    type: "clipboard",
    url: "https://replit.com/",
    label: "Replit",
    instruction: "Prompt copied! Paste it into Replit Agent to get started.",
  },
  gemini: {
    type: "clipboard",
    url: "https://gemini.google.com/",
    label: "Gemini",
    instruction: "Prompt copied! Paste it into Gemini to continue.",
  },
  "github-copilot": {
    type: "clipboard",
    url: "https://github.com/copilot/chat",
    label: "GitHub Copilot",
    instruction: "Prompt copied! Paste it into GitHub Copilot Chat.",
  },
  "stable-diffusion": {
    type: "clipboard",
    url: "https://huggingface.co/spaces/stabilityai/stable-diffusion-3",
    label: "Stable Diffusion",
    instruction: "Prompt copied! Paste it into Stable Diffusion.",
  },
  midjourney: {
    type: "clipboard-special",
    url: "https://discord.com/app",
    label: "Midjourney (Discord)",
    instruction:
      "Prompt copied! Go to Discord, open a Midjourney channel, type /imagine and paste your prompt.",
  },
  runway: {
    type: "clipboard",
    url: "https://runwayml.com/",
    label: "Runway",
    instruction: "Prompt copied! Paste it into Runway to continue.",
  },
  sora: {
    type: "link",
    url: "https://openai.com/sora",
    label: "Sora (Info)",
  },
  veo: {
    type: "link",
    url: "https://deepmind.google/technologies/veo/",
    label: "Veo (Info)",
  },
}

export default AI_MODELS_CONFIG


