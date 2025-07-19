// Simple in-memory rate limiting
const rateLimitStore = new Map();
export const isRateLimited = (ip) => {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 100; // 100 requests per 15 minutes
    const record = rateLimitStore.get(ip);
    if (!record || now > record.resetTime) {
        // First request or window expired
        rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
        return false;
    }
    if (record.count >= maxRequests) {
        return true; // Rate limited
    }
    record.count++;
    return false;
};
export const getClientIP = (req) => {
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    return Array.isArray(clientIP) ? clientIP[0] : clientIP;
};
