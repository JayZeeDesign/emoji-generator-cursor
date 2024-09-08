"use client";

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Loader2 } from 'lucide-react';
import { useEmojiStore } from '../lib/emojiStore';

export default function EmojiGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { isSignedIn } = useAuth();
  const addNewEmoji = useEmojiStore((state) => state.addNewEmoji);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting emoji generation form');
    if (!isSignedIn) {
      console.log('User not signed in');
      // Handle not signed in state
      return;
    }
    setIsGenerating(true);
    try {
      console.log('Sending request to generate emoji');
      const response = await fetch('/api/generate-emoji', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      console.log('Received response:', data);
      if (data.success) {
        console.log('Emoji generated successfully');
        addNewEmoji(data.emoji);
        setPrompt('');
      } else {
        throw new Error(data.error || 'Failed to generate emoji');
      }
    } catch (error) {
      console.error('Error generating emoji:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6 mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter emoji prompt"
          disabled={isGenerating}
          className="w-full"
        />
        <Button type="submit" disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate Emoji'}
        </Button>
      </form>
      {isGenerating && (
        <div className="mt-4 flex justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </div>
      )}
    </Card>
  );
}