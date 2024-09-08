"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from './ui/card';
import { useEmojiStore } from '../lib/emojiStore';
import { Download, Heart } from 'lucide-react';
import { Button } from './ui/button';

interface Emoji {
  id: number;
  image_url: string;
  prompt: string;
  likes_count: number;
  creator_user_id: string;
}

export default function EmojiGrid() {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const newEmoji = useEmojiStore((state) => state.newEmoji);

  useEffect(() => {
    fetchEmojis().catch(error => console.error('Error in fetchEmojis:', error));
  }, []);

  useEffect(() => {
    if (newEmoji) {
      setEmojis((prevEmojis) => [newEmoji, ...prevEmojis]);
    }
  }, [newEmoji]);

  const fetchEmojis = async () => {
    try {
      const response = await fetch('/api/emojis');
      const data = await response.json();
      if (Array.isArray(data.emojis)) {
        setEmojis(data.emojis);
      } else {
        console.error('Unexpected data shape:', data);
      }
    } catch (error) {
      console.error('Error fetching emojis:', error);
    }
  };

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

  const handleLike = (emojiId: number) => {
    // Implement like functionality here
    console.log('Like clicked for emoji:', emojiId);
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
                className="text-white"
              >
                <Heart size={20} />
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