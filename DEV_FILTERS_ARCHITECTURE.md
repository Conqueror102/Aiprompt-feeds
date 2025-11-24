# Dev Filters Architecture

## Component Hierarchy

```
HomePage (app/page.tsx)
│
├── State Management
│   ├── selectedTechnologies: string[]
│   ├── selectedTools: string[]
│   └── Auto-clear on category change
│
├── PromptFilters Component
│   ├── Search Input
│   ├── Category Dropdown
│   ├── AI Agent Dropdown
│   │
│   └── DevFilters Component (conditional: only when category === "Dev")
│       ├── Technologies Dropdown
│       │   ├── Fetches from /api/prompts/filters/dev-metadata
│       │   ├── Multi-select checkboxes
│       │   └── Badge counter
│       │
│       ├── Tools Dropdown
│       │   ├── Fetches from /api/prompts/filters/dev-metadata
│       │   ├── Multi-select checkboxes
│       │   └── Badge counter
│       │
│       ├── Active Filter Badges
│       │   ├── Technology badges (with X button)
│       │   └── Tool badges (with X button)
│       │
│       └── Clear All Button
│
└── PromptGrid (filtered results)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User selects "Dev" category                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. DevFilters component renders                             │
│    - Calls /api/prompts/filters/dev-metadata                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. API aggregates unique technologies & tools               │
│    - Queries all Dev prompts                                │
│    - Extracts unique values from technologies[] & tools[]   │
│    - Returns sorted arrays                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. DevFilters displays dropdowns with options               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. User selects technologies/tools                          │
│    - State updates in HomePage                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Filter logic applies                                     │
│    - Checks if prompt.technologies includes any selected    │
│    - Checks if prompt.tools includes any selected           │
│    - Uses OR logic (union)                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. PromptGrid re-renders with filtered results              │
└─────────────────────────────────────────────────────────────┘
```

## Filter Logic Pseudocode

```javascript
filteredPrompts = prompts.filter(prompt => {
  // Base filters (category, agent, search)
  if (!matchesBaseFilters(prompt)) return false
  
  // Dev-specific filters (only when Dev category selected)
  if (selectedCategory === "Dev") {
    // Technology filter
    if (selectedTechnologies.length > 0) {
      const hasMatchingTech = selectedTechnologies.some(tech =>
        prompt.technologies?.includes(tech)
      )
      if (!hasMatchingTech) return false
    }
    
    // Tool filter
    if (selectedTools.length > 0) {
      const hasMatchingTool = selectedTools.some(tool =>
        prompt.tools?.includes(tool)
      )
      if (!hasMatchingTool) return false
    }
  }
  
  return true
})
```

## API Endpoint Structure

```typescript
// GET /api/prompts/filters/dev-metadata

Response:
{
  technologies: string[]  // ["React", "Node.js", "TypeScript", ...]
  tools: string[]         // ["VS Code", "Docker", "Git", ...]
}

// Example:
{
  "technologies": [
    "Next.js",
    "Node.js", 
    "Python",
    "React",
    "TypeScript"
  ],
  "tools": [
    "Docker",
    "Git",
    "MongoDB",
    "VS Code",
    "Webpack"
  ]
}
```

## UI States

### 1. Initial State (No Dev category selected)
```
┌─────────────────────────────────────────┐
│ Search: [________________]              │
│ Category: [All Categories ▼]            │
│ AI Agent: [All AI Agents ▼]             │
└─────────────────────────────────────────┘
```

### 2. Dev Category Selected (No filters active)
```
┌─────────────────────────────────────────┐
│ Search: [________________]              │
│ Category: [Dev ▼]                       │
│ AI Agent: [All AI Agents ▼]             │
│ ─────────────────────────────────────── │
│ Dev Filters:                            │
│ [🔧 Technologies ▼] [🛠️ Tools ▼]        │
└─────────────────────────────────────────┘
```

### 3. Dev Filters Active
```
┌─────────────────────────────────────────┐
│ Search: [________________]              │
│ Category: [Dev ▼]                       │
│ AI Agent: [All AI Agents ▼]             │
│ ─────────────────────────────────────── │
│ Dev Filters:                            │
│ [🔧 Technologies (2) ▼] [🛠️ Tools (1) ▼] [Clear all] │
│                                         │
│ [🔧 React ✕] [🔧 TypeScript ✕] [🛠️ Docker ✕] │
└─────────────────────────────────────────┘
```

## Performance Considerations

1. **API Caching**: Dev metadata is fetched once per session
2. **Memoization**: Filter dropdowns only re-render when data changes
3. **Lazy Loading**: Dev filters only load when Dev category is selected
4. **Auto-cleanup**: Filters clear when switching away from Dev category
5. **Client-side filtering**: Fast filtering without additional API calls

## Extensibility

This architecture can easily be extended to other categories:

```typescript
// Future: Add similar filters for other categories
{selectedCategory === "Marketing" && <MarketingFilters />}
{selectedCategory === "Creative" && <CreativeFilters />}
{selectedCategory === "Data" && <DataFilters />}
```
