<?php
// ============================================
// api/auth.php — Register / Login / Logout / Me
// ============================================
require_once 'config.php';
setHeaders();
startSession();

$action = $_GET['action'] ?? '';

switch ($action) {

    // ── REGISTER ──────────────────────────────
    case 'register':
        $data = json_decode(file_get_contents('php://input'), true);
        $name     = trim($data['name'] ?? '');
        $email    = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';

        if (!$name || !$email || !$password) {
            echo json_encode(['success' => false, 'message' => 'All fields are required.']);
            break;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
            break;
        }
        if (strlen($password) < 6) {
            echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
            break;
        }

        $db = getDB();
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param('s', $email);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'Email already registered.']);
            $db->close(); break;
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $db->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'passenger')");
        $stmt->bind_param('sss', $name, $email, $hash);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Registration successful.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Registration failed.']);
        }
        $db->close();
        break;

    // ── LOGIN ─────────────────────────────────
    case 'login':
        $data     = json_decode(file_get_contents('php://input'), true);
        $email    = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            echo json_encode(['success' => false, 'message' => 'Email and password required.']);
            break;
        }

        $db   = getDB();
        $stmt = $db->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            echo json_encode(['success' => false, 'message' => 'No account found with that email.']);
            $db->close(); break;
        }

        $user = $result->fetch_assoc();
        if (!password_verify($password, $user['password'])) {
            echo json_encode(['success' => false, 'message' => 'Incorrect password.']);
            $db->close(); break;
        }

        // Store in session
        $_SESSION['user_id']    = $user['id'];
        $_SESSION['user_name']  = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role']  = $user['role'];

        echo json_encode([
            'success' => true,
            'user'    => [
                'id'    => $user['id'],
                'name'  => $user['name'],
                'email' => $user['email'],
                'role'  => $user['role'],
            ]
        ]);
        $db->close();
        break;

    // ── LOGOUT ────────────────────────────────
    case 'logout':
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Logged out.']);
        break;

    // ── CURRENT USER ──────────────────────────
    case 'me':
        if (isset($_SESSION['user_id'])) {
            echo json_encode([
                'success' => true,
                'user'    => [
                    'id'    => $_SESSION['user_id'],
                    'name'  => $_SESSION['user_name'],
                    'email' => $_SESSION['user_email'],
                    'role'  => $_SESSION['user_role'],
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'user' => null]);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action.']);
}
