import { type LibraryOsApp } from '../app.js';
export interface TestSeedData {
    libraryId: string;
    userId: string;
    librarySlug: string;
    email: string;
    password: string;
}
export declare function createTestApp(): Promise<LibraryOsApp>;
export declare function seedAuthTestData(options?: {
    email?: string;
    password?: string;
    librarySlug?: string;
}): Promise<TestSeedData>;
export declare function cleanupAuthTestData(seed: TestSeedData): Promise<void>;
export declare function closeTestResources(app?: LibraryOsApp): Promise<void>;
export declare function getRefreshTokenFromResponse(setCookieHeader: string | string[] | undefined): string | undefined;
