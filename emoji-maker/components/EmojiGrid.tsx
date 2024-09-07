"use client";

import { useEmojiStore } from '../lib/emojiStore';
import Image from 'next/image';
import { Card } from './ui/card';
import { Download, Heart } from 'lucide-react';

export default function EmojiGrid() {
  const emojis = useEmojiStore((state) => state.emojis);

  const handleDownload = (url: string) => {
    // TODO: Implement download functionality
    console.log('Downloading:', url);
  };

  const handleLike = (id: string) => {
    // TODO: Implement like functionality
    console.log('Liking:', id);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {emojis.map((emoji) => (
        <Card key={emoji.id} className="p-2 relative group">
          <Image src={emoji.url} alt="Emoji" width={128} height={128} className="w-full h-auto" />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => handleDownload(emoji.url)} className="p-2 bg-white rounded-full mr-2">
              <Download size={20} />
            </button>
            <button onClick={() => handleLike(emoji.id)} className="p-2 bg-white rounded-full">
              <Heart size={20} />
            </button>
          </div>
          <p className="text-center mt-2">{emoji.likes} likes</p>
        </Card>
      ))}
    </div>
  );
}