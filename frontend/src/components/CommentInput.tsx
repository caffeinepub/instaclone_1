import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAddComment } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentInputProps {
  postId: bigint;
}

export default function CommentInput({ postId }: CommentInputProps) {
  const [text, setText] = useState('');
  const addCommentMutation = useAddComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    await addCommentMutation.mutateAsync({ postId, text: trimmed });
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a comment..."
        className="flex-1 min-h-[40px] max-h-[120px] resize-none bg-secondary border-border text-foreground placeholder:text-muted-foreground text-sm"
        rows={1}
        disabled={addCommentMutation.isPending}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!text.trim() || addCommentMutation.isPending}
        className="bg-amber text-charcoal hover:bg-amber-light flex-shrink-0 h-10 w-10"
      >
        {addCommentMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </form>
  );
}
