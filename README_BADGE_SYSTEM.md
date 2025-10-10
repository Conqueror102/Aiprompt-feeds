# 🏆 Badge System Implementation

A comprehensive gamification system for the AI Prompt Hub that rewards users for various activities and achievements.

## 🚀 Quick Start

### 1. Install Dependencies
The badge system uses existing dependencies. Ensure you have:
- `mongoose` for database operations
- `sonner` for notifications
- `lucide-react` for icons

### 2. Database Migration
Update your existing users with badge fields:

```javascript
// Run this migration script
db.users.updateMany(
  {},
  {
    $set: {
      badges: [],
      stats: {
        totalPrompts: 0,
        totalLikes: 0,
        totalSaves: 0,
        totalFollowers: 0,
        totalFollowing: 0,
        consecutiveDays: 0,
        lastActiveDate: new Date(),
        categoriesUsed: [],
        agentsUsed: [],
        highestRatedPrompt: 0,
        averageRating: 0,
        promptsWithRating: 0,
        viralPrompts: 0,
        weekendPrompts: 0
      }
    }
  }
)
```

### 3. Add Badge Checking to Existing APIs

Update your existing API routes to trigger badge checks:

```typescript
// In your prompt creation API
import { triggerBadgesAfterPromptCreate } from '@/lib/badges/badge-triggers'

export async function POST(request: NextRequest) {
  // ... existing prompt creation logic
  
  // Trigger badge check
  const newBadges = await triggerBadgesAfterPromptCreate(userId, promptData)
  
  return NextResponse.json({
    success: true,
    data: { prompt, newBadges } // Include new badges in response
  })
}
```

### 4. Add Badge Display to User Profiles

```tsx
import { useBadges } from '@/hooks/use-badges'
import BadgeShowcase from '@/components/badges/BadgeShowcase'

function UserProfile({ userId }) {
  const { badges } = useBadges({ userId })
  
  return (
    <div>
      {/* Existing profile content */}
      <BadgeShowcase badges={badges} />
    </div>
  )
}
```

## 📁 File Structure

```
├── types/
│   └── badge.ts                    # Type definitions
├── lib/
│   └── badges/
│       ├── badge-definitions.ts    # All badge definitions
│       ├── badge-validators.ts     # Custom validation logic
│       └── badge-triggers.ts       # Action triggers
├── services/
│   └── badge-service.ts           # Core business logic
├── app/api/badges/
│   ├── route.ts                   # Badge definitions & checking
│   ├── user/[id]/route.ts         # User badges
│   └── leaderboard/route.ts       # Badge leaderboard
├── components/badges/
│   ├── BadgeDisplay.tsx           # Individual badge display
│   ├── BadgeCollection.tsx        # Full badge collection
│   ├── BadgeNotification.tsx      # Toast notifications
│   └── BadgeShowcase.tsx          # Compact badge display
├── hooks/
│   └── use-badges.ts              # React hooks for badges
└── docs/
    └── BADGE_SYSTEM.md            # Comprehensive documentation
```

## 🎯 Available Badges

### Content Creation (📝)
- **First Steps** - Create your first prompt
- **Prolific Creator** - 10, 50, 100, 500 prompts (Progressive)
- **Multi-Agent Master** - Prompts for 5+ AI agents
- **Category Explorer** - Prompts in 5+ categories
- **Quality Craftsman** - 4.5+ star average rating

### Engagement (❤️)
- **Popular Creator** - 100, 500, 1000, 5000 total likes (Progressive)
- **Bookmarked** - 50, 200, 500, 1000 total saves (Progressive)
- **Viral Hit** - Single prompt with 100+ likes

### Social (👥)
- **Influencer** - 50, 100, 500, 1000 followers (Progressive)
- **Networker** - Following 50+ users
- **Community Builder** - 100+ followers + 50+ following

### Time-Based (⏰)
- **Pioneer** - Among first 100 users
- **Veteran** - 6 months, 1 year, 2 years (Progressive)
- **Consistent Contributor** - 7, 30, 90, 365 consecutive days (Progressive)

### Specialty (⚡)
- **ChatGPT Master** - 50+ ChatGPT prompts
- **Claude Expert** - 50+ Claude prompts
- **Image Wizard** - 20+ image generation prompts
- **Code Whisperer** - 20+ development prompts

## 🔧 Integration Examples

### 1. Add to Existing Prompt Creation

```typescript
// app/api/prompts/create/route.ts
import { triggerBadgesAfterPromptCreate } from '@/lib/badges/badge-triggers'

export async function POST(request: NextRequest) {
  // ... existing logic
  
  // After successful prompt creation
  const newBadges = await triggerBadgesAfterPromptCreate(userId, {
    category: promptData.category,
    aiAgents: promptData.aiAgents
  })
  
  return NextResponse.json({
    success: true,
    data: { prompt, newBadges }
  })
}
```

### 2. Add to Like System

```typescript
// app/api/prompts/[id]/like/route.ts
import { triggerBadgesAfterPromptLike } from '@/lib/badges/badge-triggers'

export async function POST(request: NextRequest, { params }) {
  // ... existing like logic
  
  // After successful like
  const newBadges = await triggerBadgesAfterPromptLike(params.id, userId)
  
  return NextResponse.json({
    success: true,
    data: { liked: true, newBadges }
  })
}
```

### 3. Add to User Registration

```typescript
// app/api/auth/register/route.ts
import { initializeUserStats } from '@/lib/badges/badge-triggers'

export async function POST(request: NextRequest) {
  // ... existing registration logic
  
  // After user creation
  await initializeUserStats(newUser._id.toString())
  
  return NextResponse.json({
    success: true,
    data: { user, token }
  })
}
```

### 4. Add Badge Showcase to Profile

```tsx
// components/UserProfile.tsx
import BadgeShowcase from '@/components/badges/BadgeShowcase'
import { useBadges } from '@/hooks/use-badges'

export default function UserProfile({ user }) {
  const { badges } = useBadges({ userId: user._id })
  
  return (
    <div className="space-y-6">
      {/* Existing profile content */}
      
      <BadgeShowcase 
        badges={badges}
        title={`${user.name}'s Badges`}
        onViewAll={() => {/* Navigate to full badge page */}}
      />
    </div>
  )
}
```

### 5. Add Real-time Badge Notifications

```tsx
// app/layout.tsx or main app component
import { useBadges } from '@/hooks/use-badges'
import { useAuth } from '@/hooks/use-auth'

export default function App() {
  const { user } = useAuth()
  const { badges } = useBadges({ 
    userId: user?._id, 
    autoCheck: true,
    checkInterval: 30000 // Check every 30 seconds
  })
  
  return (
    <div>
      {/* Your app content */}
    </div>
  )
}
```

## 🎨 UI Components Usage

### Badge Display
```tsx
<BadgeDisplay 
  badge={badge} 
  size="lg" 
  showProgress={true} 
/>
```

### Badge Collection (Full Page)
```tsx
<BadgeCollection 
  badges={badges}
  showProgress={true}
  title="My Achievement Collection"
/>
```

### Badge Showcase (Profile Card)
```tsx
<BadgeShowcase 
  badges={badges}
  maxDisplay={3}
  showViewAll={true}
  onViewAll={() => router.push('/badges')}
/>
```

### Mini Badge Display
```tsx
<MiniBadgeShowcase 
  badges={badges}
  maxDisplay={2}
  className="ml-2"
/>
```

## 🔄 Automatic Badge Checking

The system automatically checks badges when:

1. **User creates a prompt** → Content creation badges
2. **Prompt receives likes** → Engagement badges  
3. **Prompt gets saved** → Engagement badges
4. **User follows someone** → Social badges
5. **User logs in** → Time-based badges
6. **Daily cron job** → All time-based badges

## 📊 Analytics & Monitoring

### Track Badge Performance
```typescript
// Get badge statistics
const stats = await BadgeService.getBadgeLeaderboard(50)

// Monitor badge earn rates
const earnRates = badges.map(badge => ({
  id: badge.id,
  name: badge.name,
  earnRate: (earnedCount / totalUsers) * 100
}))
```

### Performance Monitoring
- Badge calculation time
- Database query performance
- User engagement after earning badges

## 🚀 Deployment Checklist

- [ ] Run database migration for existing users
- [ ] Add badge triggers to existing API endpoints
- [ ] Set up daily cron job for time-based badges
- [ ] Add badge displays to user profiles
- [ ] Configure badge notifications
- [ ] Test badge earning flows
- [ ] Monitor performance metrics

## 🔮 Future Enhancements

1. **Seasonal Badges** - Limited-time achievements
2. **Team Badges** - Collaborative achievements  
3. **Custom Admin Badges** - Manually awarded badges
4. **Badge Marketplace** - Trade/gift badges
5. **Achievement Paths** - Guided progression
6. **Global Leaderboards** - Cross-platform achievements

## 🐛 Troubleshooting

### Badges Not Updating
1. Check user statistics in database
2. Verify badge criteria logic
3. Review API authentication
4. Check badge trigger integration

### Performance Issues
1. Monitor database queries
2. Check badge calculation complexity
3. Review caching strategies
4. Optimize batch operations

### Missing UI Components
Ensure you have the required UI components:
```bash
# Check if these exist in your components/ui/
- badge.tsx
- card.tsx
- progress.tsx
- tooltip.tsx
- tabs.tsx
- select.tsx
```

## 📞 Support

For questions or issues:
1. Check the comprehensive documentation in `docs/BADGE_SYSTEM.md`
2. Review the implementation examples above
3. Test with the provided API endpoints
4. Monitor console logs for badge-related errors

---

**Ready to gamify your AI Prompt Hub! 🎮**
