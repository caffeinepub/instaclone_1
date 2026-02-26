import React, { useState } from 'react';
import { Loader2, ImageIcon } from 'lucide-react';
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
import { useCreateStory } from '@/hooks/useQueries';

interface CreateStoryModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateStoryModal({ open, onClose }: CreateStoryModalProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const createStoryMutation = useCreateStory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim() || previewError) return;
    await createStoryMutation.mutateAsync(imageUrl.trim());
    setImageUrl('');
    setPreviewError(false);
    onClose();
  };

  const handleClose = () => {
    setImageUrl('');
    setPreviewError(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-card border-border text-foreground max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Add Story</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="storyImageUrl" className="text-sm text-muted-foreground">
              Image URL <span className="text-blue">*</span>
            </Label>
            <Input
              id="storyImageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setPreviewError(false);
              }}
              placeholder="https://example.com/photo.jpg"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          {/* Preview */}
          <div className="rounded-xl overflow-hidden border border-border bg-secondary aspect-square flex items-center justify-center">
            {imageUrl.trim() && !previewError ? (
              <img
                src={imageUrl}
                alt="Story preview"
                className="w-full h-full object-cover"
                onError={() => setPreviewError(true)}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-6">
                <ImageIcon className="w-10 h-10 opacity-40" />
                <p className="text-xs text-center">
                  {previewError ? 'Could not load image' : 'Enter URL to preview'}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!imageUrl.trim() || previewError || createStoryMutation.isPending}
              className="bg-blue text-white font-semibold hover:bg-blue-light"
            >
              {createStoryMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sharing...</>
              ) : (
                'Share Story'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
