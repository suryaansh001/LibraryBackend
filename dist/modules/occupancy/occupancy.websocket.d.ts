import type { FastifyPluginAsync } from 'fastify';
interface OccupancyWebSocketMessage {
    type: 'OCCUPANCY_UPDATE' | 'SEAT_MAP_UPDATE';
    data: {
        currentCount: number;
        capacity: number;
        available: number;
        event?: 'CHECK_IN' | 'CHECK_OUT';
        student?: {
            name: string;
            seat: string | null;
            membershipType: string;
        };
        timestamp: string;
        seats?: Array<{
            seatNumber: string;
            status: string;
        }>;
    };
}
export declare const occupancyWebsocketPlugin: FastifyPluginAsync;
export type { OccupancyWebSocketMessage };
