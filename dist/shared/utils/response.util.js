export function sendSuccess(reply, request, data, options) {
    const payload = {
        success: true,
        data,
        requestId: request.requestId ?? request.id,
        ...(options?.message !== undefined ? { message: options.message } : {}),
        ...(options?.meta !== undefined ? { meta: options.meta } : {})
    };
    return reply.status(options?.statusCode ?? 200).send(payload);
}
//# sourceMappingURL=response.util.js.map