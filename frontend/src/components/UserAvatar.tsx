import React from 'react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  avatarUrl?: string;
  displayName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export default function UserAvatar({ avatarUrl, displayName, size = 'md', className }: UserAvatarProps) {
  const sizeClass = sizeClasses[size];

  return (
    <div className={cn('rounded-full overflow-hidden flex-shrink-0 bg-secondary border border-border', sizeClass, className)}>
      <img
        src={avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : '/assets/generated/avatar-placeholder.dim_128x128.png'}
        alt={displayName || 'User avatar'}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/assets/generated/avatar-placeholder.dim_128x128.png';
        }}
      />
    </div>
  );
}
