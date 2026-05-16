export declare function createDeck(userId: string, name: string, description?: string): Promise<{
    id: string;
    createdAt: Date;
    name: string;
    userId: string;
    description: string | null;
    isPublic: boolean;
    inviteCode: string | null;
    originalCreatorId: string | null;
}>;
export declare function getUserDecks(userId: string): Promise<({
    user: {
        id: string;
        nickname: string | null;
        avatar: string | null;
    };
    originalCreator: {
        id: string;
        nickname: string | null;
        avatar: string | null;
    } | null;
    _count: {
        cards: number;
    };
} & {
    id: string;
    createdAt: Date;
    name: string;
    userId: string;
    description: string | null;
    isPublic: boolean;
    inviteCode: string | null;
    originalCreatorId: string | null;
})[]>;
export declare function getDeckById(deckId: string, userId: string, filters?: {
    sortBy?: 'createdAt' | 'masteryLevel';
    sortOrder?: 'asc' | 'desc';
    masteryLevel?: number;
}): Promise<({
    cards: ({
        [x: string]: ({
            id: string;
            createdAt: Date;
            userId: string;
            masteryLevel: number;
            cardId: string;
            easeLevel: number;
            nextReviewAt: Date | null;
            lastReviewAt: Date | null;
            reviewCount: number;
        } | {
            id: string;
            createdAt: Date;
            userId: string;
            masteryLevel: number;
            cardId: string;
            easeLevel: number;
            nextReviewAt: Date | null;
            lastReviewAt: Date | null;
            reviewCount: number;
        })[] | ({
            id: string;
            createdAt: Date;
            userId: string;
            cardId: string;
            tagId: string;
        } | {
            id: string;
            createdAt: Date;
            userId: string;
            cardId: string;
            tagId: string;
        })[] | {
            id: string;
            createdAt: Date;
            userId: string;
            masteryLevel: number;
            cardId: string;
            easeLevel: number;
            nextReviewAt: Date | null;
            lastReviewAt: Date | null;
            reviewCount: number;
        }[] | {
            id: string;
            createdAt: Date;
            userId: string;
            cardId: string;
            tagId: string;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    } & {
        id: string;
        createdAt: Date;
        originalCreatorId: string | null;
        deckId: string;
        front: string;
        back: string;
        cardType: string;
        mediaUrls: string | null;
    })[];
} & {
    id: string;
    createdAt: Date;
    name: string;
    userId: string;
    description: string | null;
    isPublic: boolean;
    inviteCode: string | null;
    originalCreatorId: string | null;
}) | null>;
export declare function updateDeck(deckId: string, userId: string, data: {
    name?: string;
    description?: string;
}): Promise<import(".prisma/client").Prisma.BatchPayload>;
export declare function deleteDeck(deckId: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
export declare function getDeckStats(deckId: string, userId: string): Promise<{
    totalCards: number;
    learningCount: number;
    masteredCount: number;
    notLearnedCount: number;
    difficultCount: number;
    dueReviewCount: number;
    todayNewCount: number;
    todayReviewedCount: number;
    masteredPercent: number;
    estimatedMinutes: number;
}>;
export declare function toggleDeckPublic(deckId: string, userId: string): Promise<{
    id: string;
    createdAt: Date;
    name: string;
    userId: string;
    description: string | null;
    isPublic: boolean;
    inviteCode: string | null;
    originalCreatorId: string | null;
}>;
export declare function getDeckShareInfo(deckId: string, userId: string): Promise<{
    shareUrl: string | null;
    id: string;
    name: string;
    isPublic: boolean;
    inviteCode: string | null;
}>;
//# sourceMappingURL=deckService.d.ts.map