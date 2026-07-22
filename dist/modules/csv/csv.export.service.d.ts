import { Readable } from 'stream';
export declare function exportStudentsToCSV(libraryId: string, filters?: {
    status?: 'active' | 'suspended' | 'expired' | 'inactive';
    from?: Date;
    to?: Date;
}): Promise<Readable>;
export declare function exportAttendanceToCSV(libraryId: string, from: Date, to: Date): Promise<NodeJS.ReadableStream>;
export declare function exportPaymentsToCSV(libraryId: string, from: Date, to: Date): Promise<NodeJS.ReadableStream>;
export declare function exportExpensesToCSV(libraryId: string, from: Date, to: Date): Promise<NodeJS.ReadableStream>;
