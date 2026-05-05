export declare function getDueCards(userId: string): Promise<({
    reviewRecords: {
        id: string;
        createdAt: Date;
        userId: string;
        masteryLevel: number;
        cardId: string;
        easeLevel: number;
        nextReviewAt: Date | null;
        lastReviewAt: Date | null;
        reviewCount: number;
    }[];
    deck: {
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
        description: string | null;
        isPublic: boolean;
    };
} & {
    id: string;
    createdAt: Date;
    deckId: string;
    front: string;
    back: string;
    cardType: string;
    mediaUrls: string | null;
})[]>;
export declare function getDeckReviewCards(deckId: string, userId: string): Promise<({
    reviewRecords: {
        id: string;
        createdAt: Date;
        userId: string;
        masteryLevel: number;
        cardId: string;
        easeLevel: number;
        nextReviewAt: Date | null;
        lastReviewAt: Date | null;
        reviewCount: number;
    }[];
} & {
    id: string;
    createdAt: Date;
    deckId: string;
    front: string;
    back: string;
    cardType: string;
    mediaUrls: string | null;
})[]>;
export declare function submitReview(cardId: string, userId: string, easeLevel: number): Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    masteryLevel: number;
    cardId: string;
    easeLevel: number;
    nextReviewAt: Date | null;
    lastReviewAt: Date | null;
    reviewCount: number;
}>;
export declare function getReviewStats(userId: string): Promise<{
    dueCount: number;
    learningCount: number;
    masteredCount: number;
    totalCards: number;
}>;
export declare function getDailyStats(userId: string): Promise<{
    date: string;
    reviewed: number;
    learned: number;
}[]>;
//# sourceMappingURL=reviewService.d.ts.map