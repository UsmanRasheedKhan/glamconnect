<?php
/**
 * Database Setup Script
 * Run this script to initialize the GlamConnect database and tables
 * Access it at: http://localhost/glamconnect/api/setup.php
 */

require_once 'config.php';

// Check if database connection is successful
if (!$conn) {
    die("Database connection failed: " . mysqli_connect_error());
}

// SQL to create the users table
$sql = "CREATE TABLE IF NOT EXISTS users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    contact VARCHAR(11) NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

// Execute the query
if ($conn->query($sql) === TRUE) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Users table created successfully (or already exists)',
        'database' => $conn->select_db('glamconnect_db') ? 'glamconnect_db' : 'current'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error creating table: ' . $conn->error
    ]);
}

$conn->close();
?>
