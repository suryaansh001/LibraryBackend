import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from './app-error.js';
type PgErrorLike = Error & {
    code?: string;
    constraint?: string;
    detail?: string;
    cause?: Error & {
        code?: string;
        constraint?: string;
    };
};
export declare function mapDatabaseError(error: PgErrorLike): AppError;
export declare function errorHandler(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply): void;
export {};
