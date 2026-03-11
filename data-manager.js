/**
 * DataManager - Handles all data persistence using localStorage
 * Entities: Users, Flights, Bookings
 */

const DataManager = {
    // Keys for localStorage
    KEYS: {
        USERS: 'airbridge_users',
        FLIGHTS: 'airbridge_flights',
        BOOKINGS: 'airbridge_bookings',
        CURRENT_USER: 'airbridge_current_user'
    },

    // Initialize and Seed Data
    init() {
        if (!localStorage.getItem(this.KEYS.USERS)) {
            const initialUsers = [
                {
                    id: 1,
                    name: 'Admin User',
                    email: 'admin@airbridge.com',
                    password: 'admin', // In real app, hash this
                    role: 'admin'
                },
                {
                    id: 2,
                    name: 'John Doe',
                    email: 'passenger@test.com',
                    password: 'password',
                    role: 'passenger'
                }
            ];
            localStorage.setItem(this.KEYS.USERS, JSON.stringify(initialUsers));
            console.log('Users seeded');
        }

        if (!localStorage.getItem(this.KEYS.FLIGHTS)) {
            const initialFlights = [
                {
                    id: 'FL-101',
                    flightName: 'Morning Express',
                    flightType: 'Boeing 737',
                    airline: 'Airbridge Airways',
                    from: 'New York (JFK)',
                    to: 'London (LHR)',
                    date: '2023-11-25',
                    depTime: '10:00',
                    arrTime: '22:00',
                    price: 450,
                    duration: '7h 00m'
                },
                {
                    id: 'FL-102',
                    flightName: 'Atlantic Crosser',
                    flightType: 'Airbus A350',
                    airline: 'SkyHigh Jets',
                    from: 'Paris (CDG)',
                    to: 'New York (JFK)',
                    date: '2023-11-26',
                    depTime: '14:00',
                    arrTime: '18:00',
                    price: 520,
                    duration: '8h 00m'
                },
                {
                    id: 'FL-103',
                    flightName: 'Pacific Hopper',
                    flightType: 'Boeing 787',
                    airline: 'Global Wings',
                    from: 'Tokyo (HND)',
                    to: 'San Francisco (SFO)',
                    date: '2023-11-27',
                    depTime: '18:00',
                    arrTime: '10:00',
                    price: 800,
                    duration: '10h 00m'
                }
            ];
            localStorage.setItem(this.KEYS.FLIGHTS, JSON.stringify(initialFlights));
            console.log('Flights seeded');
        }

        if (!localStorage.getItem(this.KEYS.BOOKINGS)) {
            localStorage.setItem(this.KEYS.BOOKINGS, JSON.stringify([]));
            console.log('Bookings initialized');
        }
    },

    // --- User Management ---

    getUsers() {
        return JSON.parse(localStorage.getItem(this.KEYS.USERS) || '[]');
    },

    registerUser(name, email, password) {
        const users = this.getUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Email already exists' };
        }
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            role: 'passenger'
        };
        users.push(newUser);
        localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
        return { success: true, user: newUser };
    },

    loginUser(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
            return { success: true, user };
        }
        return { success: false, message: 'Invalid credentials' };
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem(this.KEYS.CURRENT_USER));
    },

    logoutUser() {
        localStorage.removeItem(this.KEYS.CURRENT_USER);
    },

    // --- Flight Management ---

    getFlights() {
        return JSON.parse(localStorage.getItem(this.KEYS.FLIGHTS) || '[]');
    },

    searchFlights(from, to, date) {
        const flights = this.getFlights();
        return flights.filter(f => {
            // Simple robust matching
            const matchFrom = f.from.toLowerCase().includes(from.toLowerCase().split(' ')[0]);
            const matchTo = f.to.toLowerCase().includes(to.toLowerCase().split(' ')[0]);
            // Optional date check (if date provided)
            const matchDate = date ? f.date === date : true;
            return matchFrom && matchTo; // && matchDate; // Allow flexible dates for demo
        });
    },

    addFlight(flightData) {
        const flights = this.getFlights();
        flightData.id = 'FL-' + Date.now().toString().slice(-4);
        flights.push(flightData);
        localStorage.setItem(this.KEYS.FLIGHTS, JSON.stringify(flights));
        return flightData;
    },

    updateFlight(updatedFlight) {
        let flights = this.getFlights();
        const index = flights.findIndex(f => f.id === updatedFlight.id);
        if (index !== -1) {
            flights[index] = { ...flights[index], ...updatedFlight };
            localStorage.setItem(this.KEYS.FLIGHTS, JSON.stringify(flights));
            return true;
        }
        return false;
    },

    deleteFlight(flightId) {
        let flights = this.getFlights();
        flights = flights.filter(f => f.id !== flightId);
        localStorage.setItem(this.KEYS.FLIGHTS, JSON.stringify(flights));
    },

    // --- Booking Management ---

    getBookings() {
        return JSON.parse(localStorage.getItem(this.KEYS.BOOKINGS) || '[]');
    },

    createBooking(bookingData) {
        const bookings = this.getBookings();
        bookingData.id = 'BK-' + Date.now().toString().slice(-6);
        bookingData.createdAt = new Date().toISOString();
        bookings.push(bookingData);
        localStorage.setItem(this.KEYS.BOOKINGS, JSON.stringify(bookings));
        return bookingData;
    },

    getUserBookings(userEmail) {
        const bookings = this.getBookings();
        return bookings.filter(b => b.userEmail === userEmail);
    }
};

// Initialize on load
DataManager.init();
