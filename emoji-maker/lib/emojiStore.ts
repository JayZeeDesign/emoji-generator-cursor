import { create } from 'zustand';

interface Emoji {
  id: number;
  image_url: string;
  prompt: string;
  likes_count: number;
  creator_user_id: string;
}

interface EmojiStore {
  newEmoji: Emoji | null;
  addNewEmoji: (emoji: Emoji) => void;
}

export const useEmojiStore = create<EmojiStore>((set) => ({
  newEmoji: null,
  addNewEmoji: (emoji) => set({ newEmoji: emoji }),
}));