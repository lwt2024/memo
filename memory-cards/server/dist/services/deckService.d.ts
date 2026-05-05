export declare function createDeck(userId: string, name: string, description?: string): Promise<{
    id: string;
    createdAt: Date;
    name: string;
    userId: string;
    description: string | null;
    isPublic: boolean;
}>;
export declare function getUserDecks(userId: string): Promise<({
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
}) | null>;
export declare function updateDeck(deckId: string, userId: string, data: {
    name?: string;
    description?: string;
}): Promise<import(".prisma/client").Prisma.BatchPayload>;
export declare function deleteDeck(deckId: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
//# sourceMappingURL=deckService.d.ts.map