import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ImageIcon, Loader2, ArrowLeft } from 'lucide-react';
import { useCreatePost } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function NewPostPage() {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const createPostMutation = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    await createPostMutation.mutateAsync({
      imageUrl: imageUrl.trim(),
      caption: caption.trim(),
    });
    navigate({ to: '/' });
  };

  const hasValidImage = imageUrl.trim() !== '' && !previewError;

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Back button */}
      <button
        onClick={() => navigate({ to: '/' })}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to feed
      </button>

      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Create New Post</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image URL */}
        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="text-sm text-muted-foreground">
            Image URL <span className="text-blue">*</span>
          </Label>
          <Input
            id="imageUrl"
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

        {/* Image Preview */}
        <div className="rounded-xl overflow-hidden border border-border bg-secondary aspect-square flex items-center justify-center">
          {imageUrl.trim() && !previewError ? (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => setPreviewError(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground p-8">
              <ImageIcon className="w-12 h-12 opacity-40" />
              <p className="text-sm text-center">
                {previewError ? 'Could not load image from this URL' : 'Enter an image URL to see a preview'}
              </p>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <Label htmlFor="caption" className="text-sm text-muted-foreground">
            Caption
          </Label>
          <Textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
            rows={3}
          />
        </div>

        <Button
          type="submit"
          disabled={!hasValidImage || createPostMutation.isPending}
          className="w-full bg-blue text-white font-bold hover:bg-blue-light py-5 text-base"
        >
          {createPostMutation.isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin mr-2" />Sharing...</>
          ) : (
            'Share Post'
          )}
        </Button>
      </form>
    </div>
  );
}
