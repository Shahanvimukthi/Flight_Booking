-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 19, 2026 at 07:34 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `airbridge_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` varchar(20) NOT NULL,
  `user_email` varchar(200) NOT NULL,
  `user_name` varchar(150) DEFAULT NULL,
  `flight_id` varchar(20) NOT NULL,
  `flight_num` varchar(20) DEFAULT NULL,
  `airline` varchar(150) DEFAULT NULL,
  `from` varchar(200) DEFAULT NULL,
  `to` varchar(200) DEFAULT NULL,
  `flight_date` date DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `status` enum('Confirmed','Cancelled','Pending') DEFAULT 'Confirmed',
  `booked_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `user_email`, `user_name`, `flight_id`, `flight_num`, `airline`, `from`, `to`, `flight_date`, `price`, `status`, `booked_at`) VALUES
('BK-7B3089', 'tharu@gmail.com', 'Tharushi', 'FL-001', 'FL-001', 'Airbridge Airways', 'New York (JFK)', 'London (LHR)', '2026-04-15', 450.00, 'Confirmed', '2026-03-19 05:51:58');

-- --------------------------------------------------------

--
-- Table structure for table `flights`
--

CREATE TABLE `flights` (
  `id` varchar(20) NOT NULL,
  `airline` varchar(150) NOT NULL,
  `flight_name` varchar(150) DEFAULT NULL,
  `flight_type` varchar(100) DEFAULT NULL,
  `from` varchar(200) NOT NULL,
  `to` varchar(200) NOT NULL,
  `date` date NOT NULL,
  `dep_time` time NOT NULL,
  `arr_time` time NOT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `seats_available` int(11) DEFAULT 100,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `flights`
--

INSERT INTO `flights` (`id`, `airline`, `flight_name`, `flight_type`, `from`, `to`, `date`, `dep_time`, `arr_time`, `duration`, `price`, `seats_available`, `created_at`) VALUES
('FL-001', 'Airbridge Airways', 'Morning Express', 'Boeing 737', 'New York (JFK)', 'London (LHR)', '2026-04-15', '08:00:00', '20:00:00', '12h 0m', 450.00, 100, '2026-03-19 05:51:02'),
('FL-002', 'Sky Wings', 'Evening Star', 'Airbus A320', 'London (LHR)', 'Dubai (DXB)', '2026-04-16', '18:30:00', '23:45:00', '5h 15m', 320.00, 100, '2026-03-19 05:51:02'),
('FL-C6E0D', 'Airbridge Airways', 'Boing express', 'Boeing 737', 'New York (JFK)', 'India', '2026-04-12', '13:51:00', '11:54:00', '22h 3m', 450.00, 100, '2026-03-19 06:21:55');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(200) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('passenger','admin') DEFAULT 'passenger',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(2, 'Tharushi', 'tharu@gmail.com', '$2y$10$eSlU40T9icUj78X0o/5R.euARaZHU4RXFNWtppFrwKEQSik2LqmRe', 'passenger', '2026-03-19 05:49:16'),
(4, 'admin', 'admin@airbridge.com', '$2y$10$SztcRADSEBfbi0rz.MX9fO10MjIaHOvkf7dyoTRoPV7I757cDcZjW', 'admin', '2026-03-19 06:19:17');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_email` (`user_email`),
  ADD KEY `flight_id` (`flight_id`);

--
-- Indexes for table `flights`
--
ALTER TABLE `flights`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_email`) REFERENCES `users` (`email`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`flight_id`) REFERENCES `flights` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
