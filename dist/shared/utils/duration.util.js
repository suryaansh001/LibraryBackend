const DURATION_PATTERN = /^(\d+)([smhdw])$/;
const UNIT_MULTIPLIERS = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
    w: 604_800_000
};
export function parseDurationToMs(value) {
    const match = DURATION_PATTERN.exec(value.trim());
    if (match === null) {
        throw new Error(`Invalid duration format: ${value}`);
    }
    const amount = Number.parseInt(match[1], 10);
    const unit = match[2];
    const multiplier = UNIT_MULTIPLIERS[unit];
    if (multiplier === undefined) {
        throw new Error(`Unsupported duration unit: ${unit}`);
    }
    return amount * multiplier;
}
export function addDurationToDate(value, from = new Date()) {
    return new Date(from.getTime() + parseDurationToMs(value));
}
//# sourceMappingURL=duration.util.js.map