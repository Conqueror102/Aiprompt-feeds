# Modular Architecture Documentation

## Overview
This codebase has been refactored to follow a modular architecture pattern with clear separation of concerns.

## Directory Structure

```
├── types/                    # TypeScript type definitions
│   └── index.ts             # Shared types (User, Prompt, etc.)
│
├── services/                # Business logic and API communication
│   ├── api-client.ts       # Centralized HTTP client
│   ├── auth-service.ts     # Authentication operations
│   ├── prompt-service.ts   # Prompt CRUD operations
│   └── cache-service.ts    # Local storage caching
│
├── hooks/                   # Custom React hooks
│   ├── use-auth.ts         # Authentication state management
│   ├── use-prompts.ts      # Prompts data fetching
│   ├── use-prompt-filters.ts    # Filtering logic
│   └── use-prompt-interactions.ts # Like/save operations
│
├── utils/                   # Utility functions
│   ├── prompt-filters.ts   # Filter/sort utilities
│   └── clipboard.ts        # Clipboard operations
│
├── components/
│   ├── prompts/            # Modular prompt components
│   │   ├── PromptGrid.tsx
│   │   ├── PromptFilters.tsx
│   │   ├── PromptHeader.tsx
│   │   ├── PromptCardHeader.tsx
│   │   ├── PromptCardActions.tsx
│   │   └── RunPromptDialog.tsx
│   └── PromptCard.tsx      # Main card component (refactored)
│
└── app/
    └── page.tsx            # Home page (simplified)
```

## Key Improvements

### 1. Service Layer
- **api-client.ts**: Single source for all HTTP requests
- **Centralized error handling**: Consistent error management
- **Token management**: Automatic auth header injection

### 2. Custom Hooks
- **Separation of concerns**: Each hook handles one responsibility
- **Reusability**: Hooks can be used across multiple components
- **State management**: Encapsulated state logic

### 3. Component Modularity
- **Small, focused components**: Each component has a single purpose
- **Prop-based composition**: Easy to test and maintain
- **Reduced complexity**: Main components are now < 250 lines

### 4. Type Safety
- **Centralized types**: Single source of truth for data structures
- **Better IntelliSense**: Improved developer experience
- **Compile-time checks**: Catch errors early

## Usage Examples

### Using Services
```typescript
import { promptService } from '@/services/prompt-service'

// Fetch all prompts
const prompts = await promptService.getAll()

// Like a prompt
await promptService.like(promptId)
```

### Using Hooks
```typescript
import { usePrompts } from '@/hooks/use-prompts'
import { usePromptFilters } from '@/hooks/use-prompt-filters'

function MyComponent() {
  const { prompts, loading } = usePrompts()
  const { filteredPrompts, setSearchTerm } = usePromptFilters(prompts)
  
  return <PromptGrid prompts={filteredPrompts} loading={loading} />
}
```

### Using Utilities
```typescript
import { copyToClipboard } from '@/utils/clipboard'
import { filterPrompts } from '@/utils/prompt-filters'

const success = await copyToClipboard(text)
const filtered = filterPrompts(prompts, { category: 'Development' })
```

## Benefits

1. **Maintainability**: Easy to locate and update code
2. **Testability**: Small, focused units are easier to test
3. **Scalability**: New features can be added without affecting existing code
4. **Reusability**: Components and hooks can be shared across pages
5. **Developer Experience**: Clear structure makes onboarding easier

## Migration Notes

- Old components still work but should gradually migrate to new structure
- API calls should use services instead of direct fetch
- Large components should be split into smaller sub-components
- Business logic should move to custom hooks
