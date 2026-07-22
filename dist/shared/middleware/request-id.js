import fp from 'fastify-plugin';
import { RESPONSE_REQUEST_ID_HEADER } from '../../config/constants.js';
const requestIdPluginRaw = async (fastify) => {
    fastify.addHook('onRequest', async (request, reply) => {
        // Use Fastify's built-in request.id (set via genReqId config)
        // and also expose it as request.requestId for our code
        const requestId = request.id;
        request.requestId = requestId;
        reply.header(RESPONSE_REQUEST_ID_HEADER, requestId);
        fastify.log.debug({ requestId }, 'Request ID assigned');
    });
};
export const requestIdPlugin = fp(requestIdPluginRaw);
//# sourceMappingURL=request-id.js.map