// Component for prompt card header
import { Star, Wrench, MoreHorizontal, Eye, Edit3, Share } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PromptCardHeaderProps {
  creatorName: string
  creatorId: string
  createdAt: string
  rating?: number
  isPrivate?: boolean
  isOwner: boolean
  category: string
  tools?: string[]
  technologies?: string[]
  onViewDetails: () => void
  onShare: () => void
  onEdit: () => void
  onToolClick: (tool: string) => void
}

export default function PromptCardHeader({
  creatorName,
  creatorId,
  createdAt,
  rating,
  isPrivate,
  isOwner,
  category,
  tools,
  technologies,
  onViewDetails,
  onShare,
  onEdit,
  onToolClick,
}: PromptCardHeaderProps) {
  const hasTools = Array.isArray(tools) && tools.length > 0
  const hasTechnologies = Array.isArray(technologies) && technologies.length > 0

  return (
    <div className="flex items-start justify-between">
      <Link href={`/user/${creatorId}`} className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
        <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
          <AvatarFallback className="bg-green-100 text-green-600 text-xs sm:text-sm">
            {creatorName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xs sm:text-sm font-medium hover:underline">{creatorName}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {typeof rating === 'number' && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              {rating.toFixed(1)}
            </span>
          </div>
        )}
        {isPrivate && isOwner && (
          <Badge variant="destructive" className="text-xs mr-2">
            Private
          </Badge>
        )}
        {category === 'Development' && (hasTools || hasTechnologies) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="Recommended Tools">
                <Wrench className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {hasTools && (
                <>
                  <DropdownMenuItem disabled className="text-xs font-semibold text-gray-500">
                    Tools
                  </DropdownMenuItem>
                  {tools!.map((tool) => (
                    <DropdownMenuItem key={tool} onClick={() => onToolClick(tool)}>
                      {tool}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              {hasTechnologies && (
                <>
                  <DropdownMenuItem disabled className="text-xs font-semibold text-gray-500">
                    Technologies
                  </DropdownMenuItem>
                  {technologies!.map((tech) => (
                    <DropdownMenuItem key={tech} onClick={() => onToolClick(tech)}>
                      {tech}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onViewDetails}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShare}>
              <Share className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit3 className="mr-2 h-4 w-4" />
              {isOwner ? 'Edit' : 'Edit & Use'}
            </DropdownMenuItem>
            <DropdownMenuItem>Report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
