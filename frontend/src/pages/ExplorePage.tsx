import React, { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useSearchUsers, useGetAllPostsForExplore } from '@/hooks/useQueries';
import PostCard from '@/components/PostCard';
import FollowButton from '@/components/FollowButton';
import UserAvatar from '@/components/UserAvatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const currentPrincipal = identity?.getPrincipal().toString() ?? null;

  const { data: searchResults, isLoading: searchLoading } = useSearchUsers(searchTerm);
  const { data: explorePosts, isLoading: postsLoading } = useGetAllPostsForExplore();

  const showSearch = searchTerm.trim().length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Explore</h1>
        <p className="text-sm text-muted-foreground">Discover people and posts</p>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users by name..."
          className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Search Results */}
      {showSearch && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue" />
            Users
          </h2>
          {searchLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                  <Skeleton className="w-10 h-10 rounded-full bg-secondary" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32 bg-secondary" />
                    <Skeleton className="h-3 w-48 bg-secondary" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map(([principal, profile]) => (
                <div
                  key={principal.toString()}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-blue/30 transition-colors"
                >
                  <button
                    onClick={() =>
                      navigate({
                        to: '/profile/$principalId',
                        params: { principalId: principal.toString() },
                      })
                    }
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <UserAvatar
                      avatarUrl={profile.avatarUrl}
                      displayName={profile.displayName}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {profile.displayName}
                      </p>
                      {profile.bio && (
                        <p className="text-xs text-muted-foreground truncate">{profile.bio}</p>
                      )}
                    </div>
                  </button>
                  <FollowButton
                    targetPrincipal={principal.toString()}
                    currentPrincipal={currentPrincipal}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-card border border-border rounded-xl">
              <p className="text-muted-foreground text-sm">No users found for "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}

      {/* Posts Grid */}
      <div>
        <h2 className="font-display font-semibold text-foreground mb-3">
          {showSearch ? 'Recent Posts' : 'Discover Posts'}
        </h2>
        {postsLoading ? (
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
        ) : explorePosts && explorePosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {explorePosts.map((post) => (
              <PostCard key={post.id.toString()} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <p className="text-muted-foreground text-sm">No posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
