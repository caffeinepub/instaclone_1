import React from 'react';
import { Camera, Heart, Users, Loader2 } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  const features = [
    { icon: Camera, title: 'Share Moments', desc: 'Post photos with captions and share your world' },
    { icon: Heart, title: 'Like & Comment', desc: 'Engage with posts from people you follow' },
    { icon: Users, title: 'Build Community', desc: 'Follow others and grow your network' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="animate-fade-in max-w-lg mx-auto">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img
              src="/assets/generated/devel-logo.dim_320x80.png"
              alt="Devil India"
              className="h-16 w-auto object-contain"
            />
          </div>

          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            A photo-sharing community built on the Internet Computer.
            <br />
            <span className="text-blue font-medium">Share, connect, and inspire.</span>
          </p>

          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="bg-blue text-white font-bold text-base px-10 py-6 rounded-xl hover:bg-blue-light transition-all blue-glow hover:scale-105 active:scale-95"
          >
            {isLoggingIn ? (
              <><Loader2 className="w-5 h-5 animate-spin mr-2" />Signing in...</>
            ) : (
              'Sign In to Devil India'
            )}
          </Button>

          <p className="mt-4 text-xs text-muted-foreground">
            Powered by Internet Identity — secure, private, no passwords
          </p>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full px-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-card border border-border rounded-xl p-6 text-left hover:border-blue/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-blue/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-blue" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border">
        <p>
          © {new Date().getFullYear()} Devil India. Built with{' '}
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
    </div>
  );
}
