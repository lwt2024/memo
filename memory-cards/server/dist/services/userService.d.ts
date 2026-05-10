export declare function updateProfile(userId: string, data: {
    nickname?: string;
    email?: string;
    avatar?: string;
    avatarFile?: Buffer;
    avatarFileName?: string;
}): Promise<{
    id: string;
    username: string;
    email: string | null;
    nickname: string | null;
    avatar: string | null;
    createdAt: Date;
}>;
export declare function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{
    message: string;
}>;
export declare function deleteUser(userId: string, password: string): Promise<{
    message: string;
}>;
//# sourceMappingURL=userService.d.ts.map