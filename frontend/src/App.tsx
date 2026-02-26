import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '@/hooks/useQueries';
import Navigation from '@/components/Navigation';
import LandingPage from '@/pages/LandingPage';
import ProfileSetupModal from '@/pages/ProfileSetupModal';
import HomePage from '@/pages/HomePage';
import NewPostPage from '@/pages/NewPostPage';
import ProfilePage from '@/pages/ProfilePage';
import PostDetailPage from '@/pages/PostDetailPage';
import ExplorePage from '@/pages/ExplorePage';
import NotificationsPage from '@/pages/NotificationsPage';
import SavedPage from '@/pages/SavedPage';

// ─── Layout ────────────────────────────────────────────────────────────────────

function AppLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const currentPrincipal = identity?.getPrincipal().toString();

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  // Show profile setup modal when authenticated but no profile exists
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/generated/devel-logo.dim_320x80.png"
            alt="Devel"
            className="h-10 w-auto object-contain opacity-80"
          />
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-blue animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation userPrincipal={currentPrincipal} />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border mt-8">
        <p>
          © {new Date().getFullYear()} Devel. Built with{' '}
          <span className="text-blue">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
      <ProfileSetupModal open={showProfileSetup} />
    </div>
  );
}

// ─── Routes ────────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: AppLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const newPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/new-post',
  component: NewPostPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$principalId',
  component: ProfilePage,
});

const postDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/post/$postId',
  component: PostDetailPage,
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/explore',
  component: ExplorePage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: NotificationsPage,
});

const savedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/saved',
  component: SavedPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  newPostRoute,
  profileRoute,
  postDetailRoute,
  exploreRoute,
  notificationsRoute,
  savedRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return <RouterProvider router={router} />;
}
