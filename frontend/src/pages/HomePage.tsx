import React from 'react';
import { Link } from '@tanstack/react-router';
import { PlusSquare, Compass } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetHomeFeed, useGetAllRecentPosts } from '@/hooks/useQueries';
import PostCard from '@/components/PostCard';
import StoriesBar from '@/components/StoriesBar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

function PostSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <Skeleton className="w-8 h-8 rounded-full bg-secondary" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24 bg-secondary" />
          <Skeleton className="h-2.5 w-16 bg-secondary" />
        </div>
      </div>
      <Skeleton className="w-full h-64 bg-secondary" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-32 bg-secondary" />
        <Skeleton className="h-3 w-full bg-secondary" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: homeFeed, isLoading: feedLoading } = useGetHomeFeed();
  const { data: recentPosts, isLoading: recentLoading } = useGetAllRecentPosts();

  const isLoading = feedLoading || recentLoading;

  // Use home feed if authenticated, otherwise recent posts
  const posts = isAuthenticated ? (homeFeed ?? []) : (recentPosts ?? []);

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {isAuthenticated ? 'Your Feed' : 'Discover'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isAuthenticated ? 'Posts from people you follow' : 'Recent posts from the community'}
          </p>
        </div>
        {isAuthenticated && (
          <Link to="/new-post">
            <Button size="sm" className="bg-blue text-white font-semibold hover:bg-blue-light gap-1.5">
              <PlusSquare className="w-4 h-4" />
              <span className="hidden sm:inline">New Post</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Stories Bar */}
      <StoriesBar />

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <PostSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-blue/10 flex items-center justify-center mx-auto mb-4">
            <Compass className="w-8 h-8 text-blue" />
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">
            {isAuthenticated ? 'Your feed is empty' : 'No posts yet'}
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            {isAuthenticated
              ? 'Follow some users or create your first post to get started!'
              : 'Be the first to share something amazing.'}
          </p>
          {isAuthenticated && (
            <Link to="/new-post">
              <Button className="bg-blue text-white font-semibold hover:bg-blue-light">
                Create First Post
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id.toString()} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
