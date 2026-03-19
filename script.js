document.addEventListener('DOMContentLoaded', function () {

    // --- Global: Auth State in Navbar ---
    const updateNavbarAuth = async () => {
        const currentUser = await DataManager.getCurrentUser();
        const navbarList = document.querySelector('.navbar-nav');
        if (!navbarList) return;
        const signInItem = Array.from(navbarList.children).find(li => li.querySelector('a')?.innerText.includes('Sign In'));

        if (currentUser && signInItem) {
            signInItem.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline-light rounded-pill px-4 dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="bi bi-person-circle me-1"></i> ${currentUser.name.split(' ')[0]}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0">
                        ${currentUser.role === 'admin' ?
                    '<li><a class="dropdown-item" href="admin.html">Admin Dashboard</a></li>' :
                    '<li><a class="dropdown-item" href="profile.html">My Bookings</a></li>'
                }
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" id="logoutBtn">Logout</a></li>
                    </ul>
                </div>
            `;
            setTimeout(() => {
                document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
                    e.preventDefault();
                    await DataManager.logoutUser();
                    window.location.reload();
                });
            }, 100);
        }
    };
    updateNavbarAuth();


    // Navbar Scroll Effect
    const navbar = document.querySelector('.glass-nav');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Swap Origin and Destination
    const swapBtn = document.querySelector('.swap-btn');
    const fromInput = document.querySelector('input[placeholder="New York (JFK)"]');
    const toInput = document.querySelector('input[placeholder="London (LHR)"]');

    if (swapBtn && fromInput && toInput) {
        swapBtn.addEventListener('click', function () {
            // Add rotation class for animation
            swapBtn.style.transform = 'rotate(180deg)';

            // Swap values
            const temp = fromInput.value;
            fromInput.value = toInput.value;
            toInput.value = temp;

            // Reset rotation after animation
            setTimeout(() => {
                swapBtn.style.transform = 'rotate(0deg)';
            }, 300);
        });
    }

    // Form Submission
    const form = document.getElementById('flightSearchForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const from = fromInput.value || 'New York (JFK)';
            const to = toInput.value || 'London (LHR)';
            const departure = (document.getElementById('departureDateInput') || document.querySelector('input[type="date"]')).value;

            // Redirect to flights.html with query parameters
            window.location.href = `flights.html?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(departure)}`;
        });
    }

    // Flight Results Logic (flights.html)
    const resultsContainer = document.getElementById('flight-results-container');
    if (resultsContainer) {
        (async () => {
        // Parse URL params
        const urlParams = new URLSearchParams(window.location.search);
        const fromParam = urlParams.get('from') || '';
        const toParam   = urlParams.get('to')   || '';
        const dateParam = urlParams.get('date') || '';

        // Update Summary Text
        const summaryElement = document.getElementById('search-summary');
        if (summaryElement) {
            if (fromParam && toParam) {
                summaryElement.textContent = `Showing flights from ${fromParam} to ${toParam}` + (dateParam ? ` on ${dateParam}` : '');
            } else {
                summaryElement.textContent = 'Showing all available flights';
            }
        }

        // Fetch Data — empty params returns ALL flights
        const flights = await DataManager.searchFlights(fromParam, toParam, dateParam);

        if (flights.length === 0) {
            const noResults = document.getElementById('no-results');
            if (noResults) noResults.classList.remove('d-none');
            resultsContainer.innerHTML = '';
        } else {
            let flightsHTML = '';
            flights.forEach((flight, i) => {
                let icon = 'bi-airplane-engines';
                if (flight.airline && flight.airline.includes('Sky'))    icon = 'bi-cloud-haze2';
                if (flight.airline && flight.airline.includes('Global')) icon = 'bi-globe';

                flightsHTML += `
                <div class="card border-0 shadow-sm rounded-4 flight-card overflow-hidden mb-4 animate-fade-up" style="animation-delay: ${i * 0.1}s">
                    <div class="card-body p-0">
                        <div class="row g-0 align-items-center">
                            <div class="col-md-3 p-4 border-end border-light">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="airline-logo bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                        <i class="bi ${icon} fs-4"></i>
                                    </div>
                                    <div>
                                        <h6 class="fw-bold mb-0">${flight.airline}</h6>
                                        <small class="text-muted">${flight.id}</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-5 p-4 border-end border-light">
                                <div class="d-flex justify-content-between align-items-center text-center">
                                    <div>
                                        <h4 class="fw-bold mb-0">${flight.depTime}</h4>
                                        <small class="text-muted text-truncate" style="max-width: 80px;">${flight.from.split('(')[0]}</small>
                                    </div>
                                    <div class="flight-route position-relative px-3 flex-grow-1">
                                        <hr class="border-primary opacity-50 mb-0" style="border-top: 2px dashed;">
                                        <i class="bi bi-airplane-fill text-primary position-absolute top-50 start-50 translate-middle" style="transform: rotate(90deg);"></i>
                                        <small class="text-muted d-block mt-2">${flight.duration || 'N/A'}</small>
                                    </div>
                                    <div>
                                        <h4 class="fw-bold mb-0">${flight.arrTime}</h4>
                                        <small class="text-muted text-truncate" style="max-width: 80px;">${flight.to.split('(')[0]}</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 p-4">
                                <div class="row g-2">
                                    <div class="col-6">
                                        <div class="p-3 border rounded-3 text-center price-option active" role="button" onclick="selectPrice(this)">
                                            <small class="d-block text-muted mb-1">Economy</small>
                                            <h5 class="fw-bold text-dark mb-0">$${flight.price}</h5>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="p-3 border rounded-3 text-center price-option" role="button" onclick="selectPrice(this)">
                                            <small class="d-block text-muted mb-1">First Class</small>
                                            <h5 class="fw-bold text-warning mb-0">$${Math.floor(flight.price * 2.5)}</h5>
                                        </div>
                                    </div>
                                    <div class="col-12 mt-3">
                                        <button class="btn btn-primary w-100 rounded-pill py-2 fw-bold"
                                            onclick="goToPayment('${flight.id}', '${flight.airline}', '${flight.duration || ''}', '${flight.depTime}', '${flight.arrTime}', '${flight.price}', '${flight.from}', '${flight.to}', '${flight.date}')">
                                            Select Flight
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            });
            resultsContainer.innerHTML = flightsHTML;
        }
        })();
    }
});

// Helper for price selection styling
function selectPrice(element) {
    // Remove active class from siblings
    const parent = element.closest('.row');
    const options = parent.querySelectorAll('.price-option');
    options.forEach(opt => {
        opt.classList.remove('active', 'border-primary', 'bg-primary', 'bg-opacity-10');
        opt.querySelector('h5').classList.remove('text-primary');
    });

    // Add active class to selected
    element.classList.add('active', 'border-primary', 'bg-primary', 'bg-opacity-10');
    element.querySelector('h5').classList.add('text-primary');
}

// Function to handle flight selection and redirect to payment
window.goToPayment = async function (flightId, airline, duration, depTime, arrTime, price, from, to, date) {
    const user = await DataManager.getCurrentUser();
    if (!user) {
        alert('Please sign in to book a flight.');
        window.location.href = 'login.html';
        return;
    }

    const params = new URLSearchParams({
        flightId: flightId,
        airline: airline,
        duration: duration,
        depTime: depTime,
        arrTime: arrTime,
        price: price,
        from: from,
        to: to,
        date: date
    });
    window.location.href = `payment.html?${params.toString()}`;
};

// Payment Page Logic
const paymentForm = document.getElementById('payment-form');
if (paymentForm) {
    // Populate Summary
    const urlParams = new URLSearchParams(window.location.search);

    document.getElementById('summary-airline').textContent = urlParams.get('airline') || 'Airline';
    document.getElementById('summary-flight-num').textContent = urlParams.get('flightId') || 'FL-000';
    document.getElementById('summary-duration').textContent = urlParams.get('duration') || '0h 00m';
    document.getElementById('summary-dep-time').textContent = urlParams.get('depTime') || '00:00';
    document.getElementById('summary-arr-time').textContent = urlParams.get('arrTime') || '00:00';
    document.getElementById('summary-from').textContent = urlParams.get('from') || 'Origin';
    document.getElementById('summary-to').textContent = urlParams.get('to') || 'Dest';

    const price = urlParams.get('price') || '0';
    document.getElementById('summary-price').textContent = '$' + price;
    document.getElementById('btn-amount').textContent = '$' + price;

    // Handle Form Submit
    paymentForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const currentUser = await DataManager.getCurrentUser();
        if (!currentUser) {
            alert("Session expired. Please login again.");
            window.location.href = 'login.html';
            return;
        }

        // Simulate processing
        const btn = this.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        const bookingData = {
            userEmail:  currentUser.email,
            userName:   currentUser.name,
            flightId:   urlParams.get('flightId'),
            flightNum:  urlParams.get('flightId'),
            airline:    urlParams.get('airline'),
            from:       urlParams.get('from'),
            to:         urlParams.get('to'),
            flightDate: urlParams.get('date'),
            price:      price,
            status:     'Confirmed'
        };
        await DataManager.createBooking(bookingData);
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
        btn.innerHTML = originalText;
        btn.disabled = false;
    });

    // Format Card Number
    const cardInput = document.getElementById('card-number');
    if (cardInput) {
        cardInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = value;
        });
    }
}