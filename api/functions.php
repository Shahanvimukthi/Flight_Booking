<?php
/**
 * includes/functions.php
 * Helper functions: input sanitization, validation, session utilities.
 */

/**
 * Sanitize user input to prevent XSS.
 */
function clean($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

/**
 * Validate email format.
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Check if a user is logged in.
 * Redirects to login page if not.
 */
function requireLogin() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (empty($_SESSION['user_id'])) {
        header('Location: ../auth/login.php');
        exit;
    }
}

/**
 * Check if the logged-in user is an admin.
 * Redirects to index if not.
 */
function requireAdmin() {
    requireLogin();
    if ($_SESSION['user_role'] !== 'admin') {
        header('Location: ../index.php');
        exit;
    }
}

/**
 * Get the current logged-in user from session.
 * Returns array or null.
 */
function getCurrentUser() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    return [
        'id'       => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'email'    => $_SESSION['user_email'],
        'role'     => $_SESSION['user_role'],
    ];
}

/**
 * Generate a unique ID with a prefix.
 */
function generateId($prefix = 'ID') {
    return $prefix . '-' . time() . '-' . rand(100, 999);
}

/**
 * Calculate flight duration from dep and arr times.
 */
function calcDuration($dep, $arr) {
    try {
        list($dh, $dm) = explode(':', $dep);
        list($ah, $am) = explode(':', $arr);
        $mins = ($ah * 60 + $am) - ($dh * 60 + $dm);
        if ($mins < 0) $mins += 24 * 60; // overnight
        $h = intdiv($mins, 60);
        $m = $mins % 60;
        return "{$h}h " . str_pad($m, 2, '0', STR_PAD_LEFT) . "m";
    } catch (Exception $e) {
        return 'N/A';
    }
}

/**
 * Redirect with a session flash message.
 */
function redirectWith($url, $type, $message) {
    if (session_status() === PHP_SESSION_NONE) session_start();
    $_SESSION['flash'] = ['type' => $type, 'message' => $message];
    header("Location: $url");
    exit;
}

/**
 * Display and clear the flash message if set.
 */
function showFlash() {
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (!empty($_SESSION['flash'])) {
        $type = $_SESSION['flash']['type'];   // success | danger | warning
        $msg  = $_SESSION['flash']['message'];
        unset($_SESSION['flash']);
        echo "<div class='alert alert-{$type} alert-dismissible fade show' role='alert'>
                {$msg}
                <button type='button' class='btn-close' data-bs-dismiss='alert'></button>
              </div>";
    }
}
?>