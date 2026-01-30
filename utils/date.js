function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

function calculateDaysLeft(expiresAt) {
    if (!expiresAt) return 9999; // Lifetime representation
    const now = new Date();
    const exp = new Date(expiresAt);
    const diffTime = exp - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
}

module.exports = { formatDate, calculateDaysLeft };
