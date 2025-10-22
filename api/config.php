<?php
/**
 * Database Configuration for Localhost
 * Configure these credentials for your local MySQL setup
 */

// Database credentials
$db_host = 'localhost'; // MySQL host (localhost for local development)
$db_name = 'glamconnect_db'; // Your local database name
$db_user = 'root'; // Your MySQL username (usually 'root' by default)
$db_password = ''; // Your MySQL password (empty by default for localhost)

// Create connection
try {
    $conn = new mysqli($db_host, $db_user, $db_password, $db_name);

    // Check connection
    if ($conn->connect_error) {
        throw new Exception('Database connection failed: ' . $conn->connect_error);
    }

    // Set charset to UTF-8
    $conn->set_charset('utf8');

} catch (Exception $e) {
    http_response_code(500);
    die(json_encode([
        'success' => false,
        'message' => 'Database connection error'
    ]));
}

?>
