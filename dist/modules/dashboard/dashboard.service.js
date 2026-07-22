import { AppError } from '../../shared/errors/app-error.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
import { toDashboardResponseDTO } from '../../shared/dto/dashboard.dto.js';
import { DashboardRepositoryImpl } from './dashboard.repository.js';
export class DashboardServiceImpl {
    db;
    repository;
    constructor(db) {
        this.db = db;
        this.repository = new DashboardRepositoryImpl(db);
    }
    async getDashboard(libraryId, requestId) {
        const results = await Promise.allSettled([
            this.repository.getCurrentOccupancy(libraryId),
            this.repository.getCapacity(libraryId),
            this.repository.getTodayCheckins(libraryId),
            this.repository.getMonthlyRevenue(libraryId),
            this.repository.getPendingFees(libraryId),
            this.repository.getActiveStudents(libraryId),
            this.repository.getRevenue30Days(libraryId),
            this.repository.getAttendance30Days(libraryId),
            this.repository.getRecentActivity(libraryId)
        ]);
        const partialFailures = [];
        const values = results.map((r, i) => {
            if (r.status === 'fulfilled') {
                return r.value;
            }
            else {
                const queryNames = [
                    'currentOccupancy', 'capacity', 'todayCheckins', 'monthlyRevenue',
                    'pendingFees', 'activeStudents', 'revenue30d', 'attendance30d', 'recentActivity'
                ];
                const queryName = queryNames[i] ?? 'unknown';
                partialFailures.push(queryName);
                console.error(`Dashboard query ${queryName} failed:`, r.reason);
                return null;
            }
        });
        const [currentOccupancyResult, capacityResult, todayCheckinsResult, monthlyRevenueResult, pendingFeesResult, activeStudentsResult, revenue30dResult, attendance30dResult, recentActivityResult] = results;
        const currentOccupancy = currentOccupancyResult.status === 'fulfilled' ? currentOccupancyResult.value : null;
        const capacity = capacityResult.status === 'fulfilled' ? capacityResult.value : null;
        const todayCheckins = todayCheckinsResult.status === 'fulfilled' ? todayCheckinsResult.value : null;
        const monthlyRevenue = monthlyRevenueResult.status === 'fulfilled' ? monthlyRevenueResult.value : null;
        const pendingFees = pendingFeesResult.status === 'fulfilled' ? pendingFeesResult.value : null;
        const activeStudents = activeStudentsResult.status === 'fulfilled' ? activeStudentsResult.value : null;
        const revenue30d = revenue30dResult.status === 'fulfilled' ? revenue30dResult.value : null;
        const attendance30d = attendance30dResult.status === 'fulfilled' ? attendance30dResult.value : null;
        const recentActivity = recentActivityResult.status === 'fulfilled' ? recentActivityResult.value : null;
        if (currentOccupancy === null) {
            throw new AppError(ERROR_CODES.DATABASE_ERROR, 'Failed to fetch critical dashboard metric: current occupancy', 500);
        }
        return toDashboardResponseDTO({
            currentOccupancy: currentOccupancy ?? 0,
            capacity: capacity ?? 100,
            todayCheckins: todayCheckins ?? 0,
            monthlyRevenue: monthlyRevenue ?? 0,
            pendingFeesCount: pendingFees?.count ?? 0,
            pendingFeesAmount: pendingFees?.amount ?? 0,
            activeStudents: activeStudents ?? 0,
            revenue30d: revenue30d ?? [],
            attendance30d: attendance30d ?? [],
            recentActivity: recentActivity ?? [],
            partialFailures
        });
    }
}
//# sourceMappingURL=dashboard.service.js.map