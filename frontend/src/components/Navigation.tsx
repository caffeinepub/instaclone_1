import React from 'react';
import { Link, useNavigate, useLocation } from '@tanstack/react-router';
import { Home, PlusSquare, User, LogOut, Loader2, Compass, Bookmark } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '@/hooks/useQueries';
import UserAvatar from './UserAvatar';
import NotificationBell from './NotificationBell';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationProps {
  userPrincipal?: string;
}

export default function Navigation({ userPrincipal }: NavigationProps) {
  const { clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  const isLoggingOut = loginStatus === 'logging-in';

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const handleProfileClick = () => {
    if (userPrincipal) {
      navigate({ to: '/profile/$principalId', params: { principalId: userPrincipal } });
    }
  };

  const isProfileActive =
    userPrincipal && location.pathname === `/profile/${userPrincipal}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-navy/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img
            src="/assets/generated/devel-logo.dim_320x80.png"
            alt="Devil India"
            className="h-7 w-auto object-contain"
          />
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {/* Home */}
          <Link
            to="/"
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              location.pathname === '/'
                ? 'text-blue bg-blue/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          {/* Explore — always visible */}
          <Link
            to="/explore"
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              location.pathname.startsWith('/explore')
                ? 'text-blue bg-blue/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Explore</span>
          </Link>

          {/* New Post — authenticated only */}
          {isAuthenticated && (
            <Link
              to="/new-post"
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname.startsWith('/new-post')
                  ? 'text-blue bg-blue/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <PlusSquare className="w-4 h-4" />
              <span className="hidden sm:inline">New Post</span>
            </Link>
          )}

          {/* Notifications — authenticated only */}
          {isAuthenticated && <NotificationBell />}

          {/* Saved — authenticated only */}
          {isAuthenticated && (
            <Link
              to="/saved"
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname.startsWith('/saved')
                  ? 'text-blue bg-blue/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">Saved</span>
            </Link>
          )}

          {/* Profile nav link */}
          {isAuthenticated && (
            <button
              onClick={handleProfileClick}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isProfileActive
                  ? 'text-blue bg-blue/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </button>
          )}
        </nav>

        {/* User + Logout */}
        <div className="flex items-center gap-2">
          {profile && (
            <button
              onClick={handleProfileClick}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <UserAvatar
                avatarUrl={profile.avatarUrl}
                displayName={profile.displayName}
                size="sm"
              />
              <span className="hidden md:block text-sm font-medium text-foreground truncate max-w-[120px]">
                {profile.displayName}
              </span>
            </button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-8 h-8"
            title="Sign out"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
