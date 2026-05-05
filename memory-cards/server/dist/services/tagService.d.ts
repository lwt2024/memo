export declare function ensurePresetTags(userId: string): Promise<void>;
export declare function getUserTags(userId: string): Promise<{
    id: string;
    createdAt: Date;
    name: string;
    userId: string;
    color: string;
    isPreset: boolean;
}[]>;
export declare function createTag(userId: string, name: string, color: string): Promise<{
    id: string;
    createdAt: Date;
    name: string;
    userId: string;
    color: string;
    isPreset: boolean;
}>;
export declare function getDeckTags(deckId: string): Promise<any[]>;
export declare function addTagToCard(cardId: string, tagId: string, userId: string): Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    cardId: string;
    tagId: string;
}>;
export declare function removeTagFromCard(cardId: string, tagId: string, userId: string): Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    cardId: string;
    tagId: string;
}>;
//# sourceMappingURL=tagService.d.ts.map