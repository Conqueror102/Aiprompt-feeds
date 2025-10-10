# 💬 Comment System Documentation

## Overview

The AI Prompt Hub comment system is a comprehensive real-time commenting platform that allows users to engage in threaded discussions on prompts. The system supports nested replies up to 3-4 levels deep, real-time updates, and integrates seamlessly with the existing badge system.

## Features

### Core Functionality
- **Threaded Comments** - Nested replies up to 3-4 levels deep
- **Real-time Updates** - Comments appear instantly without page refresh
- **Plain Text Support** - Clean, readable text-based comments
- **Like System** - Users can like/unlike comments
- **Edit & Delete** - Authors can modify or remove their comments
- **Soft Delete** - Deleted comments are preserved for thread integrity

### User Experience
- **Responsive Design** - Works seamlessly on mobile and desktop
- **Optimistic Updates** - Immediate UI feedback for better UX
- **Pagination** - Efficient loading of large comment threads
- **Sort Options** - Sort by newest, oldest, or most liked
- **Character Limits** - 2000 character limit for comments

### Integration Features
- **Badge System** - Earn badges for commenting activity
- **User Profiles** - Comment activity tracking
- **Notifications** - In-app notifications for replies and likes
- **Authentication** - Secure comment creation and management

## Architecture

### Database Schema

#### Comment Model
```typescript
{
  content: String,           // Comment text (max 2000 chars)
  promptId: ObjectId,        // Reference to prompt
  authorId: ObjectId,        // Reference to user
  parentId: ObjectId,        // Reference to parent comment (for replies)
  depth: Number,             // Nesting level (0-3)
  likes: Number,             // Like count
  likedBy: [ObjectId],       // Users who liked this comment
  isEdited: Boolean,         // Whether comment was edited
  editedAt: Date,            // When comment was last edited
  isDeleted: Boolean,        // Soft delete flag
  deletedAt: Date,           // When comment was deleted
  createdAt: Date,           // Creation timestamp
  updatedAt: Date            // Last update timestamp
}
```

#### Indexes
- `{ promptId: 1, parentId: 1, createdAt: -1 }` - Get comments for prompt
- `{ promptId: 1, isDeleted: 1, createdAt: -1 }` - Get non-deleted comments
- `{ authorId: 1, createdAt: -1 }` - Get user's comments
- `{ parentId: 1, createdAt: 1 }` - Get replies to a comment
- `{ likes: -1, createdAt: -1 }` - Get most liked comments

### API Endpoints

#### Comments
- `GET /api/comments` - Get comments with filters
- `POST /api/comments` - Create new comment or reply
- `GET /api/comments/[id]` - Get specific comment
- `PUT /api/comments/[id]` - Update comment (author only)
- `DELETE /api/comments/[id]` - Delete comment (author only)

#### Comment Actions
- `POST /api/comments/[id]/like` - Toggle like on comment
- `GET /api/comments/[id]/replies` - Get replies for comment

#### Query Parameters
- `promptId` - Filter by prompt ID (required)
- `sortBy` - Sort order: `newest`, `oldest`, `mostLiked`
- `limit` - Number of comments per page (default: 20, max: 50)
- `offset` - Pagination offset

### React Components

#### CommentSection
Main container component that handles:
- Loading and displaying comments
- Pagination and sorting
- Real-time updates
- Error handling

```tsx
<CommentSection 
  promptId="123"
  initialCommentCount={5}
/>
```

#### CommentThread
Displays individual comments with nested replies:
- Threaded reply structure
- Collapsible reply sections
- Edit/delete functionality
- Like interactions

#### CommentForm
Form for creating comments and replies:
- Character count validation
- Keyboard shortcuts (Ctrl+Enter to submit)
- Auto-focus for reply forms
- Real-time validation

#### CommentActions
Action buttons for comments:
- Like/unlike with optimistic updates
- Reply button (respects depth limits)
- Edit/delete (author only)
- Dropdown menu for additional actions

### Custom Hooks

#### useComments
Main hook for comment management:
```typescript
const {
  comments,
  loading,
  error,
  total,
  hasMore,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  loadMore,
  refresh
} = useComments({ promptId: "123" })
```

#### useUserCommentActivity
Hook for user comment statistics:
```typescript
const {
  activity,
  loading,
  error,
  refresh
} = useUserCommentActivity(userId)
```

## Badge Integration

### Comment-Related Badges

#### Engagement Badges
- **First Comment** (💬) - Leave your first comment
- **Conversationalist** (🗣️) - Progressive badge for comment count
  - Chatter: 10 comments
  - Conversationalist: 50 comments
  - Discussion Leader: 100 comments
  - Community Voice: 500 comments

#### Quality Badges
- **Helpful Commenter** (👍) - Comments with high likes
- **Discussion Starter** (🔥) - Comments that get replies
- **Community Helper** (🤝) - Help many different users

### Badge Triggers
Comments automatically trigger badge checks:
- After creating a comment
- After receiving likes on comments
- After replies are created
- Daily recalculation for complex badges

## Implementation Guide

### 1. Basic Integration

Add comment section to a prompt page:

```tsx
import { CommentSection } from '@/components/comments'

function PromptPage({ prompt }) {
  return (
    <div>
      {/* Prompt content */}
      <CommentSection 
        promptId={prompt._id}
        initialCommentCount={prompt.commentCount}
      />
    </div>
  )
}
```

### 2. Custom Comment Display

Use individual components for custom layouts:

```tsx
import { CommentThread, CommentForm } from '@/components/comments'
import { useComments } from '@/hooks/use-comments'

function CustomCommentSection({ promptId }) {
  const { comments, createComment } = useComments({ promptId })
  
  return (
    <div>
      <CommentForm 
        promptId={promptId}
        onCommentCreated={createComment}
      />
      {comments.map(comment => (
        <CommentThread key={comment._id} comment={comment} />
      ))}
    </div>
  )
}
```

### 3. Real-time Updates

Enable auto-refresh for real-time comments:

```tsx
const { comments } = useComments({ 
  promptId: "123",
  autoRefresh: true,
  refreshInterval: 30000 // 30 seconds
})
```

### 4. Badge Integration

Trigger badge checks after comment actions:

```tsx
import { triggerBadgesAfterCommentCreate } from '@/lib/badges/comment-badge-triggers'

// After creating a comment
const newComment = await createComment(content)
if (newComment) {
  await triggerBadgesAfterCommentCreate(userId, newComment)
}
```

## Performance Considerations

### Database Optimization
- **Compound Indexes** - Optimized queries for common access patterns
- **Aggregation Pipelines** - Efficient nested comment loading
- **Soft Deletes** - Preserve thread integrity while hiding deleted content
- **Comment Counters** - Cached counts on prompt documents

### Frontend Optimization
- **Lazy Loading** - Load comments on demand
- **Optimistic Updates** - Immediate UI feedback
- **Pagination** - Limit initial load size
- **Memoization** - Prevent unnecessary re-renders

### Scalability Features
- **Depth Limits** - Prevent infinite nesting
- **Rate Limiting** - Prevent comment spam
- **Batch Operations** - Efficient bulk updates
- **Caching** - Redis caching for hot comments

## Security & Moderation

### Authentication & Authorization
- **JWT Tokens** - Secure API access
- **Author Verification** - Only authors can edit/delete
- **Input Validation** - Sanitize comment content
- **Rate Limiting** - Prevent abuse

### Content Moderation
- **Character Limits** - Prevent overly long comments
- **Soft Deletes** - Maintain thread structure
- **Edit History** - Track comment modifications
- **Flag System** - Future: User reporting

### Data Privacy
- **User Consent** - Clear privacy policies
- **Data Retention** - Configurable deletion policies
- **GDPR Compliance** - User data export/deletion
- **Audit Logs** - Track administrative actions

## Testing

### Unit Tests
```bash
# Test comment service
npm test services/comment-service.test.ts

# Test comment components
npm test components/comments/*.test.tsx

# Test comment hooks
npm test hooks/use-comments.test.ts
```

### Integration Tests
```bash
# Test API endpoints
npm test api/comments/*.test.ts

# Test badge integration
npm test badges/comment-badge-triggers.test.ts
```

### Performance Tests
```bash
# Load testing
npm run test:load

# Database performance
npm run test:db-performance
```

## Monitoring & Analytics

### Key Metrics
- Comment creation rate
- Reply engagement rate
- Like-to-comment ratio
- Average comment length
- User retention after commenting

### Error Monitoring
- Failed comment creations
- API response times
- Database query performance
- Badge calculation errors

### User Analytics
- Most active commenters
- Popular comment threads
- Engagement by prompt category
- Comment sentiment analysis (future)

## Migration & Deployment

### Database Migration
```javascript
// Add comment count to existing prompts
db.prompts.updateMany(
  {},
  { $set: { commentCount: 0 } }
)

// Create comment indexes
db.comments.createIndex({ promptId: 1, parentId: 1, createdAt: -1 })
db.comments.createIndex({ authorId: 1, createdAt: -1 })
```

### Feature Flags
- `ENABLE_COMMENTS` - Toggle comment system
- `ENABLE_COMMENT_LIKES` - Toggle like functionality
- `ENABLE_COMMENT_BADGES` - Toggle badge integration
- `MAX_COMMENT_DEPTH` - Configure nesting depth

### Deployment Checklist
- [ ] Database indexes created
- [ ] API endpoints deployed
- [ ] Frontend components integrated
- [ ] Badge system updated
- [ ] Monitoring configured
- [ ] Performance tested
- [ ] Security reviewed

## Future Enhancements

### Planned Features
1. **Rich Text Editor** - Markdown support, formatting
2. **Comment Search** - Full-text search across comments
3. **Mention System** - @username notifications
4. **Comment Templates** - Pre-defined helpful responses
5. **Moderation Dashboard** - Admin tools for content management

### Advanced Features
1. **Real-time Collaboration** - Live typing indicators
2. **Comment Analytics** - Detailed engagement metrics
3. **AI Moderation** - Automated content filtering
4. **Comment Export** - PDF/CSV export functionality
5. **Integration APIs** - Third-party comment widgets

## Troubleshooting

### Common Issues

#### Comments Not Loading
1. Check API authentication
2. Verify promptId parameter
3. Review database indexes
4. Check network connectivity

#### Real-time Updates Not Working
1. Verify WebSocket connection
2. Check auto-refresh settings
3. Review browser console for errors
4. Test API endpoints manually

#### Badge Not Awarded
1. Check badge criteria
2. Verify user statistics
3. Review badge calculation logs
4. Test badge triggers manually

### Debug Tools
- Comment API testing endpoints
- Badge calculation simulator
- User statistics viewer
- Performance profiler

---

For technical support or questions about the comment system, please refer to the development team or create an issue in the project repository.
