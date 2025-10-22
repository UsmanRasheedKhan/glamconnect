<?php
/**
 * GlamConnect API Main Router
 * Handles all API requests and routes them to appropriate functions
 * Database: users table with (userID, name, email, contact, password, role)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

// Get request body
$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? null;

try {
    switch ($action) {
        case 'signup':
            handleSignup($input);
            break;
        case 'login':
            handleLogin($input);
            break;
        case 'resetPassword':
            handleResetPassword($input);
            break;
        default:
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid action'
            ]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

/**
 * Handle user signup
 * Stores: name, email, contact, password (hashed), role (default: customer)
 */
function handleSignup($input) {
    global $conn;

    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $contact = trim($input['contact'] ?? '');
    $password = $input['password'] ?? '';
    $role = 'customer'; // Default role

    // Validate inputs
    if (empty($name) || empty($email) || empty($contact) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'All fields are required'
        ]);
        return;
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email format'
        ]);
        return;
    }

    // Check if email already exists
    $stmt = $conn->prepare('SELECT userID FROM users WHERE email = ?');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'Email already registered'
        ]);
        $stmt->close();
        return;
    }
    $stmt->close();

    // Hash password using bcrypt
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Insert user into database
    $stmt = $conn->prepare('INSERT INTO users (name, email, contact, password, role) VALUES (?, ?, ?, ?, ?)');
    $stmt->bind_param('sssss', $name, $email, $contact, $hashedPassword, $role);

    if ($stmt->execute()) {
        $userId = $conn->insert_id;
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Signup successful',
            'user' => [
                'userID' => $userId,
                'name' => $name,
                'email' => $email,
                'contact' => $contact,
                'role' => $role
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error creating user'
        ]);
    }
    $stmt->close();
}

/**
 * Handle user login
 * Frontend sends phone as identifier, we use email in database
 */
function handleLogin($input) {
    global $conn;

    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';

    // Validate inputs
    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Email and password are required'
        ]);
        return;
    }

    // Fetch user by email
    $stmt = $conn->prepare('SELECT userID, name, email, contact, password, role FROM users WHERE email = ?');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password'
        ]);
        $stmt->close();
        return;
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    // Verify password
    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password'
        ]);
        return;
    }

    // Generate simple token (in production, use JWT)
    $token = bin2hex(random_bytes(32));

    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'token' => $token,
        'user' => [
            'userID' => $user['userID'],
            'name' => $user['name'],
            'email' => $user['email'],
            'contact' => $user['contact'],
            'role' => $user['role']
        ]
    ]);
}

/**
 * Handle password reset
 * Frontend sends email and contact, we use only email
 */
function handleResetPassword($input) {
    global $conn;

    $email = trim($input['email'] ?? '');
    $newPassword = $input['newPassword'] ?? '';

    // Validate inputs
    if (empty($email) || empty($newPassword)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Email and new password are required'
        ]);
        return;
    }

    // Fetch user by email
    $stmt = $conn->prepare('SELECT userID FROM users WHERE email = ?');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        $stmt->close();
        return;
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    // Hash new password
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

    // Update password
    $stmt = $conn->prepare('UPDATE users SET password = ? WHERE userID = ?');
    $stmt->bind_param('si', $hashedPassword, $user['userID']);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Password reset successful'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error resetting password'
        ]);
    }
    $stmt->close();
}

?>
