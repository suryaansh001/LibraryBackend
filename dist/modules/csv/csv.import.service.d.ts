export interface ImportResult {
    success: number;
    failed: number;
    errors: Array<{
        row: number;
        error: string;
        data: Record<string, string>;
    }>;
}
export declare class CsvImportService {
    importStudents(csvBuffer: Buffer, libraryId: string, userId: string): Promise<{
        success: number;
        failed: number;
        errors: Array<{
            row: number;
            error: string;
            data: Record<string, string>;
        }>;
    }>;
    private processStudentRow;
}
export declare const csvImportService: CsvImportService;
