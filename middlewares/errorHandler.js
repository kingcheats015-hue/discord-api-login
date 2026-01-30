function errorHandler(err, req, res, next) {
    console.error('[ERROR]', err.stack);
    // Return generic error to client
    res.status(500).json({
        success: false,
        reason: 'INTERNAL_ERROR'
    });
}

module.exports = errorHandler;
