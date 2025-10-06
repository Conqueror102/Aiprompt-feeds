# AI Platforms Integration Guide

This document describes how the AI Prompt Hub integrates with various AI platforms.

## Supported AI Platforms

### 🚀 URL Injection Support (Direct Prompt Loading)

These platforms support URL parameters, allowing prompts to be automatically loaded when the user clicks "Run with AI":

#### **ChatGPT**
- **URL Template**: `https://chat.openai.com/?q={PROMPT}`
- **Behavior**: Opens ChatGPT with prompt pre-filled
- **User Experience**: Seamless - prompt appears in input field

#### **Claude**
- **URL Template**: `https://claude.ai/new?q={PROMPT}`
- **Behavior**: Opens Claude with prompt pre-filled
- **User Experience**: Seamless - prompt appears in input field

#### **Perplexity**
- **URL Template**: `https://www.perplexity.ai/?q={PROMPT}`
- **Behavior**: Opens Perplexity with prompt pre-filled
- **User Experience**: Seamless - prompt appears in input field

#### **v0** ⚡ (NEW)
- **URL Template**: `https://v0.dev/chat?q={PROMPT}`
- **Behavior**: Opens v0.dev with prompt pre-filled
- **User Experience**: Seamless - prompt appears in chat
- **Use Case**: UI/UX generation, React components

#### **Lovable** 💖 (NEW)
- **URL Template**: `https://lovable.dev/projects/create?prompt={PROMPT}`
- **Behavior**: Opens Lovable with prompt pre-filled
- **User Experience**: Seamless - starts new project with prompt
- **Use Case**: Full-stack app generation

#### **Bolt** ⚡ (NEW)
- **URL Template**: `https://bolt.new/?prompt={PROMPT}`
- **Behavior**: Opens Bolt with prompt pre-filled
- **User Experience**: Seamless - prompt appears in editor
- **Use Case**: Quick web app prototyping

---

### 📋 Clipboard-Only Support

These platforms do NOT support URL injection. The prompt is copied to clipboard and the platform opens:

#### **Replit** 🔧 (NEW)
- **URL**: `https://replit.com/`
- **Behavior**: 
  1. Copies prompt to clipboard
  2. Opens Replit
  3. Shows toast: "Prompt copied! Paste it into Replit Agent to get started."
- **User Action Required**: Paste the prompt manually

#### **Gemini** ✨
- **URL**: `https://gemini.google.com/`
- **Behavior**: 
  1. Copies prompt to clipboard
  2. Opens Gemini
  3. Shows toast: "Prompt copied! Paste it into Gemini to continue."
- **User Action Required**: Paste the prompt manually

#### **GitHub Copilot** 👨‍💻
- **URL**: `https://github.com/copilot/chat`
- **Behavior**: 
  1. Copies prompt to clipboard
  2. Opens GitHub Copilot
  3. Shows toast: "Prompt copied! Paste it into GitHub Copilot Chat."
- **User Action Required**: Paste the prompt manually

#### **Stable Diffusion** 🎨
- **URL**: `https://huggingface.co/spaces/stabilityai/stable-diffusion-3`
- **Behavior**: 
  1. Copies prompt to clipboard
  2. Opens Stable Diffusion
  3. Shows toast: "Prompt copied! Paste it into Stable Diffusion."
- **User Action Required**: Paste the prompt manually

#### **Midjourney** 🌟 (Special)
- **URL**: `https://discord.com/app`
- **Behavior**: 
  1. Copies prompt to clipboard
  2. Opens Discord
  3. Shows toast: "Prompt copied! Go to Discord, open a Midjourney channel, type /imagine and paste your prompt."
- **User Action Required**: Navigate to Midjourney channel, use `/imagine` command, then paste

#### **Runway** 🎭
- **URL**: `https://runwayml.com/`
- **Behavior**: 
  1. Copies prompt to clipboard
  2. Opens Runway
  3. Shows toast: "Prompt copied! Paste it into Runway to continue."
- **User Action Required**: Paste the prompt manually

---

### 🔗 Information Links Only

These platforms are informational links (no direct integration):

#### **Sora** 🎬
- **URL**: `https://openai.com/sora`
- **Behavior**: Opens Sora information page

#### **Veo** 
- **URL**: `https://deepmind.google/technologies/veo/`
- **Behavior**: Opens Veo information page

---

## User Experience Flow

### For URL Injection Platforms (ChatGPT, Claude, v0, Lovable, Bolt, Perplexity)

1. User clicks "Run with AI" on a prompt
2. Selects an AI platform from dropdown
3. Clicks "Run"
4. Toast notification: "Opening [Platform]..."
5. New tab opens with prompt pre-filled
6. User can immediately start using the prompt

### For Clipboard Platforms (Replit, Gemini, GitHub Copilot, etc.)

1. User clicks "Run with AI" on a prompt
2. Selects an AI platform from dropdown
3. Clicks "Run"
4. Toast notification: "Prompt Copied! [Platform-specific instruction]"
5. New tab opens to the platform
6. User manually pastes the prompt (Ctrl+V / Cmd+V)

---

## Technical Implementation

### Configuration File
Location: `lib/ai-models-config.ts`

```typescript
export type AIModelConfig = {
  type: "url" | "clipboard" | "clipboard-special" | "link"
  template?: string  // For URL injection
  url?: string       // For clipboard/link types
  label?: string
  instruction?: string  // Custom message for clipboard types
}
```

### Launch Function
Location: `lib/launch-agent.ts`

Returns:
```typescript
{
  success: boolean
  message?: string
  needsClipboard?: boolean  // Indicates if user needs to paste
}
```

### Toast Notifications
- **Success (URL)**: "Opening [Platform]..."
- **Success (Clipboard)**: "Prompt Copied! [Custom instruction]"
- **Error**: "Failed to copy prompt" or "Failed to launch AI agent"

---

## Adding New AI Platforms

To add a new AI platform:

1. **Update `lib/constants.ts`**: Add to `AI_AGENTS` array
2. **Update `lib/ai-models-config.ts`**: Add configuration
3. **Update `lib/launch-agent.ts`**: Add to `mapAgentNameToKey()`
4. **Update `components/AIAgentCollections.tsx`**: Add logo emoji
5. **Update `components/AIAgentChat.tsx`**: Add theme colors (optional)

### Example: Adding a new platform with URL support

```typescript
// lib/ai-models-config.ts
"newplatform": {
  type: "url",
  template: "https://newplatform.com/chat?prompt={PROMPT}",
  label: "New Platform",
}
```

### Example: Adding a new platform with clipboard only

```typescript
// lib/ai-models-config.ts
"newplatform": {
  type: "clipboard",
  url: "https://newplatform.com/",
  label: "New Platform",
  instruction: "Prompt copied! Paste it into New Platform to get started.",
}
```

---

## Testing

After adding new platforms, test:

1. ✅ Platform appears in dropdown menus
2. ✅ "Run with AI" opens correct URL
3. ✅ Toast notifications display correctly
4. ✅ Prompt is copied to clipboard (for clipboard types)
5. ✅ URL encoding works for special characters
6. ✅ Platform logo displays in collections view

---

## Notes

- All URL templates use `{PROMPT}` as placeholder
- Prompts are URL-encoded automatically
- Clipboard operations may fail in non-HTTPS contexts
- Some platforms may change their URL structure - monitor and update accordingly
