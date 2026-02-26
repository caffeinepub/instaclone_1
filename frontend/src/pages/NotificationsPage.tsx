import React, { useEffect } from 'react';
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetNotifications, useMarkNotificationsRead, useGetUserProfile } from '@/hooks/useQueries';
import { NotificationEventType, type Notification } from '../backend';
import UserAvatar from '@/components/UserAvatar';
import { formatRelativeTime } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function NotificationItem({ notification }: { notification: Notification }) {
  const navigate = useNavigate();
  const actorPrincipal = notification.recipient.toString();
  // We show the recipient's profile as a placeholder; in a real app we'd track the actor
  const { data: profile } = useGetUserProfile(actorPrincipal);

  const getIcon = () => {
    switch (notification.eventType) {
      case NotificationEventType.postLiked:
        return <Heart className="w-4 h-4 text-blue fill-blue" />;
      case NotificationEventType.postCommented:
        return <MessageCircle className="w-4 h-4 text-blue" />;
      case NotificationEventType.userFollowed:
        return <UserPlus className="w-4 h-4 text-blue" />;
    }
  };

  const getMessage = () => {
    switch (notification.eventType) {
      case NotificationEventType.postLiked:
        return 'Someone liked your post';
      case NotificationEventType.postCommented:
        return 'Someone commented on your post';
      case NotificationEventType.userFollowed:
        return 'Someone started following you';
    }
  };

  const handleClick = () => {
    if (notification.postId !== undefined && notification.postId !== null) {
      navigate({ to: `/post/${notification.postId.toString()}` });
    }
  };

  const isClickable = notification.postId !== undefined && notification.postId !== null;

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      className={cn(
        'flex items-center gap-3 p-4 bg-card border border-border rounded-xl transition-colors',
        !notification.seen && 'border-blue/30 bg-blue/5',
        isClickable && 'cursor-pointer hover:border-blue/40'
      )}
    >
      <div className="relative flex-shrink-0">
        <UserAvatar
          avatarUrl={profile?.avatarUrl}
          displayName={profile?.displayName}
          size="sm"
        />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center">
          {getIcon()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{getMessage()}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatRelativeTime(notification.timestamp)}
        </p>
      </div>
      {!notification.seen && (
        <div className="w-2 h-2 rounded-full bg-blue flex-shrink-0" />
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const navigate = useNavigate();

  const { data: notifications, isLoading } = useGetNotifications();
  const markReadMutation = useMarkNotificationsRead();

  useEffect(() => {
    if (isAuthenticated && notifications && notifications.length > 0) {
      const hasUnread = notifications.some((n) => !n.seen);
      if (hasUnread) {
        markReadMutation.mutate();
      }
    }
  }, [isAuthenticated, notifications]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Bell className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">Sign in to see notifications</h2>
        <p className="text-muted-foreground text-sm">You need to be logged in to view your notifications.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Notifications</h1>
        <p className="text-sm text-muted-foreground">Stay up to date with your activity</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
              <Skeleton className="w-10 h-10 rounded-full bg-secondary" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-48 bg-secondary" />
                <Skeleton className="h-3 w-24 bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications && notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((notification, i) => (
            <NotificationItem key={i} notification={notification} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-blue/10 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-blue" />
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">All caught up!</h2>
          <p className="text-muted-foreground text-sm">No notifications yet. Start engaging with the community!</p>
        </div>
      )}
    </div>
  );
}
