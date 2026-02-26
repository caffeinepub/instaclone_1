import React from 'react';
import { Bell } from 'lucide-react';
import { Link, useLocation } from '@tanstack/react-router';
import { useGetUnreadNotificationCount } from '@/hooks/useQueries';
import { cn } from '@/lib/utils';

export default function NotificationBell() {
  const location = useLocation();
  const { data: unreadCount } = useGetUnreadNotificationCount();

  const count = Number(unreadCount ?? BigInt(0));
  const isActive = location.pathname.startsWith('/notifications');

  return (
    <Link
      to="/notifications"
      className={cn(
        'relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'text-blue bg-blue/10'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
      )}
    >
      <Bell className="w-4 h-4" />
      <span className="hidden sm:inline">Alerts</span>
      {count > 0 && (
        <span className="absolute top-1 right-1 sm:right-auto sm:left-6 min-w-[16px] h-4 px-1 rounded-full bg-blue text-white text-[10px] font-bold flex items-center justify-center leading-none">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
