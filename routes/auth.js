const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const rateLimit = require('../utils/rateLimit');

// POST /auth/login
router.post('/login', rateLimit, async (req, res, next) => {
    try {
        const { license_key, app_id, hwid } = req.body;
        
        // 4. IP (OBRIGATÓRIO)
        // Express req.ip is reliable because we set app.set('trust proxy', 1)
        const ip = req.ip;

        // Validation
        if (!license_key || !app_id || !hwid) {
            return res.status(200).json({ 
                success: false, 
                reason: 'MISSING_FIELDS' 
            });
        }

        const result = await authService.authenticate({ license_key, app_id, hwid, ip });

        // Always return 200 OK with JSON body
        res.status(200).json(result);

    } catch (err) {
        next(err);
    }
});

module.exports = router;
