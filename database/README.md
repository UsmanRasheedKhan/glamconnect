# GlamConnect Database Setup Guide

## Overview
This guide will help you set up the complete database structure for the GlamConnect salon management system.

## Prerequisites
- MySQL 5.7+ or MariaDB 10.2+
- phpMyAdmin (optional, for GUI management)
- Access to MySQL command line or GUI tool

## Quick Setup Instructions

### Option 1: Using phpMyAdmin (Easiest)
1. Open phpMyAdmin in your browser
2. Click on "New" to create a new database
3. Name it `glamconnect` and set collation to `utf8mb4_unicode_ci`
4. Click on the newly created database
5. Go to the "Import" tab
6. Click "Choose File" and select `glamconnect_schema.sql`
7. Click "Go" to execute the SQL script

### Option 2: Using MySQL Command Line
```bash
# 1. Login to MySQL
mysql -u root -p

# 2. Create the database
CREATE DATABASE glamconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 3. Exit MySQL
exit

# 4. Import the SQL file
mysql -u root -p glamconnect < database/glamconnect_schema.sql
```

### Option 3: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Go to Server → Data Import
4. Select "Import from Self-Contained File"
5. Browse and select `glamconnect_schema.sql`
6. Select "New..." under Default Target Schema and name it `glamconnect`
7. Click "Start Import"

## Database Structure

### Tables Created
1. **users** - Stores user accounts and profiles
2. **services** - Stores all salon services
3. **bookings** - Stores service bookings
4. **admin_users** - Stores admin accounts
5. **contact_messages** - Stores contact form submissions
6. **gallery** - Stores gallery images

### Default Admin Credentials
After setup, you can login to the admin panel with:
- **Username:** admin
- **Email:** admin@glamconnect.com
- **Password:** admin123 (You should change this immediately!)

**Important:** The passwords in the sample data are placeholders. You need to hash them properly using bcrypt/password_hash before using in production.

## Database Configuration

### Update your API config file
Edit `api/config.php` with your database credentials:

```php
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'glamconnect');
define('DB_USER', 'root'); // Change this
define('DB_PASS', ''); // Change this
?>
```

## Verification

After setup, verify the installation:

```sql
-- Check if all tables are created
SHOW TABLES;

-- Verify sample data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM services;
SELECT COUNT(*) FROM bookings;
SELECT COUNT(*) FROM admin_users;

-- Check views
SELECT * FROM upcoming_bookings_view LIMIT 5;
SELECT * FROM user_booking_history LIMIT 5;
```

Expected output:
- 6 tables total
- 3 users
- 12 services
- 4 bookings
- 2 admin users

## Database Features

### 1. Views
- `upcoming_bookings_view` - Shows all upcoming bookings with full details
- `user_booking_history` - Aggregated user booking statistics

### 2. Stored Procedures
- `get_available_slots(date, service_id)` - Returns available time slots

Usage example:
```sql
CALL get_available_slots('2025-12-30', 1);
```

### 3. Indexes
Optimized indexes for:
- Email lookups
- Booking date queries
- Service category filtering
- User booking history

## Maintenance

### Backup Database
```bash
# Full backup
mysqldump -u root -p glamconnect > backup_glamconnect_$(date +%Y%m%d).sql

# Data only (no structure)
mysqldump -u root -p --no-create-info glamconnect > data_backup.sql
```

### Restore Database
```bash
mysql -u root -p glamconnect < backup_file.sql
```

### Clear All Data (Keep Structure)
```sql
-- Clear all tables but keep structure
TRUNCATE TABLE bookings;
TRUNCATE TABLE contact_messages;
TRUNCATE TABLE gallery;
-- Don't truncate users, services, admin_users unless needed
```

## Troubleshooting

### Error: Access denied
- Check your MySQL username and password
- Ensure the user has proper privileges
- Grant privileges: `GRANT ALL PRIVILEGES ON glamconnect.* TO 'your_user'@'localhost';`

### Error: Table already exists
- Drop the database first: `DROP DATABASE IF EXISTS glamconnect;`
- Then re-run the setup

### Error: Cannot import file
- Check file path is correct
- Ensure file has proper permissions
- Try running SQL commands manually

### Foreign Key Constraints Error
- Ensure InnoDB engine is being used
- Check that MySQL version supports foreign keys
- Verify that referenced tables exist before creating foreign keys

## Security Recommendations

1. **Change default admin password immediately**
2. **Use strong passwords** for database users
3. **Limit database user privileges** - Don't use root in production
4. **Enable SSL** for MySQL connections in production
5. **Regular backups** - Schedule daily backups
6. **Hash all passwords** using bcrypt or Argon2
7. **Sanitize all inputs** to prevent SQL injection

## Production Deployment

Before deploying to production:

1. Update all default passwords
2. Remove or disable sample/test data
3. Set up automated backups
4. Configure proper user privileges
5. Enable MySQL query logging for monitoring
6. Set up database replication if needed
7. Configure connection pooling
8. Enable slow query log for optimization

## Support

For issues or questions:
- Check MySQL error logs: `/var/log/mysql/error.log`
- Review phpMyAdmin console for error messages
- Ensure all tables have proper indexes
- Verify foreign key relationships

## Version History

- **v1.0** - Initial database schema with all core tables
- Includes: Users, Services, Bookings, Admin, Contact, Gallery
- Views and stored procedures for common queries
- Optimized indexes for performance

---

**Last Updated:** December 28, 2025
**Compatibility:** MySQL 5.7+, MariaDB 10.2+
