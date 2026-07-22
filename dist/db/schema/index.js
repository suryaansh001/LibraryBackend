export * from './libraries.js';
export * from './users.js';
export * from './membership-plans.js';
export * from './seats.js';
export * from './students.js';
export * from './memberships.js';
export * from './attendance-sessions.js';
export * from './payments.js';
export * from './expenses.js';
export * from './library-occupancy.js';
export * from './refresh-tokens.js';
export * from './audit-logs.js';
import { auditLogs } from './audit-logs.js';
import { attendanceSessions } from './attendance-sessions.js';
import { expenses } from './expenses.js';
import { libraryOccupancy } from './library-occupancy.js';
import { libraries } from './libraries.js';
import { membershipPlans } from './membership-plans.js';
import { memberships } from './memberships.js';
import { payments } from './payments.js';
import { refreshTokens } from './refresh-tokens.js';
import { seats } from './seats.js';
import { students } from './students.js';
import { users } from './users.js';
export const schema = {
    auditLogs,
    attendanceSessions,
    expenses,
    libraryOccupancy,
    libraries,
    membershipPlans,
    memberships,
    payments,
    refreshTokens,
    seats,
    students,
    users
};
//# sourceMappingURL=index.js.map