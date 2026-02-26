import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsFollowing, useFollow, useUnfollow } from '@/hooks/useQueries';

interface FollowButtonProps {
  targetPrincipal: string;
  currentPrincipal: string | null;
}

export default function FollowButton({ targetPrincipal, currentPrincipal }: FollowButtonProps) {
  const isOwnProfile = currentPrincipal === targetPrincipal;
  const { data: isFollowing, isLoading: checkingFollow } = useIsFollowing(
    !isOwnProfile ? targetPrincipal : null
  );
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();

  if (isOwnProfile || !currentPrincipal) return null;

  const isPending = followMutation.isPending || unfollowMutation.isPending;

  const handleClick = async () => {
    if (isFollowing) {
      await unfollowMutation.mutateAsync(targetPrincipal);
    } else {
      await followMutation.mutateAsync(targetPrincipal);
    }
  };

  if (checkingFollow) {
    return (
      <Button variant="outline" size="sm" disabled className="min-w-[90px]">
        <Loader2 className="w-3 h-3 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      size="sm"
      className={
        isFollowing
          ? 'min-w-[90px] bg-secondary text-foreground hover:bg-destructive/20 hover:text-destructive border border-border'
          : 'min-w-[90px] bg-blue text-white font-semibold hover:bg-blue-light'
      }
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : isFollowing ? (
        'Unfollow'
      ) : (
        'Follow'
      )}
    </Button>
  );
}
