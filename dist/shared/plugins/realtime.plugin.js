import { pool } from '../../config/database.js';
export const realtimePlugin = async (fastify) => {
    const listeners = new Map();
    const client = (await pool.connect());
    await client.query('LISTEN attendance_update');
    client.on('notification', (notification) => {
        if (notification.channel !== 'attendance_update' || notification.payload === null) {
            return;
        }
        void fastify.log.debug({ payload: notification.payload }, 'Received attendance notification');
    });
    const hub = {
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
//# sourceMappingURL=realtime.plugin.js.map