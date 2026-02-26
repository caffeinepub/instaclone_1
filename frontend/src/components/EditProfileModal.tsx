import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateProfile } from '@/hooks/useQueries';
import type { UserProfile } from '../backend';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  currentProfile: UserProfile | null;
}

export default function EditProfileModal({ open, onClose, currentProfile }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const updateProfileMutation = useUpdateProfile();

  useEffect(() => {
    if (currentProfile) {
      setDisplayName(currentProfile.displayName);
      setBio(currentProfile.bio);
      setAvatarUrl(currentProfile.avatarUrl);
    }
  }, [currentProfile, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    await updateProfileMutation.mutateAsync({
      displayName: displayName.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim(),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="displayName" className="text-sm text-muted-foreground">Display Name *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-sm text-muted-foreground">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avatarUrl" className="text-sm text-muted-foreground">Avatar URL</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!displayName.trim() || updateProfileMutation.isPending}
              className="bg-blue text-white font-semibold hover:bg-blue-light"
            >
              {updateProfileMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
