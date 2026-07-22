import { type DashboardResponseDTO } from '../../shared/dto/dashboard.dto.js';
import { Database } from '../../modules/attendance/attendance.repository.js';
export interface DashboardService {
    getDashboard(libraryId: string, requestId: string): Promise<DashboardResponseDTO>;
}
export declare class DashboardServiceImpl implements DashboardService {
    private readonly db;
    private readonly repository;
    constructor(db: Database);
    getDashboard(libraryId: string, requestId: string): Promise<DashboardResponseDTO>;
}
