const rateLimit = require('express-rate-limit');

// 2. RATE LIMIT (Strict Config)
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // trustProxy: true tells rate-limit to trust req.ip determined by express's 'trust proxy' setting
    // This fixes ERR_ERL_PERMISSIVE_TRUST_PROXY if app.set('trust proxy', 1) is used
    trustProxy: true, 
    message: {
        success: false,
        reason: 'RATE_LIMIT_EXCEEDED'
    }
});

module.exports = limiter;
