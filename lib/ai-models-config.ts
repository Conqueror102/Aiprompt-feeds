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
  gemini: {
    type: "clipboard",
    url: "https://gemini.google.com/",
    label: "Gemini",
  },
  "github-copilot": {
    type: "clipboard",
    url: "https://github.com/copilot/chat",
    label: "GitHub Copilot",
  },
  "stable-diffusion": {
    type: "clipboard",
    url: "https://huggingface.co/spaces/stabilityai/stable-diffusion-3",
    label: "Stable Diffusion",
  },
  midjourney: {
    type: "clipboard-special",
    url: "https://discord.com/app",
    label: "Midjourney (Discord)",
    instruction:
      "Copied! Now go to Discord, open a Midjourney channel, type /imagine and paste your prompt.",
  },
  runway: {
    type: "clipboard",
    url: "https://runwayml.com/",
    label: "Runway",
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


