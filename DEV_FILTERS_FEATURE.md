# Dev Category Filters Feature

## Overview
This feature adds advanced filtering capabilities for Dev category prompts, allowing users to filter by technologies and tools used in development prompts.

## How It Works

### 1. User Flow
1. User navigates to the home page
2. User selects "Dev" from the Category dropdown
3. Additional filter options appear below the main filters:
   - **Technologies Filter**: Multi-select dropdown (e.g., React, Node.js, Python, TypeScript)
   - **Tools Filter**: Multi-select dropdown (e.g., VS Code, Docker, Git, Webpack)
4. User selects one or more technologies/tools
5. Prompts are filtered in real-time to show only those matching the selected criteria
6. Selected filters appear as removable badges below the dropdowns
7. User can click "Clear all" to reset dev-specific filters

### 2. Filter Logic
- **Union (OR) Logic**: Prompts matching ANY selected technology OR tool are shown
- Example: If user selects "React" and "Docker", prompts with React OR Docker (or both) will appear
- Filters only apply when Dev category is selected

### 3. Data Source
- Technologies and tools are extracted from the `technologies` and `tools` fields in Dev prompts
- Data is aggregated via API endpoint: `/api/prompts/filters/dev-metadata`
- The same data displayed on prompt cards (wrench icon) is used for filtering

## Implementation Details

### New Files Created
1. **`app/api/prompts/filters/dev-metadata/route.ts`**
   - API endpoint that aggregates all unique technologies and tools from Dev category prompts
   - Returns sorted arrays of unique values
   - Caches data to improve performance

2. **`components/prompts/DevFilters.tsx`**
   - Reusable component for Dev-specific filters
   - Features:
     - Two dropdown menus (Technologies and Tools)
     - Badge counters showing number of active filters
     - Active filter badges with remove buttons
     - Clear all button
     - Loading state

### Modified Files
1. **`components/prompts/PromptFilters.tsx`**
   - Added conditional rendering of DevFilters component
   - Shows dev filters only when "Dev" category is selected
   - Passes filter state and handlers to DevFilters

2. **`app/page.tsx`**
   - Added state for selected technologies and tools
   - Enhanced filter logic to include technology/tool matching
   - Passes new props to PromptFilters component

## UI Components Used
- `DropdownMenu` from shadcn/ui for multi-select
- `Badge` for displaying active filters
- `Button` for filter triggers and clear action
- Icons: `Code2` (technologies), `Wrench` (tools), `X` (remove)

## Future Enhancements
- Add caching/memoization for dev metadata API
- Add filter presets (e.g., "Full Stack", "Frontend", "DevOps")
- Add "AND" vs "OR" logic toggle
- Add filter count to category dropdown
- Persist filters in URL params for shareability
- Add autocomplete/search within filter dropdowns for large lists

## Testing
To test the feature:
1. Create some Dev prompts with technologies and tools
2. Navigate to home page
3. Select "Dev" category
4. Verify dev filters appear
5. Select technologies/tools and verify filtering works
6. Test badge removal and clear all functionality
