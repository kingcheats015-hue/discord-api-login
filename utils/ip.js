function getClientIp(req) {
    // Standard proxy header (Render, Cloudflare, Nginx)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        // The first IP in the list is the original client IP
        return forwarded.split(',')[0].trim();
    }
    // Fallback to socket address
    return req.socket.remoteAddress || '0.0.0.0';
}

function maskIp(ip) {
    if (!ip) return '0.0.0.0';
    
    // Clean IPv6 prefix if present
    let cleanIp = ip;
    if (cleanIp.startsWith('::ffff:')) {
        cleanIp = cleanIp.substring(7);
    }
    
    // Simple check for IPv4 vs IPv6
    if (cleanIp.includes('.')) {
        // IPv4: 192.168.1.1 -> 192.168.xxx.xxx
        const parts = cleanIp.split('.');
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.xxx.xxx`;
        }
        return 'xxx.xxx.xxx.xxx';
    } else {
        // IPv6: Shorten and mask
        // e.g. 2001:0db8:85a3:0000:0000:8a2e:0370:7334
        // Show first 2 segments
        const parts = cleanIp.split(':');
        if (parts.length > 2) {
            return `${parts[0]}:${parts[1]}:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx`;
        }
        return 'xxxx:xxxx:xxxx...';
    }
}

module.exports = { getClientIp, maskIp };
