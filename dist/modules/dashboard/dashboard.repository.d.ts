import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { schema } from '../../db/schema/index.js';
type Database = NodePgDatabase<typeof schema>;
export interface DashboardRepository {
    getCurrentOccupancy(libraryId: string): Promise<number>;
    getCapacity(libraryId: string): Promise<number>;
    getTodayCheckins(libraryId: string): Promise<number>;
    getMonthlyRevenue(libraryId: string): Promise<number>;
    getPendingFees(libraryId: string): Promise<{
        count: number;
        amount: number;
    }>;
    getActiveStudents(libraryId: string): Promise<number>;
    getRevenue30Days(libraryId: string): Promise<Array<{
        date: string;
        amount: number;
    }>>;
    getAttendance30Days(libraryId: string): Promise<Array<{
        date: string;
        count: number;
    }>>;
    getRecentActivity(libraryId: string): Promise<Array<{
        action: string;
        entityType: string;
        createdAt: string;
    }>>;
}
export declare class DashboardRepositoryImpl implements DashboardRepository {
    private readonly db;
    constructor(db: Database);
    getCurrentOccupancy(libraryId: string): Promise<number>;
    getCapacity(libraryId: string): Promise<number>;
    getTodayCheckins(libraryId: string): Promise<number>;
    getMonthlyRevenue(libraryId: string): Promise<number>;
    getPendingFees(libraryId: string): Promise<{
        count: number;
        amount: number;
    }>;
    getActiveStudents(libraryId: string): Promise<number>;
    getRevenue30Days(libraryId: string): Promise<Array<{
        date: string;
        amount: number;
    }>>;
    getAttendance30Days(libraryId: string): Promise<Array<{
        date: string;
        count: number;
    }>>;
    getRecentActivity(libraryId: string): Promise<Array<{
        action: string;
        entityType: string;
        createdAt: string;
    }>>;
}
export {};
