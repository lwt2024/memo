export declare function register(username: string, password: string, nickname?: string): Promise<{
    user: {
        id: string;
        username: string;
        nickname: string | null;
    };
    token: string;
}>;
export declare function login(username: string, password: string): Promise<{
    user: {
        id: string;
        username: string;
        nickname: string | null;
    };
    token: string;
}>;
//# sourceMappingURL=authService.d.ts.map