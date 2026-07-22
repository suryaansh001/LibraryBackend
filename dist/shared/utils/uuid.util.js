import { z } from 'zod';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const uuidParamSchema = z.string().regex(UUID_REGEX, 'Invalid UUID format');
export function isValidUuid(value) {
    return UUID_REGEX.test(value);
}
//# sourceMappingURL=uuid.util.js.map