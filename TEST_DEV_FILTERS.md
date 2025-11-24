# Testing Dev Filters

## Steps to Test

### 1. Restart Your Dev Server
```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
npm run dev
# or
pnpm dev
```

### 2. Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Navigate to your home page
4. Select "Dev" from the Category dropdown
5. Look for these console logs:
   ```
   PromptFilters - selectedCategory: Dev
   PromptFilters - isDevCategory: true
   PromptFilters - has handlers: true true
   ```

### 3. What You Should See

When you select "Dev" category, you should see:
- A horizontal line separator
- Text saying "Dev Filters:"
- Two dropdown buttons:
  - "🔧 Technologies ▼"
  - "🛠️ Tools ▼"

### 4. If You Don't See the Filters

**Possible Issue #1: No Dev Prompts in Database**
- The filters will appear, but dropdowns will be empty
- You need to create at least one Dev prompt with technologies and tools

**Possible Issue #2: Dev Server Not Restarted**
- The new components won't load until you restart
- Stop the server (Ctrl+C) and run `npm run dev` again

**Possible Issue #3: You See Red Debug Text**
- If you see "Debug: Dev category selected but handlers missing"
- This means the handlers aren't being passed correctly
- Check the browser console for errors

### 5. Create a Test Dev Prompt

If you don't have any Dev prompts with technologies/tools:

1. Click "Add Prompt"
2. Fill in:
   - Title: "Test Dev Prompt"
   - Category: "Dev"
   - AI Agent: Any agent
   - Content: "Test prompt"
   - **Technologies**: Add some (e.g., "React", "Node.js", "TypeScript")
   - **Tools**: Add some (e.g., "VS Code", "Docker", "Git")
3. Save the prompt
4. Go back to home page
5. Select "Dev" category
6. The filters should now show your technologies and tools

### 6. Test the Filtering

1. Select "Dev" category
2. Click on "Technologies" dropdown
3. Select one or more technologies (e.g., "React")
4. Prompts should filter to show only those with React
5. Click on "Tools" dropdown
6. Select one or more tools (e.g., "Docker")
7. Prompts should filter to show those with React OR Docker

### 7. Common Issues

**Issue**: Filters don't appear
- **Solution**: Restart dev server

**Issue**: Dropdowns are empty
- **Solution**: Create Dev prompts with technologies and tools

**Issue**: Filtering doesn't work
- **Solution**: Check browser console for errors

**Issue**: Page crashes
- **Solution**: Check if DevFilters component imported correctly

### 8. Remove Debug Logs (After Testing)

Once everything works, remove the debug console.logs from:
- `components/prompts/PromptFilters.tsx` (lines with console.log)
- Remove the red debug text conditional
