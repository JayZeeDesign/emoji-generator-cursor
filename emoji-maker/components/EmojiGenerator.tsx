"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { useEmojiStore } from '../lib/emojiStore';

export default function EmojiGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generatedEmoji, setGeneratedEmoji] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const addEmoji = useEmojiStore((state) => state.addEmoji);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-emoji', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      setGeneratedEmoji(data.emoji);
      addEmoji(data.emoji); // Add the new emoji to the store
    } catch (error) {
      console.error('Error generating emoji:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt for your emoji"
          className="w-full"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Emoji'
          )}
        </Button>
      </form>
      {generatedEmoji && (
        <div className="mt-4 flex justify-center">
          <Image src={generatedEmoji} alt="Generated Emoji" width={256} height={256} />
        </div>
      )}
    </Card>
  );
}