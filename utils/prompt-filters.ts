// Utility functions for filtering prompts
import { Prompt, PromptFilters } from '@/types'

export function filterPrompts(prompts: Prompt[], filters: PromptFilters): Prompt[] {
  let filtered = [...prompts]

  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase()
    filtered = filtered.filter(
      (prompt) =>
        prompt.title.toLowerCase().includes(searchLower) ||
        prompt.content.toLowerCase().includes(searchLower) ||
        prompt.description?.toLowerCase().includes(searchLower)
    )
  }

  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter((prompt) => prompt.category === filters.category)
  }

  if (filters.agent && filters.agent !== 'all') {
    filtered = filtered.filter((prompt) => prompt.aiAgents.includes(filters.agent))
  }

  return filtered
}

export function sortPromptsByDate(prompts: Prompt[], ascending = false): Prompt[] {
  return [...prompts].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return ascending ? dateA - dateB : dateB - dateA
  })
}

export function sortPromptsByRating(prompts: Prompt[], ascending = false): Prompt[] {
  return [...prompts].sort((a, b) => {
    const ratingA = a.rating || 0
    const ratingB = b.rating || 0
    return ascending ? ratingA - ratingB : ratingB - ratingA
  })
}

export function sortPromptsByLikes(prompts: Prompt[], ascending = false): Prompt[] {
  return [...prompts].sort((a, b) => {
    return ascending ? a.likes - b.likes : b.likes - a.likes
  })
}
