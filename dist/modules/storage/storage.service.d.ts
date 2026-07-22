export declare class StorageService {
    createPresignedPost(libraryId: string, userId: string, body: {
        fileName: string;
        contentType: string;
        fileSize: number;
    }): Promise<{
        url: string;
        fields: {
            [x: string]: string;
        };
        key: string;
        expiresIn: number;
    }>;
}
