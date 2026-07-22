export class AppError extends Error {
    code;
    statusCode;
    details;
    constructor(code, message, statusCode, details) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
    }
}
//# sourceMappingURL=app-error.js.map