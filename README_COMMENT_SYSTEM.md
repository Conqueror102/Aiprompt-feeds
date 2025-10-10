# 💬 Comment System - Quick Start Guide

A comprehensive real-time commenting system for the AI Prompt Hub with threaded discussions, badge integration, and modern UX.

## 🚀 Quick Integration

### 1. Add to Prompt Page
```tsx
import { CommentSection } from '@/components/comments'

function PromptDetailPage({ prompt }) {
  return (
    <div>
      {/* Your existing prompt content */}
      
      <CommentSection 
        promptId={prompt._id}
        initialCommentCount={prompt.commentCount}
      />
    </div>
  )
}
```

### 2. Database Setup
Run this migration to add comment support to existing prompts:

```javascript
// MongoDB migration
db.prompts.updateMany(
  {},
  { $set: { commentCount: 0 } }
)
```

### 3. Update Prompt Model
The Prompt model has been updated to include `commentCount` field for performance.

## ✨ Features

### Core Functionality
- **Threaded Comments** - Up to 3-4 levels deep
- **Real-time Updates** - Comments appear instantly
- **Like System** - Like/unlike comments with optimistic updates
- **Edit & Delete** - Authors can modify their comments
- **Responsive Design** - Works on all devices

### Badge Integration
New comment-related badges automatically awarded:
- **First Comment** (💬) - Leave your first comment
- **Conversationalist** (🗣️) - 10, 50, 100, 500 comments
- **Helpful Commenter** (👍) - Comments with high likes
- **Discussion Starter** (🔥) - Comments that get replies
- **Community Helper** (🤝) - Help many different users

## 🛠️ API Endpoints

### Comments CRUD
```typescript
// Get comments for a prompt
GET /api/comments?promptId=123&sortBy=newest&limit=20&offset=0

// Create new comment
POST /api/comments
{
  "content": "Great prompt!",
  "promptId": "123",
  "parentId": "456" // Optional for replies
}

// Update comment (author only)
PUT /api/comments/[id]
{ "content": "Updated comment text" }

// Delete comment (author only)
DELETE /api/comments/[id]

// Like/unlike comment
POST /api/comments/[id]/like

// Get replies for comment
GET /api/comments/[id]/replies?limit=10&offset=0
```

## 🎨 Components

### CommentSection (Main Container)
```tsx
<CommentSection 
  promptId="123"
  initialCommentCount={5}
  className="mt-6"
/>
```

### CommentForm (Create/Reply)
```tsx
<CommentForm
  promptId="123"
  parentId="456" // For replies
  onCommentCreated={handleNewComment}
  placeholder="Share your thoughts..."
  autoFocus={true}
/>
```

### CommentThread (Individual Comment)
```tsx
<CommentThread
  comment={comment}
  promptId="123"
  onUpdate={handleUpdate}
  onDelete={handleDelete}
  onReplyAdded={handleReplyAdded}
  currentUserId={user._id}
  depth={0}
  maxDepth={3}
/>
```

## 🪝 React Hooks

### useComments (Main Hook)
```tsx
const {
  comments,           // Array of comments
  loading,           // Loading state
  error,             // Error message
  total,             // Total comment count
  hasMore,           // More comments available
  createComment,     // Create new comment
  updateComment,     // Update existing comment
  deleteComment,     // Delete comment
  likeComment,       // Toggle like
  loadMore,          // Load more comments
  refresh            // Refresh all comments
} = useComments({ 
  promptId: "123",
  autoRefresh: true,
  refreshInterval: 30000
})
```

### useUserCommentActivity
```tsx
const {
  activity,          // User comment statistics
  loading,
  error,
  refresh
} = useUserCommentActivity(userId)
```

## 🏆 Badge Integration

### Automatic Badge Triggers
Comments automatically trigger badge checks:

```tsx
import { triggerBadgesAfterCommentCreate } from '@/lib/badges/comment-badge-triggers'

// After creating a comment
const newComment = await createComment("Great prompt!")
if (newComment) {
  const newBadges = await triggerBadgesAfterCommentCreate(userId, newComment)
  // Handle new badges (show notifications, etc.)
}
```

### Comment Statistics Tracked
- `totalComments` - Total comments made
- `totalCommentLikes` - Total likes received on comments
- `totalReplies` - Total replies made to other comments
- `commentsWithReplies` - Comments that received replies
- `uniqueUsersHelped` - Number of different users helped

## 📱 Real-time Features

### Auto-refresh Comments
```tsx
const { comments } = useComments({ 
  promptId: "123",
  autoRefresh: true,        // Enable auto-refresh
  refreshInterval: 30000    // Refresh every 30 seconds
})
```

### Optimistic Updates
All actions (create, like, delete) use optimistic updates for instant feedback:
- Comments appear immediately when posted
- Likes update instantly with rollback on error
- Edits show immediately with server sync

## 🎯 Usage Examples

### Basic Comment Section
```tsx
function PromptPage({ prompt }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Prompt content */}
      <div className="mb-8">
        <h1>{prompt.title}</h1>
        <p>{prompt.content}</p>
      </div>
      
      {/* Comments */}
      <CommentSection 
        promptId={prompt._id}
        initialCommentCount={prompt.commentCount}
      />
    </div>
  )
}
```

### Custom Comment Implementation
```tsx
function CustomComments({ promptId }) {
  const { 
    comments, 
    loading, 
    createComment, 
    likeComment 
  } = useComments({ promptId })
  
  const handleSubmit = async (content: string) => {
    const newComment = await createComment(content)
    if (newComment) {
      toast.success('Comment posted!')
    }
  }
  
  if (loading) return <div>Loading comments...</div>
  
  return (
    <div className="space-y-4">
      <CommentForm 
        promptId={promptId}
        onCommentCreated={handleSubmit}
      />
      
      {comments.map(comment => (
        <CommentThread
          key={comment._id}
          comment={comment}
          promptId={promptId}
          onLike={() => likeComment(comment._id)}
        />
      ))}
    </div>
  )
}
```

### Comment Activity Display
```tsx
function UserProfile({ userId }) {
  const { activity } = useUserCommentActivity(userId)
  
  return (
    <div>
      <h3>Comment Activity</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-2xl font-bold">{activity?.totalComments}</div>
          <div className="text-sm text-gray-600">Comments</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{activity?.totalLikes}</div>
          <div className="text-sm text-gray-600">Likes Received</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{activity?.topComments.length}</div>
          <div className="text-sm text-gray-600">Top Comments</div>
        </div>
      </div>
    </div>
  )
}
```

## 🔧 Configuration

### Environment Variables
```env
# Optional: Configure comment limits
MAX_COMMENT_LENGTH=2000
MAX_COMMENT_DEPTH=3
COMMENTS_PER_PAGE=20

# Feature flags
ENABLE_COMMENT_LIKES=true
ENABLE_COMMENT_BADGES=true
ENABLE_REAL_TIME_COMMENTS=true
```

### Customization Options
```tsx
// Customize comment appearance
<CommentSection 
  promptId="123"
  className="custom-comments"
  // Custom sort options
  defaultSort="mostLiked"
  // Custom pagination
  pageSize={10}
  // Custom depth limit
  maxDepth={2}
/>
```

## 🚨 Error Handling

### Common Error Scenarios
```tsx
const { error, createComment } = useComments({ promptId })

const handleSubmit = async (content: string) => {
  try {
    await createComment(content)
  } catch (err) {
    if (err.message.includes('Authentication')) {
      // Redirect to login
    } else if (err.message.includes('too long')) {
      // Show character limit error
    } else {
      // Generic error handling
      toast.error('Failed to post comment')
    }
  }
}

// Display errors in UI
{error && (
  <div className="bg-red-50 border border-red-200 rounded p-4">
    <p className="text-red-600">{error}</p>
    <Button onClick={refresh}>Try Again</Button>
  </div>
)}
```

## 📊 Performance Tips

### Optimization Strategies
1. **Lazy Loading** - Comments load on scroll
2. **Pagination** - Limit initial load size
3. **Caching** - Cache frequently accessed comments
4. **Debouncing** - Debounce like button clicks
5. **Memoization** - Prevent unnecessary re-renders

### Database Performance
- Compound indexes for efficient queries
- Aggregation pipelines for nested loading
- Comment counters for quick stats
- Soft deletes to preserve threads

## 🔒 Security Features

- **Authentication Required** - Only logged-in users can comment
- **Author Verification** - Only authors can edit/delete
- **Input Validation** - Sanitize and validate content
- **Rate Limiting** - Prevent comment spam
- **Soft Deletes** - Maintain thread integrity

## 📈 Analytics

Track comment engagement:
- Comment creation rates
- Reply engagement rates
- Like-to-comment ratios
- User retention after commenting
- Most active discussion threads

---

**Ready to enhance your AI Prompt Hub with engaging discussions! 💬🚀**

For detailed documentation, see `/docs/COMMENT_SYSTEM.md`
