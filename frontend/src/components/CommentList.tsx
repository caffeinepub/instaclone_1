import React from 'react';
import type { Comment } from '../backend';
import { useGetUserProfile } from '@/hooks/useQueries';
import UserAvatar from './UserAvatar';
import { formatRelativeTime } from '@/lib/utils';

interface CommentItemProps {
  comment: Comment;
}

function CommentItem({ comment }: CommentItemProps) {
  const authorPrincipal = comment.author.toString();
  const { data: authorProfile } = useGetUserProfile(authorPrincipal);

  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      <UserAvatar
        avatarUrl={authorProfile?.avatarUrl}
        displayName={authorProfile?.displayName}
        size="xs"
        className="mt-0.5 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-semibold text-sm text-foreground">
            {authorProfile?.displayName || 'Anonymous'}
          </span>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.timestamp)}</span>
        </div>
        <p className="text-sm text-foreground/90 mt-0.5 leading-relaxed">{comment.text}</p>
      </div>
    </div>
  );
}

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {comments.map((comment, index) => (
        <CommentItem key={`${comment.author.toString()}-${index}`} comment={comment} />
      ))}
    </div>
  );
}
