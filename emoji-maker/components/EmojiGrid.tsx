"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card } from './ui/card';
import { useEmojiStore } from '../lib/emojiStore';
import { Download, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@clerk/nextjs';

interface Emoji {
  id: number;
  image_url: string;
  prompt: string;
  likes_count: number;
  creator_user_id: string;
  isLiked?: boolean;
}

export default function EmojiGrid() {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const newEmoji = useEmojiStore((state) => state.newEmoji);
  const { isSignedIn, userId } = useAuth();

  const fetchEmojis = useCallback(async () => {
    console.log('Fetching emojis');
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/emojis?t=${timestamp}`);
      const data = await response.json();
      console.log('Fetched emojis:', data);
      if (Array.isArray(data.emojis)) {
        if (isSignedIn && userId) {
          console.log('Fetching user likes');
          const likesResponse = await fetch(`/api/user-likes?userId=${userId}&t=${timestamp}`);
          const likesData = await likesResponse.json();
          console.log('User likes:', likesData);
          const likedEmojiIds = new Set(likesData.likes.map((like: { emoji_id: number }) => like.emoji_id));
          
          setEmojis(data.emojis.map((emoji: Emoji) => ({
            ...emoji,
            isLiked: likedEmojiIds.has(emoji.id)
          })));
        } else {
          setEmojis(data.emojis.map((emoji: Emoji) => ({ ...emoji, isLiked: false })));
        }
      } else {
        console.error('Unexpected data shape:', data);
      }
    } catch (error) {
      console.error('Error fetching emojis:', error);
    }
  }, [isSignedIn, userId]);

  useEffect(() => {
    fetchEmojis();
  }, [fetchEmojis]);

  useEffect(() => {
    if (newEmoji) {
      setEmojis((prevEmojis) => [{ ...newEmoji, isLiked: false }, ...prevEmojis]);
    }
  }, [newEmoji]);

  const handleDownload = (imageUrl: string, prompt: string) => {
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `emoji-${prompt}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Error downloading image:', error));
  };

  const handleLike = async (emojiId: number) => {
    if (!isSignedIn) {
      console.log('User not signed in, cannot like emoji');
      return;
    }

    try {
      console.log('Sending like request for emoji:', emojiId);
      const response = await fetch('/api/like-emoji', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emojiId }),
      });
      const data = await response.json();
      console.log('Received data from like-emoji:', data);
      if (data.success) {
        setEmojis(prevEmojis =>
          prevEmojis.map(emoji =>
            emoji.id === emojiId
              ? { 
                  ...emoji, 
                  likes_count: data.likes_count,
                  isLiked: data.action === 'liked'
                }
              : emoji
          )
        );
        console.log('Updated emojis after like:', emojis);
      } else {
        throw new Error(data.error || 'Failed to update likes');
      }
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {emojis.map((emoji) => (
        <Card key={emoji.id} className="p-2 relative group">
          <div className="relative">
            <Image
              src={emoji.image_url}
              alt={emoji.prompt}
              width={100}
              height={100}
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDownload(emoji.image_url, emoji.prompt)}
                className="text-white mr-2"
              >
                <Download size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleLike(emoji.id)}
                className={`text-white ${emoji.isLiked ? 'bg-red-500' : ''}`}
              >
                <Heart size={20} fill={emoji.isLiked ? 'currentColor' : 'none'} />
              </Button>
            </div>
          </div>
          <div className="mt-2 flex justify-between items-center text-sm">
            <p className="truncate flex-grow">{emoji.prompt}</p>
            <span className="ml-2 flex items-center">
              <Heart size={14} className="mr-1" /> {emoji.likes_count}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}