export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
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
  createdAt: string;
  cardCount?: number;
  _count?: { cards: number };
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  cardType: 'text' | 'rich_text' | 'image' | 'audio';
  mediaUrls?: string[];
  createdAt: string;
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
