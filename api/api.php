<?php


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';


$DEBUG = true;

/**
 * Helper: check if a column exists in a table
 */
function columnExists($conn, $table, $column) {
    $safeTable = $conn->real_escape_string($table);
    $safeColumn = $conn->real_escape_string($column);
    $res = $conn->query("SHOW COLUMNS FROM `{$safeTable}` LIKE '{$safeColumn}'");
    return ($res && $res->num_rows > 0);
}


$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? null;

try {
    switch ($action) {
        case 'createBooking':
            handleCreateBooking($input);
            break;
        case 'getBookings':
            handleGetBookings($input);
            break;
        case 'adminUpdateBooking':
            handleAdminUpdateBooking($input);
            break;
        case 'adminDeleteBooking':
            handleAdminDeleteBooking($input);
            break;
        case 'updateBooking':
            handleUpdateBooking($input);
            break;
        case 'deleteBooking':
            handleDeleteBooking($input);
            break;
        case 'signup':
            handleSignup($input);
            break;
        case 'verifyEmail':
            handleVerifyEmail($input);
            break;
        case 'login':
            handleLogin($input);
            break;
        case 'adminLogin':
            handleAdminLogin($input);
            break;
        case 'resetPassword':
            handleResetPassword($input);
            break;
        case 'getUserByEmail':
            handleGetUserByEmail($input);
            break;
        case 'verifyFirebaseToken':
            handleVerifyFirebaseToken($input);
            break;
        case 'applyOobCode':
            handleApplyOobCode($input);
            break;
        case 'getServices':
            handleGetServices($input);
            break;
        case 'createService':
            handleCreateService($input);
            break;
        case 'updateService':
            handleUpdateService($input);
            break;
        case 'deleteService':
            handleDeleteService($input);
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


function handleSignup($input) {
    global $conn;

    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $contact = trim($input['contact'] ?? '');
    $password = $input['password'] ?? '';
    $role = 'customer'; 

   
    if (empty($name) || empty($email) || empty($contact) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'All fields are required'
        ]);
        return;
    }

   
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email format'
        ]);
        return;
    }

  
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
   
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

  
    $verifyToken = bin2hex(random_bytes(16));
    $tokenExpiry = date('Y-m-d H:i:s', strtotime('+1 day'));

   
    $hasIsVerified = columnExists($conn, 'users', 'is_verified');
    $hasVerifyToken = columnExists($conn, 'users', 'verify_token');
    $hasVerifyExpiry = columnExists($conn, 'users', 'verify_expires');

    if (!($hasIsVerified && $hasVerifyToken && $hasVerifyExpiry)) {
        
        $alterErrors = [];
        if (!$hasIsVerified) {
            if (!$conn->query("ALTER TABLE users ADD COLUMN is_verified TINYINT(1) DEFAULT 0")) {
                $alterErrors[] = $conn->error;
            }
        }
        if (!$hasVerifyToken) {
            if (!$conn->query("ALTER TABLE users ADD COLUMN verify_token VARCHAR(128) DEFAULT NULL")) {
                $alterErrors[] = $conn->error;
            }
        }
        if (!$hasVerifyExpiry) {
            if (!$conn->query("ALTER TABLE users ADD COLUMN verify_expires DATETIME DEFAULT NULL")) {
                $alterErrors[] = $conn->error;
            }
        }

        if (!empty($alterErrors)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database missing verification columns and automatic migration failed: ' . implode('; ', $alterErrors)]);
            return;
        }
    }

  
    $stmt = $conn->prepare('INSERT INTO users (name, email, contact, password, role, is_verified, verify_token, verify_expires) VALUES (?, ?, ?, ?, ?, 0, ?, ?)');
    $stmt->bind_param('sssssss', $name, $email, $contact, $hashedPassword, $role, $verifyToken, $tokenExpiry);

    if ($stmt->execute()) {
        $userId = $conn->insert_id;

        
        $verificationLink = (isset($_SERVER['HTTP_HOST']) ? ($_SERVER['REQUEST_SCHEME'] ?? 'http') . '://' . $_SERVER['HTTP_HOST'] : 'http://localhost') . dirname($_SERVER['REQUEST_URI']) . '/api.php?action=verifyEmail&token=' . $verifyToken;

        
        $mailSent = false;
        $subject = 'Verify your GlamConnect email';
        $message = "Hi {$name},\n\nPlease verify your email by clicking the link below:\n{$verificationLink}\n\nThis link expires in 24 hours.\n\nIf you didn't sign up, ignore this email.\n";
        $headers = 'From: no-reply@glamconnect.local';
        if (function_exists('mail')) {
            $mailSent = mail($email, $subject, $message, $headers);
        }

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Signup successful. Verification email sent (or token returned for local testing). Please verify your email before logging in.',
            'verification' => [
                'token' => $verifyToken,
                'link' => $verificationLink,
                'mail_sent' => $mailSent
            ],
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
        $err = $conn->error ?? 'Error creating user';
        echo json_encode([
            'success' => false,
            'message' => 'Error creating user: ' . $err
        ]);
    }
    $stmt->close();
}


function handleVerifyEmail($input) {
    global $conn;
    
    $token = trim($input['token'] ?? ($_GET['token'] ?? ''));
    if (!$token) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing token']);
        return;
    }

    // Find user by token and check expiry
    $stmt = $conn->prepare('SELECT userID, verify_expires FROM users WHERE verify_token = ?');
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Invalid token']);
        $stmt->close();
        return;
    }
    $row = $res->fetch_assoc();
    $stmt->close();

    if (!empty($row['verify_expires']) && strtotime($row['verify_expires']) < time()) {
        http_response_code(410);
        echo json_encode(['success' => false, 'message' => 'Token expired']);
        return;
    }

    
    $upd = $conn->prepare('UPDATE users SET is_verified = 1, verify_token = NULL, verify_expires = NULL WHERE userID = ?');
    $upd->bind_param('i', $row['userID']);
    if ($upd->execute()) {
        echo json_encode(['success' => true, 'message' => 'Email verified. You may now login.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to verify email']);
    }
    $upd->close();
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
    $stmt = $conn->prepare('SELECT userID, name, email, contact, password, role, is_verified FROM users WHERE email = ?');
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

    // Ensure email is verified if the column exists
    if (isset($user['is_verified'])) {
        if (intval($user['is_verified']) !== 1) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Email not verified. Please check your email for verification link.'
            ]);
            return;
        }
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
 * Handle admin/staff login
 * Authenticates against admin_users table with role-based access
 */
function handleAdminLogin($input) {
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

    // First check if admin_users table exists
    $tableCheck = $conn->query("SHOW TABLES LIKE 'admin_users'");
    if ($tableCheck->num_rows === 0) {
        // Create admin_users table if it doesn't exist
        $createTable = "CREATE TABLE admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(100),
            role ENUM('super_admin', 'admin', 'staff') NOT NULL DEFAULT 'staff',
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        $conn->query($createTable);

        // Insert default admin user
        $defaultPassword = password_hash('admin123', PASSWORD_BCRYPT);
        $conn->query("INSERT INTO admin_users (username, email, password, full_name, role) VALUES 
            ('admin', 'admin@glamconnect.com', '$defaultPassword', 'System Administrator', 'super_admin')");
        
        // Insert default staff user
        $staffPassword = password_hash('staff123', PASSWORD_BCRYPT);
        $conn->query("INSERT INTO admin_users (username, email, password, full_name, role) VALUES 
            ('staff1', 'staff@glamconnect.com', '$staffPassword', 'Staff Member', 'staff')");
    }

    // Fetch admin user by email
    $stmt = $conn->prepare('SELECT id, username, email, password, full_name, role, is_active FROM admin_users WHERE email = ?');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid credentials'
        ]);
        $stmt->close();
        return;
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    // Check if account is active
    if (!$user['is_active']) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Account is deactivated. Contact administrator.'
        ]);
        return;
    }

    // Verify password
    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid credentials'
        ]);
        return;
    }

    // Generate token (simple implementation - use JWT in production)
    $token = bin2hex(random_bytes(32));

    // Return success with user data
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'full_name' => $user['full_name'],
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

/**
 * Get user by email (used after Firebase login to retrieve backend userID)
 */
function handleGetUserByEmail($input) {
    global $conn;
    $email = trim($input['email'] ?? '');
    if (!$email) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email required']);
        return;
    }

    $stmt = $conn->prepare('SELECT userID, name, email, contact, role FROM users WHERE email = ? LIMIT 1');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        $stmt->close();
        return;
    }
    $user = $res->fetch_assoc();
    $stmt->close();

    echo json_encode(['success' => true, 'user' => [
        'userID' => $user['userID'],
        'name' => $user['name'],
        'email' => $user['email'],
        'contact' => $user['contact'],
        'role' => $user['role']
    ]]);
}

/**
 * Verify Firebase ID token (via Firebase REST API) and mark the corresponding
 * backend user as verified. Expects: idToken (required), apiKey (required)
 *
 * This is a lightweight integration that calls the Firebase Identity Toolkit
 * REST endpoint accounts:lookup to inspect the token and emailVerified flag.
 * If emailVerified is true, the user's `is_verified` column is set to 1.
 */
function handleVerifyFirebaseToken($input) {
    global $conn;
    $idToken = trim($input['idToken'] ?? '');
    $apiKey = trim($input['apiKey'] ?? '');

    if (!$idToken || !$apiKey) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'idToken and apiKey are required']);
        return;
    }

    // Call Firebase REST API: accounts:lookup
    $url = 'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' . urlencode($apiKey);
    $payload = json_encode(['idToken' => $idToken]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    $resp = curl_exec($ch);
    $err = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($resp === false || $httpCode !== 200) {
        http_response_code(400);
        $msg = 'Failed to validate idToken with Firebase';
        if ($err) $msg .= ': ' . $err;
        // If Firebase returned JSON, include that for debugging
        echo json_encode(['success' => false, 'message' => $msg, 'firebase_response' => $resp]);
        return;
    }

    $json = json_decode($resp, true);
    if (empty($json['users']) || !is_array($json['users'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid Firebase response', 'firebase_response' => $json]);
        return;
    }

    $userInfo = $json['users'][0];
    $email = $userInfo['email'] ?? '';
    $emailVerified = isset($userInfo['emailVerified']) ? boolval($userInfo['emailVerified']) : false;

    if (!$email) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email not present in token']);
        return;
    }

    if (!$emailVerified) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Email not verified according to Firebase', 'email' => $email]);
        return;
    }

    // Update backend user to mark as verified
    $stmt = $conn->prepare('UPDATE users SET is_verified = 1, verify_token = NULL, verify_expires = NULL WHERE email = ?');
    $stmt->bind_param('s', $email);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'User marked verified', 'email' => $email]);
    } else {
        http_response_code(500);
        $errMsg = 'Failed to update user: ' . ($conn->error ?? 'unknown');
        echo json_encode(['success' => false, 'message' => $errMsg]);
    }
    $stmt->close();
}

/**
 * Apply an out-of-band code (oobCode) from Firebase email action links and
 * mark backend user as verified when the action is successful.
 * Expects: oobCode (required), apiKey (required)
 */
function handleApplyOobCode($input) {
    global $conn;
    $oobCode = trim($input['oobCode'] ?? '');
    $apiKey = trim($input['apiKey'] ?? '');

    if (!$oobCode || !$apiKey) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'oobCode and apiKey are required']);
        return;
    }

    $url = 'https://identitytoolkit.googleapis.com/v1/accounts:update?key=' . urlencode($apiKey);
    $payload = json_encode(['oobCode' => $oobCode]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    $resp = curl_exec($ch);
    $err = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($resp === false || $httpCode !== 200) {
        http_response_code(400);
        $msg = 'Failed to apply oobCode with Firebase';
        if ($err) $msg .= ': ' . $err;
        echo json_encode(['success' => false, 'message' => $msg, 'firebase_response' => $resp]);
        return;
    }

    $json = json_decode($resp, true);
    // Successful response contains 'email' and 'requestType' etc.
    $email = $json['email'] ?? '';
    $requestType = $json['requestType'] ?? '';

    if (!$email) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Firebase did not return email', 'firebase_response' => $json]);
        return;
    }

    // If the action was verifyEmail (or accounts:update applied it), mark user verified
    if ($requestType === 'VERIFY_EMAIL' || true) {
        $stmt = $conn->prepare('UPDATE users SET is_verified = 1, verify_token = NULL, verify_expires = NULL WHERE email = ?');
        $stmt->bind_param('s', $email);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Email verified and user updated', 'email' => $email]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update user: ' . ($conn->error ?? 'unknown')]);
        }
        $stmt->close();
        return;
    }

    echo json_encode(['success' => false, 'message' => 'Unhandled action from Firebase', 'firebase_response' => $json]);
}

/**
 * Create a booking
 * Required input: userID, serviceId, date, time, notes (optional)
 */
function handleCreateBooking($input) {
    global $conn;

    $userID = intval($input['userID'] ?? 0);
    $serviceId = intval($input['serviceId'] ?? 0);
    $date = trim($input['date'] ?? '');
    $time = trim($input['time'] ?? '');
    $notes = trim($input['notes'] ?? '');

    // Check actual column names
    $userIdCol = columnExists($conn, 'bookings', 'userID') ? 'userID' : 'user_id';
    $serviceIdCol = columnExists($conn, 'bookings', 'serviceID') ? 'serviceID' : 'service_id';
    $hasServiceCol = columnExists($conn, 'bookings', 'serviceID') || columnExists($conn, 'bookings', 'service_id');

    // Validate required inputs
    if (!$userID || !$date || !$time) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }
    if ($hasServiceCol && !$serviceId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing serviceId']);
        return;
    }

    if ($hasServiceCol) {
        $stmt = $conn->prepare("INSERT INTO bookings ({$userIdCol}, date, time, notes, {$serviceIdCol}) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param('isssi', $userID, $date, $time, $notes, $serviceId);
    } else {
        $stmt = $conn->prepare("INSERT INTO bookings ({$userIdCol}, date, time, notes) VALUES (?, ?, ?, ?)");
        $stmt->bind_param('isss', $userID, $date, $time, $notes);
    }

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Booking created', 'bookingID' => $conn->insert_id]);
    } else {
        http_response_code(500);
        $errMsg = 'Error creating booking';
        if (!empty($DEBUG) && isset($conn->error)) {
            $errMsg .= ': ' . $conn->error;
        }
        error_log('Booking create failed: ' . ($conn->error ?? 'unknown'));
        echo json_encode(['success' => false, 'message' => $errMsg]);
    }
    $stmt->close();
}

/**
 * Get bookings for a user (or all if admin)
 * Input: userID (optional) - if provided, only return bookings for that user
 * Returns bookings with user name, email, and service name
 */
function handleGetBookings($input) {
    global $conn;
    $userID = intval($input['userID'] ?? 0);

    // Check actual column names in bookings table
    $hasServiceIDCol = columnExists($conn, 'bookings', 'serviceID');
    $hasServiceIdCol = columnExists($conn, 'bookings', 'service_id');
    $hasStatusCol = columnExists($conn, 'bookings', 'status');
    
    // Determine correct column names (database uses userID and serviceID based on error)
    $userIdCol = columnExists($conn, 'bookings', 'userID') ? 'userID' : 'user_id';
    $serviceIdCol = $hasServiceIDCol ? 'serviceID' : ($hasServiceIdCol ? 'service_id' : 'serviceID');
    
    $selectFields = "b.id, b.{$userIdCol} as user_id, b.date, b.time, b.notes, u.name, u.email";
    if ($hasServiceIDCol || $hasServiceIdCol) $selectFields .= ", b.{$serviceIdCol} as service_id, s.service_name";
    if ($hasStatusCol) $selectFields .= ', b.status';

    if ($userID) {
        $sql = "SELECT {$selectFields} FROM bookings b 
                LEFT JOIN users u ON b.{$userIdCol} = u.userID 
                LEFT JOIN services s ON b.{$serviceIdCol} = s.id 
                WHERE b.{$userIdCol} = ? ORDER BY b.date DESC, b.time DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $userID);
    } else {
        $sql = "SELECT {$selectFields} FROM bookings b 
                LEFT JOIN users u ON b.{$userIdCol} = u.userID 
                LEFT JOIN services s ON b.{$serviceIdCol} = s.id 
                ORDER BY b.date DESC, b.time DESC";
        $stmt = $conn->prepare($sql);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $rows = [];
    while ($r = $result->fetch_assoc()) {
        $rows[] = $r;
    }

    echo json_encode(['success' => true, 'bookings' => $rows]);
    $stmt->close();
}

/**
 * Update a booking. Only owner may update.
 * Input: bookingID, userID, date, time, notes
 */
function handleUpdateBooking($input) {
    global $conn;
    $bookingID = intval($input['bookingID'] ?? 0);
    $userID = intval($input['userID'] ?? 0);
    $date = trim($input['date'] ?? '');
    $time = trim($input['time'] ?? '');
    $notes = trim($input['notes'] ?? '');

    if (!$bookingID || !$userID) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing bookingID or userID']);
        return;
    }

    // Determine correct column name
    $userIdCol = columnExists($conn, 'bookings', 'userID') ? 'userID' : 'user_id';

    // verify ownership
    $check = $conn->prepare("SELECT {$userIdCol} as user_id FROM bookings WHERE id = ?");
    $check->bind_param('i', $bookingID);
    $check->execute();
    $res = $check->get_result();
    if ($res->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Booking not found']);
        $check->close();
        return;
    }
    $row = $res->fetch_assoc();
    if (intval($row['user_id']) !== $userID) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Not authorized to update this booking']);
        $check->close();
        return;
    }
    $check->close();

    $stmt = $conn->prepare('UPDATE bookings SET date = ?, time = ?, notes = ? WHERE id = ?');
    $stmt->bind_param('sssi', $date, $time, $notes, $bookingID);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Booking updated']);
    } else {
        http_response_code(500);
        $errMsg = 'Error updating booking';
        if (!empty($DEBUG) && isset($conn->error)) { $errMsg .= ': ' . $conn->error; }
        error_log('Booking update failed: ' . ($conn->error ?? 'unknown'));
        echo json_encode(['success' => false, 'message' => $errMsg]);
    }
    $stmt->close();
}

/**
 * Delete a booking. Only owner may delete.
 * Input: bookingID, userID
 */
function handleDeleteBooking($input) {
    global $conn;
    $bookingID = intval($input['bookingID'] ?? 0);
    $userID = intval($input['userID'] ?? 0);

    if (!$bookingID || !$userID) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing bookingID or userID']);
        return;
    }

    // Determine correct column name
    $userIdCol = columnExists($conn, 'bookings', 'userID') ? 'userID' : 'user_id';

    // verify ownership
    $check = $conn->prepare("SELECT {$userIdCol} as user_id FROM bookings WHERE id = ?");
    $check->bind_param('i', $bookingID);
    $check->execute();
    $res = $check->get_result();
    if ($res->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Booking not found']);
        $check->close();
        return;
    }
    $row = $res->fetch_assoc();
    if (intval($row['user_id']) !== $userID) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Not authorized to delete this booking']);
        $check->close();
        return;
    }
    $check->close();

    $stmt = $conn->prepare('DELETE FROM bookings WHERE id = ?');
    $stmt->bind_param('i', $bookingID);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Booking deleted']);
    } else {
        http_response_code(500);
        $errMsg = 'Error deleting booking';
        if (!empty($DEBUG) && isset($conn->error)) { $errMsg .= ': ' . $conn->error; }
        error_log('Booking delete failed: ' . ($conn->error ?? 'unknown'));
        echo json_encode(['success' => false, 'message' => $errMsg]);
    }
    $stmt->close();
}

/**
 * Admin: update any booking (status, date, time, notes, service_id)
 * Expects: bookingID (required) and fields to update. No ownership checks.
 */
function handleAdminUpdateBooking($input) {
    global $conn;
    $bookingID = intval($input['bookingID'] ?? 0);
    if (!$bookingID) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'bookingID required']);
        return;
    }

    $fields = [];
    $params = [];
    $types = '';

    if (isset($input['date'])) { $fields[] = 'date = ?'; $params[] = $input['date']; $types .= 's'; }
    if (isset($input['time'])) { $fields[] = 'time = ?'; $params[] = $input['time']; $types .= 's'; }
    if (isset($input['notes'])) { $fields[] = 'notes = ?'; $params[] = $input['notes']; $types .= 's'; }
    if (isset($input['status'])) { $fields[] = 'status = ?'; $params[] = $input['status']; $types .= 's'; }

    // Check for correct service column name
    $hasServiceID = columnExists($conn, 'bookings', 'serviceID');
    $hasServiceId = columnExists($conn, 'bookings', 'service_id');
    if (($hasServiceID || $hasServiceId) && isset($input['service_id'])) {
        $serviceCol = $hasServiceID ? 'serviceID' : 'service_id';
        $fields[] = "{$serviceCol} = ?"; 
        $params[] = intval($input['service_id']); 
        $types .= 'i';
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        return;
    }

    $types .= 'i'; // bookingID at the end
    $params[] = $bookingID;

    $sql = 'UPDATE bookings SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Booking updated by admin']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error updating booking: ' . ($conn->error ?? '')]);
    }
    $stmt->close();
}

/**
 * Admin: delete any booking
 * Expects: bookingID
 */
function handleAdminDeleteBooking($input) {
    global $conn;
    $bookingID = intval($input['bookingID'] ?? 0);
    if (!$bookingID) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'bookingID required']);
        return;
    }

    $stmt = $conn->prepare('DELETE FROM bookings WHERE id = ?');
    $stmt->bind_param('i', $bookingID);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Booking deleted']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error deleting booking: ' . ($conn->error ?? '')]);
    }
    $stmt->close();
}

/**
 * Get all services
 */
function handleGetServices($input) {
    global $conn;
    
    // Check if services table exists, create if not
    $tableCheck = $conn->query("SHOW TABLES LIKE 'services'");
    if ($tableCheck->num_rows === 0) {
        $conn->query("CREATE TABLE IF NOT EXISTS services (
            id INT AUTO_INCREMENT PRIMARY KEY,
            service_name VARCHAR(255) NOT NULL,
            category VARCHAR(100) DEFAULT 'Hair',
            description TEXT,
            price DECIMAL(10, 2),
            duration VARCHAR(50) DEFAULT '30 mins',
            image_url VARCHAR(500),
            icon VARCHAR(10) DEFAULT '💇',
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )");
    }
    
    // Select all relevant columns from services table
    $stmt = $conn->prepare("SELECT id, service_name, category, description, price, duration, image_url, icon, is_active, created_at, updated_at FROM services ORDER BY service_name ASC");
    $stmt->execute();
    $result = $stmt->get_result();
    $services = [];
    while ($r = $result->fetch_assoc()) {
        $services[] = $r;
    }
    
    echo json_encode(['success' => true, 'services' => $services]);
    $stmt->close();
}

/**
 * Create a new service
 * Input: service_name, description, price, image_url
 */
function handleCreateService($input) {
    global $conn;
    
    $service_name = trim($input['service_name'] ?? '');
    $category = trim($input['category'] ?? 'Hair');
    $description = trim($input['description'] ?? '');
    $price = floatval($input['price'] ?? 0);
    $duration = trim($input['duration'] ?? '30 mins');
    $image_url = trim($input['image_url'] ?? '');
    $icon = trim($input['icon'] ?? '💇');
    $is_active = intval($input['is_active'] ?? 1);
    
    if (!$service_name) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Service name required']);
        return;
    }
    
    $stmt = $conn->prepare("INSERT INTO services (service_name, category, description, price, duration, image_url, icon, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param('sssdsssi', $service_name, $category, $description, $price, $duration, $image_url, $icon, $is_active);
    
    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Service created', 'serviceID' => $conn->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error creating service: ' . ($conn->error ?? '')]);
    }
    $stmt->close();
}

/**
 * Update a service
 * Input: id, service_name, description, price, image_url
 */
function handleUpdateService($input) {
    global $conn;
    
    $id = intval($input['id'] ?? 0);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Service ID required']);
        return;
    }
    
    $fields = [];
    $params = [];
    $types = '';
    
    if (isset($input['service_name'])) { $fields[] = 'service_name = ?'; $params[] = $input['service_name']; $types .= 's'; }
    if (isset($input['category'])) { $fields[] = 'category = ?'; $params[] = $input['category']; $types .= 's'; }
    if (isset($input['description'])) { $fields[] = 'description = ?'; $params[] = $input['description']; $types .= 's'; }
    if (isset($input['price'])) { $fields[] = 'price = ?'; $params[] = floatval($input['price']); $types .= 'd'; }
    if (isset($input['duration'])) { $fields[] = 'duration = ?'; $params[] = $input['duration']; $types .= 's'; }
    if (isset($input['image_url'])) { $fields[] = 'image_url = ?'; $params[] = $input['image_url']; $types .= 's'; }
    if (isset($input['icon'])) { $fields[] = 'icon = ?'; $params[] = $input['icon']; $types .= 's'; }
    if (isset($input['is_active'])) { $fields[] = 'is_active = ?'; $params[] = intval($input['is_active']); $types .= 'i'; }
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        return;
    }
    
    $types .= 'i';
    $params[] = $id;
    
    $sql = 'UPDATE services SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Service updated']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error updating service: ' . ($conn->error ?? '')]);
    }
    $stmt->close();
}

/**
 * Delete a service
 * Input: id
 */
function handleDeleteService($input) {
    global $conn;
    
    $id = intval($input['id'] ?? 0);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Service ID required']);
        return;
    }
    
    $stmt = $conn->prepare('DELETE FROM services WHERE id = ?');
    $stmt->bind_param('i', $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Service deleted']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error deleting service: ' . ($conn->error ?? '')]);
    }
    $stmt->close();
}

?>
