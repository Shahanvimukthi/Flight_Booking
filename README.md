✈️ Airbridge — Flight Booking System

A full-stack flight booking web application built with HTML, CSS, JavaScript (frontend) and PHP + MySQL (backend).


🌐 Live Demo

Deploy on InfinityFree, 000webhost, or any PHP hosting provider.


📸 Features

🔍 Flight Search — Search flights by origin, destination, and date
🎫 Flight Booking — Select economy or first class and proceed to payment
💳 Payment Page — Secure payment form with booking confirmation
👤 User Profile — View all personal bookings
🔐 Authentication — Register, login, and logout with session management
🛡️ Admin Dashboard — Manage flights and view all bookings
📱 Responsive Design — Works on mobile, tablet, and desktop

🛠️ Tech Stack
LayerTechnologyFrontendHTML5, CSS3, JavaScript (ES6+)UI FrameworkBootstrap 5.3IconsBootstrap IconsFontsGoogle Fonts (Outfit)BackendPHP 8+DatabaseMySQLAuthPHP Sessions + password_hash (bcrypt)

📁 Project Structure
airbridge/
├── index.html          # Home page with flight search
├── flights.html        # Flight results listing
├── payment.html        # Payment & booking confirmation
├── profile.html        # User bookings page
├── login.html          # Login page (Passenger + Admin)
├── register.html       # Registration page
├── admin.html          # Admin dashboard
├── style.css           # Global stylesheet
├── script.js           # Frontend JavaScript logic
├── database.sql        # MySQL database setup file
├── js/
│   └── data-manager.js # API connector (JS ↔ PHP)
└── api/
    ├── config.php      # Database configuration
    ├── auth.php        # Register / Login / Logout / Me
    ├── flights.php     # Get / Add / Delete flights
    ├── bookings.php    # Create / Get bookings
    └── functions.php   # Helper functions

    🔐 Default Admin Account
FieldValue
📧 Email: admin@airbridge.com
🔑 Password: admin123
🛡️ Role: Admin

⚠️ Important: Change the admin password immediately after first login in a production environment.

🙏 Credits

Background images: Unsplash
UI Framework: Bootstrap 5
Icons: Bootstrap Icons
Fonts: Google Fonts — Outfit


<p align="center">Made with ❤️ — Airbridge Flight Booking System</p>
