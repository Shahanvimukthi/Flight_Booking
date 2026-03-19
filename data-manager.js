// ============================================
// js/data-manager.js  — PHP Backend Connector
// Replaces the old localStorage DataManager
// ============================================

const DataManager = (() => {

    const BASE = 'api'; // relative path — works from root of project

    // ── Internal fetch helper ────────────────
    async function api(file, action, method = 'GET', body = null, params = {}) {
        const url = new URL(`${BASE}/${file}`, window.location.href);
        url.searchParams.set('action', action);
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
        }

        const options = { method, credentials: 'same-origin', headers: {} };
        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }

        try {
            const res  = await fetch(url.toString(), options);
            const data = await res.json();
            return data;
        } catch (err) {
            console.error('API error:', err);
            return { success: false, message: 'Network error. Check server connection.' };
        }
    }

    // ── AUTH ─────────────────────────────────

    async function registerUser(name, email, password) {
        return api('auth.php', 'register', 'POST', { name, email, password });
    }

    async function loginUser(email, password) {
        return api('auth.php', 'login', 'POST', { email, password });
    }

    async function logoutUser() {
        return api('auth.php', 'logout');
    }

    async function getCurrentUser() {
        const res = await api('auth.php', 'me');
        return res.success ? res.user : null;
    }

    // ── FLIGHTS ──────────────────────────────

    async function searchFlights(from = '', to = '', date = '') {
        const res = await api('flights.php', 'search', 'GET', null, { from, to, date });
        return res.success ? res.flights : [];
    }

    async function getFlights() {
        const res = await api('flights.php', 'list');
        return res.success ? res.flights : [];
    }

    async function addFlight(data) {
        return api('flights.php', 'add', 'POST', data);
    }

    async function deleteFlight(id) {
        return api('flights.php', 'delete', 'GET', null, { id });
    }

    // ── BOOKINGS ─────────────────────────────

    async function createBooking(bookingData) {
        return api('bookings.php', 'create', 'POST', bookingData);
    }

    async function getUserBookings(email) {
        const res = await api('bookings.php', 'user');
        return res.success ? res.bookings : [];
    }

    async function getBookings() {
        const res = await api('bookings.php', 'all');
        return res.success ? res.bookings : [];
    }

    // ── Public API ───────────────────────────
    return {
        registerUser,
        loginUser,
        logoutUser,
        getCurrentUser,
        searchFlights,
        getFlights,
        addFlight,
        deleteFlight,
        createBooking,
        getUserBookings,
        getBookings,
    };
})();
