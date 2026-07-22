import type { FastifyPluginAsync } from 'fastify';
export interface AttendanceNotificationPayload {
    library_id: string;
    event_type: string;
    student_id: string;
    session_id: string;
    ts: number;
}
export interface RealtimeHub {
    broadcastToLibrary: (libraryId: string, event: string, data: unknown) => void;
    shutdown: () => Promise<void>;
}
declare module 'fastify' {
    interface FastifyInstance {
        realtime: RealtimeHub;
    }
}
export declare const realtimePlugin: FastifyPluginAsync;
