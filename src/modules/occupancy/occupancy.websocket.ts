import { and, eq, isNull } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import WebSocket from 'ws';
import { attendanceSessions } from '../../db/schema/attendance-sessions.js';
import { libraryOccupancy } from '../../db/schema/library-occupancy.js';
import { students } from '../../db/schema/students.js';
import { seats } from '../../db/schema/seats.js';
import { memberships } from '../../db/schema/memberships.js';

interface OccupancyWebSocketMessage {
  type: 'OCCUPANCY_UPDATE' | 'SEAT_MAP_UPDATE';
  data: {
    currentCount: number;
    capacity: number;
    available: number;
    event?: 'CHECK_IN' | 'CHECK_OUT';
    student?: { name: string; seat: string | null; membershipType: string };
    timestamp: string;
    seats?: Array<{ seatNumber: string; status: string }>;
  };
}

interface ConnectedClient {
  ws: WebSocket;
  libraryId: string;
  userRole: 'owner' | 'staff' | 'receptionist' | 'student';
}

type OccupancyQuery = {
  token?: string;
  library_id?: string;
};

type OccupancyBroadcastData = {
  currentCount: number;
  capacity: number;
  available: number;
  student?: { name: string; seat: string | null; membershipType: string };
};

function isOccupancyBroadcastData(data: unknown): data is OccupancyBroadcastData {
  if (typeof data !== 'object' || data === null) return false;

  const payload = data as Record<string, unknown>;
  return typeof payload.currentCount === 'number'
    && typeof payload.capacity === 'number'
    && typeof payload.available === 'number';
}

export const occupancyWebsocketPlugin: FastifyPluginAsync = async (fastify) => {
  const clients = new Map<string, Set<ConnectedClient>>();

  fastify.register(async (fastify) => {
    fastify.get('/ws/occupancy', { websocket: true }, async (connection, request) => {
      const ws = connection.socket;
      const query = request.query as OccupancyQuery;
      const token = query.token;
      const libraryIdFromQuery = query.library_id;

      if (!token) {
        ws.close(4401, 'Authentication required');
        return;
      }

      let libraryId: string;
      const userRole: 'owner' | 'staff' | 'receptionist' | 'student' = 'student';

      try {
        if (libraryIdFromQuery) {
          libraryId = libraryIdFromQuery;
        } else {
          ws.close(4402, 'library_id required');
          return;
        }
      } catch {
        ws.close(4402, 'Invalid library_id');
        return;
      }

      if (!clients.has(libraryId)) {
        clients.set(libraryId, new Set());
      }

      const client: ConnectedClient = { ws, libraryId, userRole };
      clients.get(libraryId)!.add(client);

      fastify.log.info({ libraryId, clientCount: clients.get(libraryId)!.size }, 'WebSocket connected');

      const sendSnapshot = async () => {
        try {
          const [occupancyResult, openSessions] = await Promise.all([
            fastify.db
              .select({ currentCount: libraryOccupancy.currentCount, capacity: libraryOccupancy.capacity })
              .from(libraryOccupancy)
              .where(eq(libraryOccupancy.libraryId, libraryId))
              .limit(1),
            fastify.db
              .select({
                id: attendanceSessions.id,
                studentId: attendanceSessions.studentId,
                checkInAt: attendanceSessions.checkInAt,
                seatId: students.seatId,
                membershipType: memberships.type,
              })
              .from(attendanceSessions)
              .leftJoin(students, eq(attendanceSessions.studentId, students.id))
              .leftJoin(memberships, eq(attendanceSessions.membershipId, memberships.id))
              .where(and(
                eq(attendanceSessions.libraryId, libraryId),
                isNull(attendanceSessions.checkOutAt)
              ))
          ]);

          const occupancy = occupancyResult[0];
          const currentCount = occupancy?.currentCount ?? 0;
          const capacity = occupancy?.capacity ?? 100;
          const available = Math.max(0, capacity - currentCount);

          const seatsList = await fastify.db
            .select({ seatNumber: seats.seatNumber, status: seats.status })
            .from(seats)
            .where(eq(seats.libraryId, libraryId))
            .orderBy(seats.seatNumber);

          const message: OccupancyWebSocketMessage = {
            type: 'OCCUPANCY_UPDATE',
            data: {
              currentCount: occupancy?.currentCount ?? 0,
              capacity: occupancy?.capacity ?? 100,
              available: Math.max(0, (occupancy?.capacity ?? 100) - (occupancy?.currentCount ?? 0)),
              event: undefined,
              student: undefined,
              timestamp: new Date().toISOString(),
              seats: seatsList.map(s => ({ seatNumber: s.seatNumber, status: s.status }))
            }
          };
          ws.send(JSON.stringify(message));
        } catch (error) {
          fastify.log.error({ error, libraryId }, 'Failed to send snapshot');
        }
      };

      void sendSnapshot();

      ws.on('close', () => {
        const libraryClients = clients.get(libraryId);
        if (libraryClients) {
          libraryClients.delete(client);
          if (libraryClients.size === 0) {
            clients.delete(libraryId);
          }
        }
        fastify.log.info({ libraryId }, 'WebSocket disconnected');
      });

      ws.on('error', (error) => {
        fastify.log.error({ error, libraryId }, 'WebSocket error');
      });
    });

    fastify.realtime.broadcastToLibrary = (libraryId, event, data) => {
      if (!isOccupancyBroadcastData(data)) {
        fastify.log.warn({ libraryId, event }, 'Ignoring invalid occupancy broadcast payload');
        return;
      }

      const libraryClients = clients.get(libraryId);
      if (!libraryClients) return;

      const message: OccupancyWebSocketMessage = {
        type: 'OCCUPANCY_UPDATE',
        data: {
          currentCount: data.currentCount,
          capacity: data.capacity,
          available: data.available,
          event: event === 'INSERT' ? 'CHECK_IN' : 'CHECK_OUT',
          student: data.student,
          timestamp: new Date().toISOString()
        }
      };

      const messageStr = JSON.stringify(message);
      for (const client of clients.get(libraryId)!) {
        if (client.ws.readyState === 1) {
          client.ws.send(messageStr);
        }
      }

      if (event === 'INSERT' || event === 'UPDATE') {
        const seatMapMessage: OccupancyWebSocketMessage = {
          type: 'SEAT_MAP_UPDATE',
          data: {
            currentCount: data.currentCount,
            capacity: data.capacity,
            available: data.available,
            timestamp: new Date().toISOString(),
            seats: []
          }
        };
        const seatMapMessageStr = JSON.stringify(seatMapMessage);
        for (const client of libraryClients) {
          if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(seatMapMessageStr);
          }
        }
      }
    };
  });
};

export type { OccupancyWebSocketMessage };
