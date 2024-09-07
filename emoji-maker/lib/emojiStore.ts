import { create } from 'zustand';

interface Emoji {
  id: string;
  url: string;
  likes: number;
}

interface EmojiStore {
  emojis: Emoji[];
  addEmoji: (url: string) => void;
}

export const useEmojiStore = create<EmojiStore>((set) => ({
  emojis: [],
  addEmoji: (url: string) => set((state) => ({
    emojis: [...state.emojis, { id: Date.now().toString(), url, likes: 0 }]
  })),
}));