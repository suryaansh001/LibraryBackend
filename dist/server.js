import { buildApp } from './app.js';
import { config } from './config/env.js';
const app = buildApp();
async function start() {
    try {
        await app.listen({ port: config.PORT, host: '0.0.0.0' });
        app.log.info({ port: config.PORT }, 'Server started');
    }
    catch (error) {
        app.log.error({ error }, 'Failed to start server');
        process.exitCode = 1;
    }
}
void start();
//# sourceMappingURL=server.js.map