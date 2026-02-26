import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetStoryAvatars, useGetUserProfile } from '@/hooks/useQueries';
import UserAvatar from './UserAvatar';
import CreateStoryModal from './CreateStoryModal';
import StoryViewer from './StoryViewer';
import { Principal } from '@dfinity/principal';

function StoryAvatar({
  principal,
  avatarUrl,
  onClick,
}: {
  principal: Principal;
  avatarUrl: string;
  onClick: () => void;
}) {
  const { data: profile } = useGetUserProfile(principal.toString());

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
    >
      <div className="p-0.5 rounded-full bg-gradient-to-tr from-blue to-blue-light">
        <div className="p-0.5 rounded-full bg-background">
          <UserAvatar
            avatarUrl={avatarUrl || profile?.avatarUrl}
            displayName={profile?.displayName}
            size="md"
            className="ring-0"
          />
        </div>
      </div>
      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[56px]">
        {profile?.displayName || 'User'}
      </span>
    </button>
  );
}

export default function StoriesBar() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: storyAvatars } = useGetStoryAvatars();
  const [createOpen, setCreateOpen] = useState(false);
  const [viewerPrincipal, setViewerPrincipal] = useState<Principal | null>(null);

  const hasStories = storyAvatars && storyAvatars.length > 0;

  if (!isAuthenticated && !hasStories) return null;

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <div className="flex gap-4 overflow-x-auto scrollbar-thin pb-1">
          {/* Add Story button */}
          {isAuthenticated && (
            <button
              onClick={() => setCreateOpen(true)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
            >
              <div className="w-14 h-14 rounded-full bg-secondary border-2 border-dashed border-blue/40 flex items-center justify-center group-hover:border-blue transition-colors">
                <Plus className="w-5 h-5 text-blue" />
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Add Story
              </span>
            </button>
          )}

          {/* Story avatars */}
          {storyAvatars?.map(([principal, avatarUrl]) => (
            <StoryAvatar
              key={principal.toString()}
              principal={principal}
              avatarUrl={avatarUrl}
              onClick={() => setViewerPrincipal(principal)}
            />
          ))}
        </div>
      </div>

      <CreateStoryModal open={createOpen} onClose={() => setCreateOpen(false)} />

      {viewerPrincipal && (
        <StoryViewer
          authorPrincipal={viewerPrincipal}
          onClose={() => setViewerPrincipal(null)}
        />
      )}
    </>
  );
}
