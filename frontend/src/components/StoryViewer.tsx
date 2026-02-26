import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { useGetActiveStories, useGetUserProfile } from '@/hooks/useQueries';
import UserAvatar from './UserAvatar';
import { formatRelativeTime } from '@/lib/utils';

interface StoryViewerProps {
  authorPrincipal: Principal;
  onClose: () => void;
}

export default function StoryViewer({ authorPrincipal, onClose }: StoryViewerProps) {
  const { data: activeStories } = useGetActiveStories();
  const { data: authorProfile } = useGetUserProfile(authorPrincipal.toString());
  const [storyIndex, setStoryIndex] = useState(0);

  // Find stories for this author
  const authorEntry = activeStories?.find(
    ([p]) => p.toString() === authorPrincipal.toString()
  );
  const stories = authorEntry ? authorEntry[1] : [];

  const currentStory = stories[storyIndex];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setStoryIndex((i) => Math.min(i + 1, stories.length - 1));
      if (e.key === 'ArrowLeft') setStoryIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, stories.length]);

  if (!currentStory) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress indicators */}
        {stories.length > 1 && (
          <div className="flex gap-1 mb-3">
            {stories.map((_, i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-colors ${
                  i <= storyIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}

        {/* Author info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-blue to-blue-light">
            <div className="p-0.5 rounded-full bg-black">
              <UserAvatar
                avatarUrl={authorProfile?.avatarUrl}
                displayName={authorProfile?.displayName}
                size="sm"
              />
            </div>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              {authorProfile?.displayName || 'User'}
            </p>
            <p className="text-white/60 text-xs">
              {formatRelativeTime(currentStory.timestamp)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story image */}
        <div className="relative rounded-2xl overflow-hidden aspect-[9/16] bg-secondary">
          <img
            src={currentStory.imageUrl}
            alt="Story"
            className="w-full h-full object-cover"
          />

          {/* Navigation overlays */}
          {storyIndex > 0 && (
            <button
              onClick={() => setStoryIndex((i) => i - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {storyIndex < stories.length - 1 && (
            <button
              onClick={() => setStoryIndex((i) => i + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
