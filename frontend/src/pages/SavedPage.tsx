import React from 'react';
import { Bookmark } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetSavedPosts } from '@/hooks/useQueries';
import PostCard from '@/components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function SavedPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: savedPosts, isLoading } = useGetSavedPosts();

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Bookmark className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">Sign in to see saved posts</h2>
        <p className="text-muted-foreground text-sm">You need to be logged in to view your bookmarks.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Saved Posts</h1>
        <p className="text-sm text-muted-foreground">Your bookmarked posts</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <Skeleton className="w-8 h-8 rounded-full bg-secondary" />
                <Skeleton className="h-3 w-24 bg-secondary" />
              </div>
              <Skeleton className="w-full h-48 bg-secondary" />
              <div className="p-4">
                <Skeleton className="h-3 w-full bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : savedPosts && savedPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {savedPosts.map((post) => (
            <PostCard key={post.id.toString()} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-blue/10 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-blue" />
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">No saved posts yet</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            Bookmark posts you love by tapping the bookmark icon on any post.
          </p>
          <Link to="/">
            <Button className="bg-blue text-white font-semibold hover:bg-blue-light">
              Browse Posts
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
