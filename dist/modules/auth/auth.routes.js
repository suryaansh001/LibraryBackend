import { config } from '../../config/env.js';
import { db } from '../../config/database.js';
import { LOGIN_RATE_LIMIT_MAX, LOGIN_RATE_LIMIT_WINDOW_MS, REFRESH_TOKEN_COOKIE } from '../../config/constants.js';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { createTenantMiddleware } from '../../shared/middleware/tenant.js';
import { loginBodySchema } from './auth.schema.js';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';
import { sendSuccess } from '../../shared/utils/response.util.js';
import { parseDurationToMs } from '../../shared/utils/duration.util.js';
function getRefreshCookiePath() {
    return `/api/${config.API_VERSION}/auth`;
}
function setRefreshTokenCookie(reply, token) {
    reply.setCookie(REFRESH_TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        path: getRefreshCookiePath(),
        maxAge: Math.floor(parseDurationToMs(config.JWT_REFRESH_EXPIRES_IN) / 1000)
    });
}
function clearRefreshTokenCookie(reply) {
    reply.clearCookie(REFRESH_TOKEN_COOKIE, {
        path: getRefreshCookiePath()
    });
}
export const authRoutes = async (fastify) => {
    const repository = new AuthRepository(db);
    const service = new AuthService(repository);
    const tenantMiddleware = createTenantMiddleware(repository);
    fastify.post('/login', {
        config: {
            rateLimit: {
                max: config.NODE_ENV === 'test' ? 10000 : LOGIN_RATE_LIMIT_MAX,
                timeWindow: LOGIN_RATE_LIMIT_WINDOW_MS
            }
        }
    }, async (request, reply) => {
        const body = loginBodySchema.parse(request.body);
        const result = await service.login(body, {
            ipAddress: request.ip,
            deviceInfo: request.headers['user-agent']
        });
        setRefreshTokenCookie(reply, result.refreshToken);
        return sendSuccess(reply, request, {
            accessToken: result.accessToken,
            user: result.user,
            library: result.library
        });
    });
    fastify.post('/refresh', async (request, reply) => {
        const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE];
        const result = await service.refresh(refreshToken ?? '');
        setRefreshTokenCookie(reply, result.refreshToken);
        return sendSuccess(reply, request, {
            accessToken: result.accessToken,
            user: result.user,
            library: result.library
        });
    });
    fastify.post('/logout', async (request, reply) => {
        const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE];
        await service.logout(refreshToken);
        clearRefreshTokenCookie(reply);
        return sendSuccess(reply, request, { loggedOut: true });
    });
    fastify.get('/me', {
        preHandler: [authenticate, tenantMiddleware]
    }, async (request, reply) => {
        const me = await service.getMe(request.user.id, request.libraryId);
        return sendSuccess(reply, request, me);
    });
};
//# sourceMappingURL=auth.routes.js.map