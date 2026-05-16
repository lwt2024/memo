export declare function createCard(deckId: string, userId: string, front: string, back: string, cardType?: string, mediaUrls?: string[]): Promise<{
    id: string;
    createdAt: Date;
    originalCreatorId: string | null;
    deckId: string;
    front: string;
    back: string;
    cardType: string;
    mediaUrls: string | null;
}>;
export declare function getDeckCards(deckId: string, userId: string): Promise<{
    id: string;
    createdAt: Date;
    originalCreatorId: string | null;
    deckId: string;
    front: string;
    back: string;
    cardType: string;
    mediaUrls: string | null;
}[]>;
export declare function updateCard(cardId: string, userId: string, data: {
    front?: string;
    back?: string;
    cardType?: string;
    mediaUrls?: string[];
}): Promise<{
    id: string;
    createdAt: Date;
    originalCreatorId: string | null;
    deckId: string;
    front: string;
    back: string;
    cardType: string;
    mediaUrls: string | null;
}>;
export declare function deleteCard(cardId: string, userId: string): Promise<{
    id: string;
    createdAt: Date;
    originalCreatorId: string | null;
    deckId: string;
    front: string;
    back: string;
    cardType: string;
    mediaUrls: string | null;
}>;
//# sourceMappingURL=cardService.d.ts.map