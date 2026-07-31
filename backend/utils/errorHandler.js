/**
 * Central Error Handler for Planora Controllers
 * Logs full diagnostic details (stack traces, raw messages) on the server side,
 * while returning clean, generic messages to the client to prevent data/path leakage.
 *
 * @param {Object} res - Express response object
 * @param {Error} error - The caught error instance
 * @param {string} [userMessage="An unexpected error occurred. Please try again later."] - Safe client-facing message
 * @param {number} [statusCode=500] - HTTP status code
 */
export const handleControllerError = (res, error, userMessage = "An unexpected error occurred. Please try again later.", statusCode = 500) => {
    // 1. Log full diagnostic details on the server console
    console.error(`[Server Error ${statusCode}] ${error?.name || 'Error'}: ${error?.message || error}`);
    if (error?.stack) {
        console.error(error.stack);
    }

    // 2. Return clean generic message to client (no stack, paths, or raw DB details)
    return res.status(statusCode).json({
        message: userMessage
    });
};
