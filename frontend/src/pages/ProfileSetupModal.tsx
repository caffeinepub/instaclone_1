import React, { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSaveCallerUserProfile } from '@/hooks/useQueries';

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const saveProfileMutation = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    await saveProfileMutation.mutateAsync({
      displayName: displayName.trim(),
      bio: bio.trim(),
      avatarUrl: '',
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="bg-card border-border text-foreground max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue" />
            </div>
            <DialogTitle className="font-display text-lg">Welcome to Devil India!</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            Set up your profile to get started. You can always update this later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="setup-name" className="text-sm text-muted-foreground">
              Display Name <span className="text-blue">*</span>
            </Label>
            <Input
              id="setup-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How should we call you?"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              autoFocus
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="setup-bio" className="text-sm text-muted-foreground">
              Bio <span className="text-muted-foreground/60">(optional)</span>
            </Label>
            <Textarea
              id="setup-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people a bit about yourself..."
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={!displayName.trim() || saveProfileMutation.isPending}
            className="w-full bg-blue text-white font-bold hover:bg-blue-light py-5 text-base blue-glow"
          >
            {saveProfileMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating profile...</>
            ) : (
              'Get Started on Devil India'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
