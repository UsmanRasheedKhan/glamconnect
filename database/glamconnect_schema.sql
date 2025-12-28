-- =====================================================
-- GlamConnect Database Schema
-- Professional Salon Management System
-- =====================================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `services`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `gallery`;
DROP TABLE IF EXISTS `contact_messages`;
DROP TABLE IF EXISTS `admin_users`;

-- =====================================================
-- TABLE: users
-- Stores all registered user accounts
-- =====================================================
CREATE TABLE `users` (
  `userID` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `contact` VARCHAR(20) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `is_verified` TINYINT(1) DEFAULT 0 COMMENT '0=not verified, 1=verified',
  `firebase_uid` VARCHAR(128) DEFAULT NULL COMMENT 'Firebase UID for auth',
  `profile_image` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`userID`),
  INDEX `idx_email` (`email`),
  INDEX `idx_firebase_uid` (`firebase_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample users data
INSERT INTO `users` (`name`, `email`, `contact`, `password`, `is_verified`) VALUES
('John Doe', 'john@example.com', '+923001234567', '$2y$10$YourHashedPasswordHere1', 1),
('Jane Smith', 'jane@example.com', '+923007654321', '$2y$10$YourHashedPasswordHere2', 1),
('Sarah Ahmed', 'sarah@example.com', '+923009876543', '$2y$10$YourHashedPasswordHere3', 1);

-- =====================================================
-- TABLE: services
-- Stores all salon services offered
-- =====================================================
CREATE TABLE `services` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `service_name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) DEFAULT NULL COMMENT 'Hair, Nails, Makeup, Facials, Massage',
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `duration` VARCHAR(20) DEFAULT NULL COMMENT 'e.g., 30 mins, 1 hour',
  `image_url` VARCHAR(255) DEFAULT NULL,
  `icon` VARCHAR(10) DEFAULT NULL COMMENT 'Emoji icon for the service',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '1=active, 0=inactive',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample services data
INSERT INTO `services` (`service_name`, `category`, `description`, `price`, `duration`, `icon`, `is_active`) VALUES
('Basic Haircut', 'Hair', 'Professional haircut with basic styling', 300.00, '30 mins', '✂️', 1),
('Hair Coloring', 'Hair', 'Full hair color with premium products', 750.00, '2 hours', '🎨', 1),
('Hair Styling', 'Hair', 'Professional styling for special occasions', 500.00, '1 hour', '💇‍♀️', 1),
('Manicure', 'Nails', 'Professional manicure with nail art options', 1000.00, '45 mins', '💅', 1),
('Pedicure', 'Nails', 'Relaxing pedicure with spa treatment', 2500.00, '1 hour', '👣', 1),
('Nail Art Design', 'Nails', 'Custom nail art design with premium finishes', 2500.00, '1 hour', '✨', 1),
('Makeup Application', 'Makeup', 'Professional makeup for any occasion', 4000.00, '1 hour', '💄', 1),
('Bridal Makeup', 'Makeup', 'Complete bridal makeup package with trials', 12000.00, '2 hours', '👰', 1),
('Facial Treatment', 'Facials', 'Professional facial with premium skincare', 5500.00, '1 hour', '🧖‍♀️', 1),
('Deep Cleansing Facial', 'Facials', 'Deep cleanse with extractions and mask', 3000.00, '1.5 hours', '✨', 1),
('Full Body Massage', 'Massage', 'Relaxing full body massage with oils', 6000.00, '1 hour', '💆‍♂️', 1),
('Head & Neck Massage', 'Massage', 'Therapeutic head and neck massage', 1500.00, '45 mins', '🧘‍♀️', 1);

-- =====================================================
-- TABLE: bookings
-- Stores all service bookings made by users
-- =====================================================
CREATE TABLE `bookings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `userID` INT(11) NOT NULL,
  `serviceID` INT(11) NOT NULL,
  `service_name` VARCHAR(100) DEFAULT NULL COMMENT 'Cached service name',
  `date` DATE NOT NULL,
  `time` TIME NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `status` ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  `total_price` DECIMAL(10,2) DEFAULT NULL,
  `payment_status` ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userID`) REFERENCES `users`(`userID`) ON DELETE CASCADE,
  FOREIGN KEY (`serviceID`) REFERENCES `services`(`id`) ON DELETE CASCADE,
  INDEX `idx_user` (`userID`),
  INDEX `idx_service` (`serviceID`),
  INDEX `idx_date` (`date`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample bookings data
INSERT INTO `bookings` (`userID`, `serviceID`, `service_name`, `date`, `time`, `notes`, `status`, `total_price`) VALUES
(1, 1, 'Basic Haircut', '2025-12-29', '10:00:00', 'Please use scissors only', 'confirmed', 300.00),
(1, 4, 'Manicure', '2025-12-30', '14:00:00', 'French tip design please', 'pending', 1000.00),
(2, 8, 'Bridal Makeup', '2026-01-15', '09:00:00', 'Wedding day makeup - need trial beforehand', 'confirmed', 12000.00),
(3, 11, 'Full Body Massage', '2025-12-28', '16:00:00', 'Medium pressure preferred', 'completed', 6000.00);

-- =====================================================
-- TABLE: admin_users
-- Stores admin accounts for dashboard access
-- =====================================================
CREATE TABLE `admin_users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) DEFAULT NULL,
  `role` ENUM('super_admin', 'admin', 'staff') DEFAULT 'admin',
  `is_active` TINYINT(1) DEFAULT 1,
  `last_login` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_username` (`username`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample admin user (password: admin123 - should be hashed in production)
INSERT INTO `admin_users` (`username`, `email`, `password`, `full_name`, `role`) VALUES
('admin', 'admin@glamconnect.com', '$2y$10$YourHashedPasswordHere', 'System Administrator', 'super_admin'),
('staff1', 'staff@glamconnect.com', '$2y$10$YourHashedPasswordHere', 'Staff Member', 'staff');

-- =====================================================
-- TABLE: contact_messages
-- Stores contact form submissions
-- =====================================================
CREATE TABLE `contact_messages` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `subject` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('new', 'read', 'responded', 'archived') DEFAULT 'new',
  `responded_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample contact messages
INSERT INTO `contact_messages` (`name`, `email`, `phone`, `subject`, `message`, `status`) VALUES
('Alice Johnson', 'alice@example.com', '+923001111111', 'Inquiry about services', 'Hi, I would like to know more about bridal packages.', 'new'),
('Bob Williams', 'bob@example.com', '+923002222222', 'Feedback', 'Great service! Very professional staff.', 'read');

-- =====================================================
-- TABLE: gallery
-- Stores gallery images for the salon
-- =====================================================
CREATE TABLE `gallery` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `category` VARCHAR(50) DEFAULT NULL COMMENT 'Hair, Nails, Makeup, Facials, Massage, Studio',
  `display_order` INT(11) DEFAULT 0,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_featured` (`is_featured`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample gallery items
INSERT INTO `gallery` (`title`, `description`, `image_url`, `category`, `is_featured`) VALUES
('Elegant Bridal Look', 'Beautiful bridal makeup with perfect finishing', '/images/gallery/bridal1.jpg', 'Makeup', 1),
('Modern Hair Color', 'Vibrant balayage hair coloring', '/images/gallery/hair1.jpg', 'Hair', 1),
('Nail Art Design', 'Intricate nail art with floral patterns', '/images/gallery/nails1.jpg', 'Nails', 0),
('Relaxing Facial', 'Deep cleansing facial treatment', '/images/gallery/facial1.jpg', 'Facials', 0);

-- =====================================================
-- TABLE: staff
-- Stores salon staff/employees information
-- =====================================================
CREATE TABLE `staff` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `employee_id` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Unique employee ID like EMP001',
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('stylist', 'beautician', 'therapist', 'nail_artist', 'receptionist', 'manager') DEFAULT 'stylist',
  `specialization` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., Hair Coloring Specialist',
  `profile_image` VARCHAR(255) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `experience_years` INT(11) DEFAULT 0,
  `salary` DECIMAL(10,2) DEFAULT NULL,
  `hire_date` DATE DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `rating` DECIMAL(2,1) DEFAULT 5.0,
  `total_services` INT(11) DEFAULT 0 COMMENT 'Total services completed',
  `working_hours` VARCHAR(50) DEFAULT '9:00 AM - 6:00 PM',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_employee_id` (`employee_id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample staff data
INSERT INTO `staff` (`employee_id`, `full_name`, `email`, `phone`, `password`, `role`, `specialization`, `bio`, `experience_years`, `salary`, `hire_date`, `rating`, `total_services`) VALUES
('EMP001', 'Maria Santos', 'maria@glamconnect.com', '+923001234001', '$2y$10$YourHashedPasswordHere', 'stylist', 'Hair Coloring & Styling', 'Senior hair stylist with 8 years of experience in modern hair trends.', 8, 75000.00, '2020-03-15', 4.9, 342),
('EMP002', 'Ayesha Khan', 'ayesha@glamconnect.com', '+923001234002', '$2y$10$YourHashedPasswordHere', 'beautician', 'Bridal Makeup', 'Expert bridal makeup artist specializing in traditional and modern looks.', 6, 65000.00, '2021-06-01', 4.8, 289),
('EMP003', 'Fatima Ali', 'fatima@glamconnect.com', '+923001234003', '$2y$10$YourHashedPasswordHere', 'therapist', 'Spa & Wellness', 'Certified spa therapist with expertise in aromatherapy and hot stone massage.', 5, 55000.00, '2022-01-10', 4.7, 198),
('EMP004', 'Zara Ahmed', 'zara@glamconnect.com', '+923001234004', '$2y$10$YourHashedPasswordHere', 'nail_artist', 'Nail Art Design', 'Creative nail artist known for intricate designs and gel extensions.', 4, 45000.00, '2022-08-20', 4.9, 456),
('EMP005', 'Hina Malik', 'hina@glamconnect.com', '+923001234005', '$2y$10$YourHashedPasswordHere', 'beautician', 'Skincare & Facials', 'Licensed esthetician specializing in anti-aging and acne treatments.', 7, 60000.00, '2021-02-14', 4.6, 267);

-- =====================================================
-- TABLE: staff_schedule
-- Stores staff working schedules
-- =====================================================
CREATE TABLE `staff_schedule` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `staff_id` INT(11) NOT NULL,
  `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `is_off` TINYINT(1) DEFAULT 0 COMMENT '1 if day off',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON DELETE CASCADE,
  INDEX `idx_staff_day` (`staff_id`, `day_of_week`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample schedule data
INSERT INTO `staff_schedule` (`staff_id`, `day_of_week`, `start_time`, `end_time`, `is_off`) VALUES
(1, 'Monday', '09:00:00', '18:00:00', 0),
(1, 'Tuesday', '09:00:00', '18:00:00', 0),
(1, 'Wednesday', '09:00:00', '18:00:00', 0),
(1, 'Thursday', '09:00:00', '18:00:00', 0),
(1, 'Friday', '09:00:00', '18:00:00', 0),
(1, 'Saturday', '10:00:00', '16:00:00', 0),
(1, 'Sunday', '00:00:00', '00:00:00', 1);

-- =====================================================
-- Additional Useful Views and Procedures
-- =====================================================

-- View: Upcoming bookings with user and service details
CREATE OR REPLACE VIEW `upcoming_bookings_view` AS
SELECT 
    b.id,
    b.date,
    b.time,
    b.status,
    b.notes,
    u.name AS user_name,
    u.email AS user_email,
    u.contact AS user_contact,
    s.service_name,
    s.category,
    s.price,
    s.duration
FROM bookings b
JOIN users u ON b.userID = u.userID
JOIN services s ON b.serviceID = s.id
WHERE b.date >= CURDATE()
ORDER BY b.date ASC, b.time ASC;

-- View: User booking history
CREATE OR REPLACE VIEW `user_booking_history` AS
SELECT 
    u.userID,
    u.name AS user_name,
    u.email,
    COUNT(b.id) AS total_bookings,
    SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_bookings,
    SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings,
    SUM(b.total_price) AS total_spent
FROM users u
LEFT JOIN bookings b ON u.userID = b.userID
GROUP BY u.userID, u.name, u.email;

-- Stored Procedure: Get available time slots for a date
DELIMITER //
CREATE PROCEDURE `get_available_slots`(IN booking_date DATE, IN service_id INT)
BEGIN
    -- Returns time slots that are not already booked
    SELECT TIME_FORMAT(t.slot_time, '%H:%i') AS available_time
    FROM (
        SELECT '10:00:00' AS slot_time UNION ALL
        SELECT '10:30:00' UNION ALL
        SELECT '11:00:00' UNION ALL
        SELECT '11:30:00' UNION ALL
        SELECT '12:00:00' UNION ALL
        SELECT '12:30:00' UNION ALL
        SELECT '13:00:00' UNION ALL
        SELECT '13:30:00' UNION ALL
        SELECT '14:00:00' UNION ALL
        SELECT '14:30:00' UNION ALL
        SELECT '15:00:00' UNION ALL
        SELECT '15:30:00' UNION ALL
        SELECT '16:00:00' UNION ALL
        SELECT '16:30:00' UNION ALL
        SELECT '17:00:00' UNION ALL
        SELECT '17:30:00'
    ) t
    WHERE t.slot_time NOT IN (
        SELECT time FROM bookings 
        WHERE date = booking_date 
        AND serviceID = service_id
        AND status NOT IN ('cancelled')
    )
    ORDER BY t.slot_time;
END //
DELIMITER ;

-- =====================================================
-- Indexes for Performance Optimization
-- =====================================================

-- Composite indexes for common queries
CREATE INDEX idx_booking_user_date ON bookings(userID, date);
CREATE INDEX idx_booking_service_date ON bookings(serviceID, date);
CREATE INDEX idx_booking_status_date ON bookings(status, date);

-- =====================================================
-- Grant Privileges (adjust as needed)
-- =====================================================

-- Example: Grant all privileges to a database user
-- GRANT ALL PRIVILEGES ON glamconnect.* TO 'glamconnect_user'@'localhost' IDENTIFIED BY 'your_secure_password';
-- FLUSH PRIVILEGES;

-- =====================================================
-- End of Schema
-- =====================================================
