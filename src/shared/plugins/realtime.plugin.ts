import type { FastifyPluginAsync } from 'fastify';
import type { PoolClient } from 'pg';

import { pool } from '../../config/database.js';

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

type ListenerClient = PoolClient & {
  __isListener?: true;
};

export const realtimePlugin: FastifyPluginAsync = async (fastify) => {
  const listeners = new Map<string, Set<(event: string, data: unknown) => void>>();
  const client = (await pool.connect()) as ListenerClient;

  await client.query('LISTEN attendance_update');

  client.on('notification', (notification) => {
    if (notification.channel !== 'attendance_update' || notification.payload === null) {
      return;
    }

    void fastify.log.debug({ payload: notification.payload }, 'Received attendance notification');
  });

  const hub: RealtimeHub = {
    broadcastToLibrary(libraryId, event, data) {
      const subscribers = listeners.get(libraryId);
      if (subscribers === undefined) {
        return;
      }

      for (const subscriber of subscribers) {
        subscriber(event, data);
      }
    },
    async shutdown() {
      listeners.clear();
      await client.query('UNLISTEN *');
      client.release();
    }
  };

  fastify.decorate('realtime', hub);
  fastify.addHook('onClose', async () => {
    await hub.shutdown();
  });
};