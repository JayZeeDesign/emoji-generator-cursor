"use client";

import { useEmojiStore } from '../lib/emojiStore';
import Image from 'next/image';
import { Card } from './ui/card';
import { Download, Heart } from 'lucide-react';

export default function EmojiGrid() {
  const { emojis, likeEmoji } = useEmojiStore();

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'emoji.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading emoji:', error);
    }
  };

  const handleLike = (id: string) => {
    likeEmoji(id);
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
              <Heart size={20} fill={emoji.likedByUser ? 'red' : 'none'} color={emoji.likedByUser ? 'red' : 'black'} />
            </button>
          </div>
          <p className="text-center mt-2">{emoji.likes} likes</p>
        </Card>
      ))}
    </div>
  );
}