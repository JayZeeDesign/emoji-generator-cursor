import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Emoji {
  id: string;
  url: string;
  likes: number;
  likedByUser: boolean;
}

interface EmojiStore {
  emojis: Emoji[];
  addEmoji: (url: string) => void;
  likeEmoji: (id: string) => void;
}

export const useEmojiStore = create<EmojiStore>()(
  persist(
    (set) => ({
      emojis: [],
      addEmoji: (url: string) =>
        set((state) => ({
          emojis: [...state.emojis, { id: Date.now().toString(), url, likes: 0, likedByUser: false }],
        })),
      likeEmoji: (id: string) =>
        set((state) => ({
          emojis: state.emojis.map((emoji) =>
            emoji.id === id
              ? { ...emoji, likes: emoji.likedByUser ? emoji.likes - 1 : emoji.likes + 1, likedByUser: !emoji.likedByUser }
              : emoji
          ),
        })),
    }),
    {
      name: 'emoji-storage',
    }
  )
);