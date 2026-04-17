export const responseData = (res, message, data, statusCode = 200) => {
    const ok = statusCode >= 200 && statusCode < 300;

    return res.status(statusCode).json({
        success: ok,
        message,
        data,
        timestamp: new Date().toISOString(),
    });
};
