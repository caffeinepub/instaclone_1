import React from 'react';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { Post } from '../backend';
import {
  useHasLikedPost,
  useLikePost,
  useUnlikePost,
  useGetUserProfile,
  useHasSavedPost,
  useSavePost,
  useUnsavePost,
} from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import UserAvatar from './UserAvatar';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  showFullCaption?: boolean;
}

export default function PostCard({ post, showFullCaption = false }: PostCardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const authorPrincipal = post.author.toString();
  const { data: authorProfile } = useGetUserProfile(authorPrincipal);
  const { data: hasLiked } = useHasLikedPost(isAuthenticated ? post.id : null);
  const { data: hasSaved } = useHasSavedPost(isAuthenticated ? post.id : null);
  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();
  const savePostMutation = useSavePost();
  const unsavePostMutation = useUnsavePost();

  const isPendingLike = likeMutation.isPending || unlikeMutation.isPending;
  const isPendingSave = savePostMutation.isPending || unsavePostMutation.isPending;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (hasLiked) {
      await unlikeMutation.mutateAsync(post.id);
    } else {
      await likeMutation.mutateAsync(post.id);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (hasSaved) {
      await unsavePostMutation.mutateAsync(post.id);
    } else {
      await savePostMutation.mutateAsync(post.id);
    }
  };

  const handleCardClick = () => {
    navigate({ to: `/post/${post.id.toString()}` });
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ to: `/post/${post.id.toString()}` });
  };

  return (
    <article
      className="bg-card border border-border rounded-xl overflow-hidden card-hover cursor-pointer animate-fade-in"
      onClick={handleCardClick}
    >
      {/* Author Header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <UserAvatar
          avatarUrl={authorProfile?.avatarUrl}
          displayName={authorProfile?.displayName}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">
            {authorProfile?.displayName || 'Anonymous'}
          </p>
          <p className="text-xs text-muted-foreground">{formatRelativeTime(post.timestamp)}</p>
        </div>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="relative w-full bg-secondary" style={{ paddingBottom: '75%' }}>
          <img
            src={post.imageUrl}
            alt={post.caption}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Actions + Caption */}
      <div className="p-4 pt-3 space-y-2">
        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={isPendingLike || !isAuthenticated}
            className={cn(
              'flex items-center gap-1.5 text-sm font-medium transition-all duration-150',
              hasLiked
                ? 'text-blue'
                : 'text-muted-foreground hover:text-blue',
              !isAuthenticated && 'cursor-default opacity-60'
            )}
          >
            <Heart
              className={cn('w-5 h-5 transition-all', hasLiked && 'fill-blue stroke-blue scale-110')}
            />
            <span>{post.likeCount.toString()}</span>
          </button>

          <button
            onClick={handleCommentClick}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments.length}</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={handleSave}
              disabled={isPendingSave}
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium transition-all duration-150 ml-auto',
                hasSaved
                  ? 'text-blue'
                  : 'text-muted-foreground hover:text-blue'
              )}
            >
              <Bookmark
                className={cn('w-5 h-5 transition-all', hasSaved && 'fill-blue stroke-blue')}
              />
            </button>
          )}
        </div>

        {/* Caption */}
        {post.caption && (
          <p className={cn('text-sm text-foreground leading-relaxed', !showFullCaption && 'line-clamp-2')}>
            <span className="font-semibold mr-1">{authorProfile?.displayName || 'Anonymous'}</span>
            {post.caption}
          </p>
        )}
      </div>
    </article>
  );
}
