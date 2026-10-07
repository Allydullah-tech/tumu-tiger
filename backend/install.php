<?php
/**
 * TUMU TIGER — Kisakinishi (Installer)
 * backend/install.php
 *
 * Admin wa kwanza HUUNDWA HAPA TU. Hakuna usajili wa umma wa admin
 * kwenye frontend — hii ndiyo njia pekee ya kuunda akaunti ya kwanza
 * ya msimamizi. Baada ya hapo, admins wapya huongezwa na admin
 * mwenyewe kupitia paneli yake (backend/api/admins/create.php).
 */
session_start();
$configPath = __DIR__ . '/config/config.php';
$alreadyInstalled = file_exists($configPath);

$errors = [];
$success = false;

$securityQuestions = [
    'Jina la mnyama wako wa kwanza ni nani?',
    'Shule yako ya msingi iliitwaje?',
    'Mji ulikozaliwa ni upi?',
    'Jina la kwanza la mama yako mzazi ni nani?',
    'Rangi unayoipenda zaidi ni ipi?',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$alreadyInstalled) {
    $dbHost = trim($_POST['db_host'] ?? 'localhost');
    $dbPort = trim($_POST['db_port'] ?? '3306');
    $dbName = trim($_POST['db_name'] ?? '');
    $dbUser = trim($_POST['db_user'] ?? '');
    $dbPass = $_POST['db_pass'] ?? '';

    $fullName = trim($_POST['full_name'] ?? '');
    $email    = trim($_POST['email'] ?? '');
    $phone    = trim($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm  = $_POST['confirm_password'] ?? '';
    $secQ     = $_POST['security_question'] ?? '';
    $secQCustom = trim($_POST['security_question_custom'] ?? '');
    $secA     = trim($_POST['security_answer'] ?? '');
    $frontendOrigin = trim($_POST['frontend_origin'] ?? '');

    if ($secQ === 'custom' && $secQCustom !== '') $secQ = $secQCustom;

    if ($dbName === '' || $dbUser === '') $errors[] = 'Tafadhali jaza taarifa zote za hifadhidata (database).';
    if ($dbPort === '' || !ctype_digit($dbPort)) $errors[] = 'Bandari ya database (port) si sahihi.';
    if ($fullName === '' || $email === '' || $phone === '') $errors[] = 'Tafadhali jaza jina, barua pepe na namba ya simu ya msimamizi.';
    if (strlen($password) < 6) $errors[] = 'Nenosiri linapaswa kuwa na angalau herufi/namba 6.';
    if ($password !== $confirm) $errors[] = 'Nenosiri na uthibitisho wake havifanani.';
    if ($secQ === '' || $secA === '') $errors[] = 'Tafadhali chagua swali la usalama na jibu lake.';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Barua pepe si sahihi.';

    if (empty($errors)) {
        try {
            $pdo = new PDO("mysql:host=$dbHost;port=$dbPort;charset=utf8mb4", $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            ]);
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo->exec("USE `$dbName`");

            $pdo->exec("CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                role ENUM('admin','customer') NOT NULL DEFAULT 'customer',
                full_name VARCHAR(150) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                phone VARCHAR(30) NOT NULL,
                password VARCHAR(255) NOT NULL,
                security_question VARCHAR(255) DEFAULT NULL,
                security_answer VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            $pdo->exec("CREATE TABLE IF NOT EXISTS movies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                genre VARCHAR(100) DEFAULT NULL,
                release_year VARCHAR(10) DEFAULT NULL,
                description TEXT,
                cover_image VARCHAR(255) DEFAULT NULL,
                status ENUM('available','not_available') NOT NULL DEFAULT 'available',
                added_by INT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            $pdo->exec("CREATE TABLE IF NOT EXISTS requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tracking_code VARCHAR(20) NOT NULL UNIQUE,
                user_id INT NOT NULL,
                type ENUM('order','inquiry') NOT NULL DEFAULT 'order',
                movie_id INT DEFAULT NULL,
                movie_title VARCHAR(200) NOT NULL,
                customer_name VARCHAR(150) NOT NULL,
                customer_phone VARCHAR(30) NOT NULL,
                message TEXT,
                status ENUM('pending','in_review','available','not_available','replied') NOT NULL DEFAULT 'pending',
                admin_reply TEXT,
                price DECIMAL(10,2) DEFAULT NULL,
                payment_status ENUM('not_required','pending_payment','payment_submitted','paid') NOT NULL DEFAULT 'not_required',
                payment_name VARCHAR(150) DEFAULT NULL,
                payment_phone VARCHAR(30) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                $errors[] = 'Barua pepe hii tayari ipo kwenye mfumo.';
            } else {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $ansHash = password_hash(strtolower($secA), PASSWORD_DEFAULT);
                $ins = $pdo->prepare("INSERT INTO users (role, full_name, email, phone, password, security_question, security_answer) VALUES ('admin', ?, ?, ?, ?, ?, ?)");
                $ins->execute([$fullName, $email, $phone, $hash, $secQ, $ansHash]);

                $origins = 'http://localhost:5500,http://127.0.0.1:5500,http://localhost:8000';
                if ($frontendOrigin !== '') $origins = $frontendOrigin . ',' . $origins;

                $configContent = "<?php\n" .
                    "// TUMU TIGER — Faili la Mipangilio (imetengenezwa na install.php)\n" .
                    "define('DB_HOST', " . var_export($dbHost, true) . ");\n" .
                    "define('DB_PORT', " . var_export($dbPort, true) . ");\n" .
                    "define('DB_NAME', " . var_export($dbName, true) . ");\n" .
                    "define('DB_USER', " . var_export($dbUser, true) . ");\n" .
                    "define('DB_PASS', " . var_export($dbPass, true) . ");\n" .
                    "define('SITE_NAME', 'TUMU TIGER');\n" .
                    "define('ALLOWED_ORIGINS', " . var_export($origins, true) . ");\n";

                if (!is_dir(__DIR__ . '/config')) mkdir(__DIR__ . '/config', 0755, true);
                file_put_contents($configPath, $configContent);
                file_put_contents(__DIR__ . '/install.lock', date('Y-m-d H:i:s'));
                $success = true;
            }
        } catch (PDOException $e) {
            $errors[] = 'Hitilafu ya hifadhidata: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="sw">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sakinisha TUMU TIGER</title>
<link rel="stylesheet" href="../frontend/css/style.css">
</head>
<body>
<div class="auth-wrap">
  <div class="auth-card" style="max-width:640px;">
    <div class="brand" style="margin-bottom:14px;"><span class="mark">🐯</span> TUMU <span class="hi">TIGER</span></div>

    <?php if ($alreadyInstalled && !$success): ?>
      <h2>Tayari Imesakinishwa</h2>
      <p class="sub">Mfumo tayari umesakinishwa. Kama unataka kusakinisha upya (database mpya), futa faili <code>backend/config/config.php</code> kwenye seva kwanza.</p>
      <a href="../frontend/index.html" class="btn btn-primary btn-block mt-16">Nenda Kwenye Tovuti</a>

    <?php elseif ($success): ?>
      <h2>🎉 Usakinishaji Umekamilika!</h2>
      <p class="sub">Akaunti ya msimamizi imeundwa. Fungua frontend na uingie.</p>
      <a href="../frontend/pages/login.html" class="btn btn-primary btn-block mt-16">Nenda Kuingia (Login)</a>

    <?php else: ?>
      <h2>Karibu Kusakinisha</h2>
      <p class="sub">Jaza taarifa za hifadhidata (database) na akaunti ya msimamizi wa kwanza. Admin wapya wataongezwa baadaye na msimamizi mwenyewe kwenye paneli yake — sio hapa.</p>

      <?php foreach ($errors as $e): ?>
        <div class="alert alert-error"><span>⚠️</span> <?= htmlspecialchars($e, ENT_QUOTES, 'UTF-8') ?></div>
      <?php endforeach; ?>

      <form method="POST">
        <p class="eyebrow mb-16" style="margin-top:6px;">TAARIFA ZA HIFADHIDATA (DATABASE)</p>
        <div class="form-row">
          <div class="form-group">
            <label>Database Host</label>
            <input type="text" name="db_host" value="<?= htmlspecialchars($_POST['db_host'] ?? 'localhost') ?>" required>
          </div>
          <div class="form-group">
            <label>Database Port</label>
            <input type="text" name="db_port" value="<?= htmlspecialchars($_POST['db_port'] ?? '3306') ?>" required>
            <p class="hint">Chaguo-msingi la MySQL ni 3306 — badilisha kama unatumia bandari nyingine (mfano 3307).</p>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Jina la Database</label>
            <input type="text" name="db_name" value="<?= htmlspecialchars($_POST['db_name'] ?? 'tumutiger') ?>" required>
          </div>
          <div class="form-group">
            <label>Database Username</label>
            <input type="text" name="db_user" value="<?= htmlspecialchars($_POST['db_user'] ?? 'root') ?>" required>
          </div>
        </div>
        <div class="form-group">
          <label>Database Password</label>
          <input type="password" name="db_pass" value="">
          <p class="hint">Acha wazi kama database yako haina password (kawaida kwa usanidi wa ndani kama XAMPP/Laragon).</p>
        </div>

        <p class="eyebrow mb-16" style="margin-top:22px;">AKAUNTI YA MSIMAMIZI (ADMIN) WA KWANZA</p>
        <div class="form-group">
          <label>Jina Kamili</label>
          <input type="text" name="full_name" value="<?= htmlspecialchars($_POST['full_name'] ?? '') ?>" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Barua Pepe</label>
            <input type="email" name="email" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" required>
          </div>
          <div class="form-group">
            <label>Namba ya Simu</label>
            <input type="tel" name="phone" value="<?= htmlspecialchars($_POST['phone'] ?? '') ?>" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Nenosiri</label>
            <input type="password" name="password" required>
          </div>
          <div class="form-group">
            <label>Thibitisha Nenosiri</label>
            <input type="password" name="confirm_password" required>
          </div>
        </div>

        <p class="eyebrow mb-16" style="margin-top:22px;">SWALI LA USALAMA</p>
        <div class="form-group">
          <label>Chagua Swali</label>
          <select name="security_question" id="secQSelect">
            <?php foreach ($securityQuestions as $q): ?>
              <option value="<?= htmlspecialchars($q) ?>"><?= htmlspecialchars($q) ?></option>
            <?php endforeach; ?>
            <option value="custom">Andika swali langu mwenyewe...</option>
          </select>
        </div>
        <div class="form-group" id="customQWrap" style="display:none;">
          <label>Swali Lako</label>
          <input type="text" name="security_question_custom">
        </div>
        <div class="form-group">
          <label>Jibu la Swali</label>
          <input type="text" name="security_answer" required>
        </div>

        <p class="eyebrow mb-16" style="margin-top:22px;">MPANGILIO WA FRONTEND (HIARI)</p>
        <div class="form-group">
          <label>Frontend Origin (kama inaendeshwa kwenye seva/bandari tofauti)</label>
          <input type="text" name="frontend_origin" placeholder="Mfano: http://localhost:5500">
          <p class="hint">Ikiwa frontend na backend zipo kwenye domain moja, unaweza kuacha wazi.</p>
        </div>

        <button type="submit" class="btn btn-primary btn-block mt-16">Sakinisha Mfumo</button>
      </form>
      <script>
        document.getElementById('secQSelect').addEventListener('change', function(){
          document.getElementById('customQWrap').style.display = this.value === 'custom' ? 'block' : 'none';
        });
      </script>
    <?php endif; ?>
  </div>
</div>
</body>
</html>
