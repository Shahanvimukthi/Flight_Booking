<?php
// ============================================
// api/bookings.php — Create / Get Bookings
// ============================================
require_once 'config.php';
setHeaders();
startSession();

$action = $_GET['action'] ?? 'list';

// ── HELPER: generate booking ID ────────────
function generateBookingId($db) {
    do {
        $id = 'BK-' . strtoupper(substr(md5(uniqid()), 0, 6));
        $r  = $db->query("SELECT id FROM bookings WHERE id = '$id'");
    } while ($r->num_rows > 0);
    return $id;
}

switch ($action) {

    // ── CREATE BOOKING ────────────────────────
    case 'create':
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Login required.']);
            break;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $required = ['flightId', 'airline', 'from', 'to', 'price'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                echo json_encode(['success' => false, 'message' => "Field '$field' is required."]);
                exit;
            }
        }

        $db         = getDB();
        $id         = generateBookingId($db);
        $userEmail  = $_SESSION['user_email'];
        $userName   = $_SESSION['user_name'];
        $flightId   = $data['flightId'];
        $flightNum  = $data['flightId'];
        $airline    = $data['airline'];
        $from       = $data['from'];
        $to         = $data['to'];
        $flightDate = $data['flightDate'] ?? null;
        $price      = (float)$data['price'];

        $stmt = $db->prepare("INSERT INTO bookings (id, user_email, user_name, flight_id, flight_num, airline, `from`, `to`, flight_date, price, status)
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed')");
        $stmt->bind_param(
            'sssssssssd',
            $id, $userEmail, $userName, $flightId, $flightNum,
            $airline, $from, $to, $flightDate, $price
        );

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'bookingId' => $id]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Booking failed: ' . $db->error]);
        }
        $db->close();
        break;

    // ── GET USER BOOKINGS ─────────────────────
    case 'user':
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => true, 'bookings' => []]);
            break;
        }

        $email = $_SESSION['user_email'];
        $db    = getDB();
        $stmt  = $db->prepare("SELECT * FROM bookings WHERE user_email = ? ORDER BY booked_at DESC");
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        $bookings = array_map(function($b) {
            return [
                'id'         => $b['id'],
                'userEmail'  => $b['user_email'],
                'userName'   => $b['user_name'],
                'flightId'   => $b['flight_id'],
                'flightNum'  => $b['flight_num'],
                'airline'    => $b['airline'],
                'from'       => $b['from'],
                'to'         => $b['to'],
                'flightDate' => $b['flight_date'],
                'price'      => (float)$b['price'],
                'status'     => $b['status'],
            ];
        }, $rows);

        echo json_encode(['success' => true, 'bookings' => $bookings]);
        $db->close();
        break;

    // ── GET ALL BOOKINGS (Admin only) ──────────
    case 'all':
        if (($_SESSION['user_role'] ?? '') !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Admin access required.']);
            break;
        }

        $db   = getDB();
        $rows = $db->query("SELECT * FROM bookings ORDER BY booked_at DESC")->fetch_all(MYSQLI_ASSOC);

        $bookings = array_map(function($b) {
            return [
                'id'         => $b['id'],
                'userEmail'  => $b['user_email'],
                'userName'   => $b['user_name'],
                'flightId'   => $b['flight_id'],
                'flightNum'  => $b['flight_num'],
                'airline'    => $b['airline'],
                'from'       => $b['from'],
                'to'         => $b['to'],
                'flightDate' => $b['flight_date'],
                'price'      => (float)$b['price'],
                'status'     => $b['status'],
            ];
        }, $rows);

        echo json_encode(['success' => true, 'bookings' => $bookings]);
        $db->close();
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action.']);
}
