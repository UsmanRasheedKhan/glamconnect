-- =====================================================
-- GlamConnect - Common Database Queries
-- Quick reference for frequently used operations
-- =====================================================

-- =====================================================
-- USER MANAGEMENT QUERIES
-- =====================================================

-- Get user by email
SELECT * FROM users WHERE email = 'user@example.com';

-- Get user by ID
SELECT * FROM users WHERE userID = 1;

-- Get all verified users
SELECT * FROM users WHERE is_verified = 1;

-- Update user verification status
UPDATE users SET is_verified = 1 WHERE email = 'user@example.com';

-- Count total users
SELECT COUNT(*) as total_users FROM users;

-- Get users registered in last 30 days
SELECT * FROM users 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY created_at DESC;

-- =====================================================
-- BOOKING MANAGEMENT QUERIES
-- =====================================================

-- Get all bookings for a specific user
SELECT b.*, s.service_name, s.price, s.duration
FROM bookings b
JOIN services s ON b.serviceID = s.id
WHERE b.userID = 1
ORDER BY b.date DESC, b.time DESC;

-- Get upcoming bookings
SELECT b.*, u.name as user_name, u.email, s.service_name
FROM bookings b
JOIN users u ON b.userID = u.userID
JOIN services s ON b.serviceID = s.id
WHERE b.date >= CURDATE()
AND b.status != 'cancelled'
ORDER BY b.date ASC, b.time ASC;

-- Get today's bookings
SELECT b.*, u.name as user_name, u.contact, s.service_name
FROM bookings b
JOIN users u ON b.userID = u.userID
JOIN services s ON b.serviceID = s.id
WHERE b.date = CURDATE()
ORDER BY b.time ASC;

-- Get bookings by status
SELECT * FROM bookings 
WHERE status = 'pending'
ORDER BY date ASC, time ASC;

-- Count bookings by status
SELECT 
    status,
    COUNT(*) as count
FROM bookings
GROUP BY status;

-- Get available time slots for a date (excluding booked slots)
SELECT TIME_FORMAT(slot_time, '%H:%i') AS available_slot
FROM (
    SELECT '10:00:00' AS slot_time UNION ALL SELECT '10:30:00' UNION ALL
    SELECT '11:00:00' UNION ALL SELECT '11:30:00' UNION ALL
    SELECT '12:00:00' UNION ALL SELECT '12:30:00' UNION ALL
    SELECT '13:00:00' UNION ALL SELECT '13:30:00' UNION ALL
    SELECT '14:00:00' UNION ALL SELECT '14:30:00' UNION ALL
    SELECT '15:00:00' UNION ALL SELECT '15:30:00' UNION ALL
    SELECT '16:00:00' UNION ALL SELECT '16:30:00' UNION ALL
    SELECT '17:00:00' UNION ALL SELECT '17:30:00'
) AS all_slots
WHERE slot_time NOT IN (
    SELECT time FROM bookings 
    WHERE date = '2025-12-30'  -- Replace with desired date
    AND status NOT IN ('cancelled')
)
ORDER BY slot_time;

-- Update booking status
UPDATE bookings 
SET status = 'confirmed', updated_at = NOW()
WHERE id = 1;

-- Cancel a booking
UPDATE bookings 
SET status = 'cancelled', updated_at = NOW()
WHERE id = 1;

-- Mark past bookings as completed
UPDATE bookings 
SET status = 'completed'
WHERE date < CURDATE()
AND status = 'confirmed';

-- Get monthly booking statistics
SELECT 
    DATE_FORMAT(date, '%Y-%m') as month,
    COUNT(*) as total_bookings,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
    SUM(total_price) as revenue
FROM bookings
GROUP BY DATE_FORMAT(date, '%Y-%m')
ORDER BY month DESC;

-- =====================================================
-- SERVICE MANAGEMENT QUERIES
-- =====================================================

-- Get all active services
SELECT * FROM services 
WHERE is_active = 1
ORDER BY category, price;

-- Get services by category
SELECT * FROM services 
WHERE category = 'Hair' AND is_active = 1
ORDER BY price;

-- Get all service categories
SELECT DISTINCT category 
FROM services 
WHERE is_active = 1
ORDER BY category;

-- Get most popular services (by booking count)
SELECT 
    s.id,
    s.service_name,
    s.category,
    s.price,
    COUNT(b.id) as booking_count
FROM services s
LEFT JOIN bookings b ON s.id = b.serviceID
WHERE s.is_active = 1
GROUP BY s.id, s.service_name, s.category, s.price
ORDER BY booking_count DESC
LIMIT 10;

-- Update service price
UPDATE services 
SET price = 350.00, updated_at = NOW()
WHERE id = 1;

-- Deactivate a service
UPDATE services 
SET is_active = 0, updated_at = NOW()
WHERE id = 1;

-- Get service revenue
SELECT 
    s.service_name,
    s.category,
    COUNT(b.id) as times_booked,
    SUM(b.total_price) as total_revenue
FROM services s
LEFT JOIN bookings b ON s.id = b.serviceID AND b.status = 'completed'
GROUP BY s.id, s.service_name, s.category
ORDER BY total_revenue DESC;

-- =====================================================
-- ADMIN QUERIES
-- =====================================================

-- Dashboard statistics
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM bookings WHERE date >= CURDATE()) as upcoming_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pending_bookings,
    (SELECT COUNT(*) FROM bookings WHERE date = CURDATE()) as today_bookings,
    (SELECT SUM(total_price) FROM bookings WHERE status = 'completed' AND MONTH(date) = MONTH(CURDATE())) as monthly_revenue;

-- Get user booking statistics
SELECT 
    u.userID,
    u.name,
    u.email,
    COUNT(b.id) as total_bookings,
    SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
    SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
    SUM(b.total_price) as total_spent,
    MAX(b.date) as last_booking_date
FROM users u
LEFT JOIN bookings b ON u.userID = b.userID
GROUP BY u.userID, u.name, u.email
ORDER BY total_spent DESC;

-- Get daily revenue report
SELECT 
    date,
    COUNT(*) as bookings,
    SUM(total_price) as revenue,
    AVG(total_price) as avg_booking_value
FROM bookings
WHERE status = 'completed'
AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY date
ORDER BY date DESC;

-- =====================================================
-- CONTACT & GALLERY QUERIES
-- =====================================================

-- Get unread contact messages
SELECT * FROM contact_messages 
WHERE status = 'new'
ORDER BY created_at DESC;

-- Mark contact message as read
UPDATE contact_messages 
SET status = 'read'
WHERE id = 1;

-- Get featured gallery images
SELECT * FROM gallery 
WHERE is_featured = 1 AND is_active = 1
ORDER BY display_order;

-- Get gallery by category
SELECT * FROM gallery 
WHERE category = 'Hair' AND is_active = 1
ORDER BY display_order, created_at DESC;

-- =====================================================
-- MAINTENANCE QUERIES
-- =====================================================

-- Check database size
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES 
WHERE table_schema = 'glamconnect'
ORDER BY size_mb DESC;

-- Optimize all tables
OPTIMIZE TABLE users, services, bookings, admin_users, contact_messages, gallery;

-- Check table status
SHOW TABLE STATUS FROM glamconnect;

-- Analyze query performance
EXPLAIN SELECT b.*, u.name, s.service_name
FROM bookings b
JOIN users u ON b.userID = u.userID
JOIN services s ON b.serviceID = s.id
WHERE b.date >= CURDATE();

-- =====================================================
-- DATA CLEANUP QUERIES (Use with caution!)
-- =====================================================

-- Delete old cancelled bookings (older than 6 months)
DELETE FROM bookings 
WHERE status = 'cancelled' 
AND date < DATE_SUB(CURDATE(), INTERVAL 6 MONTH);

-- Delete old contact messages (older than 1 year)
DELETE FROM contact_messages 
WHERE status = 'archived' 
AND created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Remove inactive services with no bookings
DELETE FROM services 
WHERE is_active = 0 
AND id NOT IN (SELECT DISTINCT serviceID FROM bookings);

-- =====================================================
-- BACKUP & RESTORE QUERIES
-- =====================================================

-- Create backup of bookings table
CREATE TABLE bookings_backup AS SELECT * FROM bookings;

-- Restore from backup
INSERT INTO bookings SELECT * FROM bookings_backup;

-- =====================================================
-- USEFUL AGGREGATE QUERIES
-- =====================================================

-- Peak booking hours
SELECT 
    TIME_FORMAT(time, '%H:00') as hour,
    COUNT(*) as booking_count
FROM bookings
WHERE status != 'cancelled'
GROUP BY TIME_FORMAT(time, '%H:00')
ORDER BY booking_count DESC;

-- Most active users
SELECT 
    u.name,
    u.email,
    COUNT(b.id) as booking_count,
    SUM(b.total_price) as total_spent
FROM users u
JOIN bookings b ON u.userID = b.userID
WHERE b.status = 'completed'
GROUP BY u.userID, u.name, u.email
ORDER BY booking_count DESC
LIMIT 10;

-- Service category performance
SELECT 
    s.category,
    COUNT(b.id) as bookings,
    SUM(b.total_price) as revenue,
    AVG(b.total_price) as avg_price
FROM services s
LEFT JOIN bookings b ON s.id = b.serviceID AND b.status = 'completed'
GROUP BY s.category
ORDER BY revenue DESC;

-- =====================================================
-- End of Common Queries
-- =====================================================
