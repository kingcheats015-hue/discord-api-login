const supabase = require('../supabaseClient');
const { hashKey } = require('../utils/hash');
const { formatDate, calculateDaysLeft } = require('../utils/date');
const { maskIp } = require('../utils/ip'); // Keeping for response masking if needed, or inline it.

async function authenticate({ license_key, app_id, hwid, ip }) {
    // 7. LOGIN FLOW FINAL
    
    // 1. Hash License Key (SHA-256)
    const licenseHash = hashKey(license_key);

    // 2. Validate App (Check existence and active status)
    const { data: app, error: appError } = await supabase
        .from('apps')
        .select('active')
        .eq('app_id', app_id)
        .maybeSingle();

    if (appError || !app) {
        return { success: false, reason: 'INVALID_APP' };
    }

    if (!app.active) {
        return { success: false, reason: 'APP_DISABLED' };
    }

    // 3. Fetch License
    // Always use .single()
    // Search by license_key AND app_id
    const { data: license, error: licError } = await supabase
        .from('licenses')
        .select('*')
        .eq('license_key', licenseHash)
        .eq('app_id', app_id)
        .single();

    if (licError || !license) {
        return { success: false, reason: 'INVALID_LICENSE' };
    }

    // 4. Verify License Status (Active/Revoked)
    if (!license.active) {
        return { success: false, reason: 'LICENSE_DISABLED' };
    }

    // 5. Verify Expiration
    if (license.expires_at) {
        const expires = new Date(license.expires_at);
        const now = new Date();
        if (expires < now) {
            return { success: false, reason: 'LICENSE_EXPIRED' };
        }
    }

    // 6. HWID Security (ANTI-BURLA)
    // First, check if HWID is globally banned
    if (hwid) {
        const { data: banned } = await supabase
            .from('banned_hwids')
            .select('id')
            .eq('hwid', hwid)
            .maybeSingle();
        
        if (banned) {
            return { success: false, reason: 'HWID_BANNED' };
        }
    }

    // HWID Binding Logic
    let updateData = {};
    const now = new Date().toISOString();

    if (!license.hwid) {
        // First login: Bind HWID
        if (hwid) {
            updateData.hwid = hwid;
        } else {
            // HWID required for first login
            return { success: false, reason: 'MISSING_HWID' };
        }
    } else {
        // Subsequent logins: Compare HWID
        // Strict string comparison
        if (license.hwid !== hwid) {
            return { success: false, reason: 'HWID_MISMATCH' };
        }
        // NEVER overwrite HWID here
    }

    // 7. IP Saving & Statistics
    // Always save last_ip
    updateData.last_ip = ip;
    
    // NOTE: last_login_at column DOES NOT EXIST in current schema (verified via check_schema.js)
    // So we do NOT update it.
    // updateData.last_login_at = now; 

    const { error: updateError } = await supabase
        .from('licenses')
        .update(updateData)
        .eq('id', license.id);

    if (updateError) {
        console.error('Error updating license stats:', updateError);
        // Proceeding despite update error to not block user login if DB is flaky?
        // Usually safe to proceed, but if IP logging is critical, maybe fail.
        // For now, we log and proceed.
    }

    // 8. Build Response
    // Use HWID from DB (safe) or input if just bound
    const finalHwid = license.hwid || hwid;
    const hwidPrefix = finalHwid ? finalHwid.substring(0, 5) : 'UNKNOWN';

    return {
        success: true,
        license: {
            app_id: license.app_id,
            expires_at: formatDate(license.expires_at),
            days_left: calculateDaysLeft(license.expires_at),
            hwid_prefix: hwidPrefix,
            last_ip: maskIp(ip) // Mask IP in response
        }
    };
}

module.exports = { authenticate };
