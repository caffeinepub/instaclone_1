import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Grid3X3, Settings, ArrowLeft } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import {
  useGetUserProfile,
  useGetCallerUserProfile,
  useGetUserPosts,
  useGetFollowerCount,
  useGetFollowingCount,
} from '@/hooks/useQueries';
import UserAvatar from '@/components/UserAvatar';
import PostCard from '@/components/PostCard';
import FollowButton from '@/components/FollowButton';
import EditProfileModal from '@/components/EditProfileModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="font-display font-bold text-xl text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { principalId } = useParams({ from: '/profile/$principalId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [editOpen, setEditOpen] = useState(false);

  const currentPrincipal = identity?.getPrincipal().toString() ?? null;
  const isOwnProfile = currentPrincipal === principalId;

  const { data: profile, isLoading: profileLoading } = useGetUserProfile(principalId);
  const { data: currentProfile } = useGetCallerUserProfile();
  const { data: posts, isLoading: postsLoading } = useGetUserPosts(principalId);
  const { data: followerCount } = useGetFollowerCount(principalId);
  const { data: followingCount } = useGetFollowingCount(principalId);

  const displayProfile = isOwnProfile ? currentProfile : profile;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back */}
      {!isOwnProfile && (
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      {/* Profile Header */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        {profileLoading ? (
          <div className="flex gap-6 items-center">
            <Skeleton className="w-24 h-24 rounded-full bg-secondary" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-40 bg-secondary" />
              <Skeleton className="h-4 w-64 bg-secondary" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <UserAvatar
              avatarUrl={displayProfile?.avatarUrl}
              displayName={displayProfile?.displayName}
              size="xl"
              className="border-2 border-blue/30"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    {displayProfile?.displayName || 'Anonymous'}
                  </h1>
                  {displayProfile?.bio && (
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-sm">
                      {displayProfile.bio}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isOwnProfile ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditOpen(true)}
                      className="border-border text-foreground hover:bg-secondary gap-1.5"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Edit Profile
                    </Button>
                  ) : (
                    <FollowButton
                      targetPrincipal={principalId}
                      currentPrincipal={currentPrincipal}
                    />
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <StatBlock label="Posts" value={posts?.length ?? 0} />
                <StatBlock label="Followers" value={Number(followerCount ?? 0)} />
                <StatBlock label="Following" value={Number(followingCount ?? 0)} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Posts Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Grid3X3 className="w-4 h-4 text-blue" />
          <h2 className="font-display font-semibold text-foreground">Posts</h2>
        </div>

        {postsLoading ? (
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-square bg-secondary rounded-sm" />
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {posts.map((post) => (
              <PostCard key={post.id.toString()} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Grid3X3 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No posts yet</p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          currentProfile={displayProfile ?? null}
        />
      )}
    </div>
  );
}
