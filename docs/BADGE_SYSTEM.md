# Badge System Documentation

## Overview

The AI Prompt Hub badge system is a comprehensive gamification feature that rewards users for various activities and achievements within the platform. Users can earn badges for creating content, engaging with the community, building social connections, and demonstrating expertise in specific areas.

## Architecture

### Core Components

1. **Type Definitions** (`/types/badge.ts`)
   - Badge interfaces and enums
   - User statistics tracking
   - Badge criteria definitions

2. **Badge Definitions** (`/lib/badges/badge-definitions.ts`)
   - All available badges with criteria
   - Badge categorization and tiers
   - Progressive badge levels

3. **Badge Validators** (`/lib/badges/badge-validators.ts`)
   - Custom validation functions
   - Complex badge criteria logic
   - Utility functions for calculations

4. **Badge Service** (`/services/badge-service.ts`)
   - Core business logic
   - Badge checking and awarding
   - User statistics calculation

5. **API Endpoints** (`/app/api/badges/`)
   - RESTful badge management
   - User badge retrieval
   - Badge leaderboard

6. **UI Components** (`/components/badges/`)
   - Badge display components
   - Badge collection views
   - Notification system

7. **React Hooks** (`/hooks/use-badges.ts`)
   - Badge state management
   - Real-time badge checking
   - Leaderboard functionality

## Badge Categories

### 1. Content Creation
Rewards for creating and sharing prompts:
- **First Steps**: Create your first prompt
- **Prolific Creator**: Progressive badge for multiple prompts (10, 50, 100, 500)
- **Multi-Agent Master**: Create prompts for 5+ different AI agents
- **Category Explorer**: Create prompts in 5+ different categories
- **Quality Craftsman**: Maintain 4.5+ star average rating

### 2. Engagement
Rewards for community interaction:
- **Popular Creator**: Progressive badge for total likes (100, 500, 1000, 5000)
- **Bookmarked**: Progressive badge for total saves (50, 200, 500, 1000)
- **Viral Hit**: Create a prompt with 100+ likes

### 3. Social
Rewards for community building:
- **Influencer**: Progressive badge for followers (50, 100, 500, 1000)
- **Networker**: Follow 50+ users
- **Community Builder**: 100+ followers and following 50+ users

### 4. Time-Based
Rewards for consistency and longevity:
- **Pioneer**: Among the first 100 users
- **Veteran**: Progressive badge for account age (6 months, 1 year, 2 years)
- **Consistent Contributor**: Progressive badge for consecutive days (7, 30, 90, 365)

### 5. Specialty
Rewards for expertise in specific areas:
- **ChatGPT Master**: 50+ ChatGPT prompts
- **Claude Expert**: 50+ Claude prompts
- **Image Wizard**: 20+ image generation prompts
- **Code Whisperer**: 20+ development prompts

## Badge Tiers

### Common (Bronze)
- Easy to earn
- Encourages initial participation
- Gray color scheme

### Uncommon (Silver)
- Moderate effort required
- Shows commitment
- Green color scheme

### Rare (Gold)
- Significant achievement
- Demonstrates expertise
- Blue color scheme

### Epic (Platinum)
- Top-tier accomplishment
- Exceptional performance
- Purple color scheme

### Legendary (Diamond)
- Exclusive achievements
- Very few users earn these
- Yellow/gold color scheme

## Implementation Guide

### 1. Database Setup

The User model has been extended with badge-related fields:

```typescript
// User schema additions
badges: [{
  badgeId: String,
  earnedAt: Date,
  level: Number,
  progress: Number
}],
stats: {
  totalPrompts: Number,
  totalLikes: Number,
  totalSaves: Number,
  // ... other tracking fields
}
```

### 2. Badge Checking

Badges are checked automatically when:
- User creates a new prompt
- User receives likes/saves
- User gains followers
- Daily cron job runs
- Manual trigger via API

```typescript
// Example usage
import { BadgeService } from '@/services/badge-service'

// Check badges after user action
const newBadges = await BadgeService.checkUserBadges(userId)
```

### 3. Adding New Badges

To add a new badge:

1. **Define the badge** in `/lib/badges/badge-definitions.ts`:
```typescript
{
  id: 'new_badge',
  name: 'New Badge',
  description: 'Description of achievement',
  icon: '🏆',
  tier: BadgeTier.RARE,
  category: BadgeCategory.CONTENT_CREATION,
  criteria: {
    type: BadgeCriteriaType.THRESHOLD,
    field: 'totalPrompts',
    threshold: 25
  }
}
```

2. **Add custom validator** (if needed) in `/lib/badges/badge-validators.ts`:
```typescript
export function checkNewBadgeCriteria(stats: UserStats, params: any): boolean {
  // Custom validation logic
  return true
}
```

3. **Update badge definitions** array and export the new badge.

### 4. UI Integration

Display badges in your components:

```tsx
import { useBadges } from '@/hooks/use-badges'
import BadgeCollection from '@/components/badges/BadgeCollection'

function UserProfile({ userId }) {
  const { badges, loading } = useBadges({ userId })
  
  return (
    <BadgeCollection 
      badges={badges} 
      showProgress={true}
    />
  )
}
```

### 5. Real-time Notifications

Enable badge notifications:

```tsx
import { useBadges, useBadgeChecker } from '@/hooks/use-badges'

function App() {
  const { checkAfterPromptCreate } = useBadgeChecker()
  
  const handlePromptCreate = async () => {
    // Create prompt logic
    await createPrompt(data)
    
    // Check for new badges
    checkAfterPromptCreate()
  }
}
```

## API Endpoints

### GET /api/badges
Returns all available badge definitions.

### POST /api/badges/check
Checks and awards badges for authenticated user.

### GET /api/badges/user/[id]
Returns badges for a specific user.

### GET /api/badges/leaderboard
Returns top badge collectors.

## Performance Considerations

### 1. Caching
- Badge definitions are cached in memory
- User statistics are cached and updated incrementally
- Leaderboard is cached with TTL

### 2. Batch Processing
- Badge checks are batched for efficiency
- Statistics updates are queued and processed in batches
- Database queries are optimized with indexes

### 3. Async Processing
- Badge calculations run asynchronously
- Non-blocking badge checks after user actions
- Background jobs for time-based badges

## Monitoring and Analytics

### Key Metrics
- Badge earn rates by type
- User engagement after earning badges
- Most/least earned badges
- Badge progression analytics

### Logging
- Badge award events
- Failed badge checks
- Performance metrics
- User badge statistics

## Security Considerations

### 1. Validation
- All badge criteria are validated server-side
- User statistics are calculated from authoritative sources
- No client-side badge manipulation possible

### 2. Rate Limiting
- Badge check API endpoints are rate limited
- Prevents abuse and spam
- Protects against DoS attacks

### 3. Data Integrity
- Badge awards are atomic operations
- Statistics updates are transactional
- Rollback mechanisms for failed operations

## Testing

### Unit Tests
- Badge criteria validation
- Statistics calculation
- Badge service methods

### Integration Tests
- API endpoint functionality
- Database operations
- Badge checking workflows

### Performance Tests
- Badge calculation performance
- Database query optimization
- Concurrent user scenarios

## Future Enhancements

### Planned Features
1. **Seasonal Badges**: Limited-time achievements
2. **Team Badges**: Collaborative achievements
3. **Custom Badges**: Admin-created badges
4. **Badge Trading**: User-to-user badge transfers
5. **Achievement Paths**: Guided badge progression

### Scalability Improvements
1. **Microservice Architecture**: Separate badge service
2. **Event-Driven Updates**: Real-time badge processing
3. **Advanced Analytics**: ML-powered badge recommendations
4. **Global Leaderboards**: Cross-platform achievements

## Troubleshooting

### Common Issues

1. **Badges Not Updating**
   - Check user statistics calculation
   - Verify badge criteria logic
   - Review API authentication

2. **Performance Issues**
   - Monitor database query performance
   - Check badge calculation complexity
   - Review caching strategies

3. **Missing Badges**
   - Verify badge definitions
   - Check validator functions
   - Review user data integrity

### Debug Tools
- Badge calculation simulator
- User statistics viewer
- Badge award history
- Performance profiler

## Migration Guide

### From No Badge System
1. Run initial badge calculation for existing users
2. Populate user statistics from historical data
3. Award retroactive badges based on current achievements

### Schema Updates
```sql
-- Add badge fields to users table
ALTER TABLE users ADD COLUMN badges JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN stats JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX idx_users_badges ON users USING GIN (badges);
CREATE INDEX idx_users_stats ON users USING GIN (stats);
```

## Support and Maintenance

### Regular Tasks
- Monitor badge earn rates
- Update badge criteria based on user feedback
- Performance optimization
- Security audits

### Version Updates
- Backward compatibility for badge definitions
- Migration scripts for schema changes
- Deprecation notices for removed badges

---

For technical support or questions about the badge system, please refer to the development team or create an issue in the project repository.
