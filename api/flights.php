<?php
// ============================================
// api/flights.php — Get / Add / Delete Flights
// ============================================
require_once 'config.php';
setHeaders();
startSession();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

// ── HELPER: generate flight ID ─────────────
function generateFlightId($db) {
    do {
        $id = 'FL-' . strtoupper(substr(md5(uniqid()), 0, 5));
        $r  = $db->query("SELECT id FROM flights WHERE id = '$id'");
    } while ($r->num_rows > 0);
    return $id;
}

// ── HELPER: compute duration ───────────────
function calcDuration($dep, $arr) {
    $d = strtotime($arr) - strtotime($dep);
    if ($d < 0) $d += 86400;
    $h = floor($d / 3600);
    $m = floor(($d % 3600) / 60);
    return "{$h}h {$m}m";
}

switch ($action) {

    // ── LIST / SEARCH ─────────────────────────
    case 'list':
    case 'search':
        $db   = getDB();
        $from = trim($_GET['from'] ?? '');
        $to   = trim($_GET['to']   ?? '');
        $date = trim($_GET['date'] ?? '');

        $sql    = "SELECT * FROM flights WHERE 1=1";
        $params = [];
        $types  = '';

        if ($from) {
            $sql    .= " AND `from` LIKE ?";
            $params[] = "%$from%";
            $types   .= 's';
        }
        if ($to) {
            $sql    .= " AND `to` LIKE ?";
            $params[] = "%$to%";
            $types   .= 's';
        }
        if ($date) {
            $sql    .= " AND date = ?";
            $params[] = $date;
            $types   .= 's';
        }
        $sql .= " ORDER BY date ASC, dep_time ASC";

        $stmt = $db->prepare($sql);
        if ($params) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        // Format for frontend
        $flights = array_map(function($f) {
            return [
                'id'         => $f['id'],
                'airline'    => $f['airline'],
                'flightName' => $f['flight_name'],
                'flightType' => $f['flight_type'],
                'from'       => $f['from'],
                'to'         => $f['to'],
                'date'       => $f['date'],
                'depTime'    => substr($f['dep_time'], 0, 5),
                'arrTime'    => substr($f['arr_time'], 0, 5),
                'duration'   => $f['duration'],
                'price'      => (float)$f['price'],
                'seats'      => (int)$f['seats_available'],
            ];
        }, $rows);

        echo json_encode(['success' => true, 'flights' => $flights]);
        $db->close();
        break;

    // ── ADD FLIGHT (Admin only) ────────────────
    case 'add':
        startSession();
        if (($_SESSION['user_role'] ?? '') !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Admin access required.']);
            break;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $required = ['airline', 'from', 'to', 'date', 'depTime', 'arrTime', 'price'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                echo json_encode(['success' => false, 'message' => "Field '$field' is required."]);
                exit;
            }
        }

        $db       = getDB();
        $id       = generateFlightId($db);
        $duration = calcDuration($data['depTime'], $data['arrTime']);

        $stmt = $db->prepare("INSERT INTO flights (id, airline, flight_name, flight_type, `from`, `to`, date, dep_time, arr_time, duration, price)
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param(
            'ssssssssssd',
            $id,
            $data['airline'],
            $data['flightName'],
            $data['flightType'],
            $data['from'],
            $data['to'],
            $data['date'],
            $data['depTime'],
            $data['arrTime'],
            $duration,
            $data['price']
        );

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Flight added.', 'id' => $id]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to add flight: ' . $db->error]);
        }
        $db->close();
        break;

    // ── DELETE FLIGHT (Admin only) ─────────────
    case 'delete':
        startSession();
        if (($_SESSION['user_role'] ?? '') !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Admin access required.']);
            break;
        }

        $id = trim($_GET['id'] ?? '');
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'Flight ID required.']);
            break;
        }

        $db   = getDB();
        $stmt = $db->prepare("DELETE FROM flights WHERE id = ?");
        $stmt->bind_param('s', $id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Flight deleted.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Delete failed.']);
        }
        $db->close();
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action.']);
}
