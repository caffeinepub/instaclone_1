import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useGetPost } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import PostCard from '@/components/PostCard';
import CommentList from '@/components/CommentList';
import CommentInput from '@/components/CommentInput';
import { Skeleton } from '@/components/ui/skeleton';

export default function PostDetailPage() {
  const { postId } = useParams({ from: '/post/$postId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const postIdBigInt = BigInt(postId);
  const { data: post, isLoading } = useGetPost(postIdBigInt);

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Back */}
      <button
        onClick={() => navigate({ to: '/' })}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to feed
      </button>

      {isLoading ? (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <Skeleton className="w-8 h-8 rounded-full bg-secondary" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24 bg-secondary" />
                <Skeleton className="h-2.5 w-16 bg-secondary" />
              </div>
            </div>
            <Skeleton className="w-full h-80 bg-secondary" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-32 bg-secondary" />
              <Skeleton className="h-3 w-full bg-secondary" />
            </div>
          </div>
        </div>
      ) : !post ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Post not found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Post */}
          <PostCard post={post} showFullCaption />

          {/* Comments Section */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-4 h-4 text-amber" />
              <h2 className="font-display font-semibold text-foreground">
                Comments ({post.comments.length})
              </h2>
            </div>

            <CommentList comments={post.comments} />

            {isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-border">
                <CommentInput postId={post.id} />
              </div>
            )}

            {!isAuthenticated && (
              <p className="text-center text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                Sign in to leave a comment
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
