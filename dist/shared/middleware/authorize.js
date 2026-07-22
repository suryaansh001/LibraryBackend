import { AppError } from '../errors/app-error.js';
import { ERROR_CODES } from '../errors/error-codes.js';
export function authorize(...allowedRoles) {
    return async (request) => {
        if (!allowedRoles.includes(request.user.role)) {
            throw new AppError(ERROR_CODES.INSUFFICIENT_PERMISSIONS, 'Insufficient permissions', 403);
        }
    };
}
//# sourceMappingURL=authorize.js.map