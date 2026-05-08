export interface User {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Deck {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  inviteCode?: string | null;
  createdAt: string;
  cardCount?: number;
  _count?: { cards: number };
  cards?: Card[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  isPreset: boolean;
  createdAt: string;
  count?: number;
}

export interface CardTag {
  id: string;
  cardId: string;
  tagId: string;
  userId: string;
  createdAt: string;
  tag: Tag;
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  cardType: 'text' | 'rich_text' | 'image' | 'audio';
  mediaUrls?: string[];
  createdAt: string;
  cardTags?: CardTag[];
  reviewRecord?: ReviewRecord;
}

export interface ReviewRecord {
  id: string;
  cardId: string;
  userId: string;
  easeLevel: number;
  nextReviewAt?: string;
  lastReviewAt?: string;
  reviewCount: number;
  masteryLevel: number;
  createdAt: string;
}
