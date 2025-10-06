# User Profile & Follow Feature Documentation

## Overview
Added a complete user profile system with follow/unfollow functionality.

## New Features

### 1. User Profiles
- **Profile Page**: `/user/[id]` - View any user's profile
- **Profile Information**:
  - Name, email, bio, avatar
  - Follower/following counts
  - Total prompts created
  - Total likes received
  - Join date
  
### 2. Follow System
- **Follow/Unfollow**: Users can follow/unfollow other users
- **Follow Button**: Appears on user profiles (not on own profile)
- **Real-time Updates**: Follower counts update immediately
- **Follow Status**: Shows if you're already following a user

### 3. Clickable Usernames
- **PromptCard**: Click on any username to view their profile
- **Hover Effect**: Visual feedback on username hover

## File Structure

```
├── types/index.ts                          # Extended User and UserProfile types
├── services/user-service.ts                # User profile operations
├── hooks/
│   ├── use-user-profile.ts                # Profile data fetching
│   └── use-follow.ts                      # Follow/unfollow logic
├── app/
│   ├── user/[id]/page.tsx                 # User profile page
│   └── api/user/
│       ├── follow/route.ts                # Follow endpoint
│       ├── unfollow/route.ts              # Unfollow endpoint
│       ├── profile/[id]/route.ts          # Get profile endpoint
│       ├── [id]/prompts/route.ts          # Get user prompts
│       ├── [id]/followers/route.ts        # Get followers list
│       └── [id]/following/route.ts        # Get following list
├── components/prompts/
│   └── PromptCardHeader.tsx               # Updated with clickable username
└── lib/models/User.ts                     # Updated with followers/following fields
```

## API Endpoints

### GET `/api/user/profile/[id]`
Get user profile information
- **Response**: UserProfile object with follow status

### POST `/api/user/follow`
Follow a user
- **Body**: `{ userId: string }`
- **Auth**: Required

### POST `/api/user/unfollow`
Unfollow a user
- **Body**: `{ userId: string }`
- **Auth**: Required

### GET `/api/user/[id]/prompts`
Get all public prompts by a user
- **Response**: Array of prompts

### GET `/api/user/[id]/followers`
Get list of followers
- **Response**: Array of users

### GET `/api/user/[id]/following`
Get list of users being followed
- **Response**: Array of users

## Usage Examples

### Navigate to User Profile
```typescript
import Link from 'next/link'

<Link href={`/user/${userId}`}>
  View Profile
</Link>
```

### Use Follow Hook
```typescript
import { useFollow } from '@/hooks/use-follow'

function MyComponent() {
  const { toggleFollow, loading } = useFollow()
  
  const handleFollow = async () => {
    await toggleFollow(userId, isFollowing, () => {
      // Callback after successful follow
      refreshProfile()
    })
  }
  
  return (
    <button onClick={handleFollow} disabled={loading}>
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  )
}
```

### Fetch User Profile
```typescript
import { useUserProfile } from '@/hooks/use-user-profile'

function ProfileComponent({ userId }) {
  const { profile, prompts, loading } = useUserProfile(userId)
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      <h1>{profile.name}</h1>
      <p>Followers: {profile.followers}</p>
      <p>Following: {profile.following}</p>
    </div>
  )
}
```

## Database Schema Updates

### User Model
Added new fields:
```typescript
{
  bio: String,              // User biography (max 500 chars)
  followers: [ObjectId],    // Array of user IDs who follow this user
  following: [ObjectId],    // Array of user IDs this user follows
}
```

## UI Components

### Profile Page Features
- **Header Section**: Avatar, name, email, bio
- **Stats**: Prompts count, followers, following, join date
- **Follow Button**: Follow/unfollow with loading state
- **Tabs**: 
  - Prompts tab: Shows all public prompts by the user
  - Liked tab: Placeholder for future feature
- **Responsive Design**: Mobile-friendly layout

### PromptCard Updates
- Username is now a clickable link
- Hover effect on username
- Opens user profile in same tab

## Security Features
- **Authentication Required**: Follow/unfollow requires login
- **Self-Follow Prevention**: Cannot follow yourself
- **Private Prompts**: Only public prompts shown on profiles
- **Token Validation**: All protected routes verify JWT

## Future Enhancements
- [ ] Show liked prompts on profile
- [ ] Activity feed for followed users
- [ ] Mutual followers indicator
- [ ] User search functionality
- [ ] Follow suggestions
- [ ] Notification system for new followers
- [ ] Profile editing (bio, avatar)
