-- =========================================================
-- TUMU TIGER — Maktaba ya Filamu
-- Database schema (MySQL / MariaDB)
-- This file is executed automatically by backend/install.php,
-- but you can also import it manually with phpMyAdmin / mysql CLI.
-- =========================================================

CREATE DATABASE IF NOT EXISTS `tumutiger` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tumutiger`;

-- ---------------------------------------------------------
-- users: both admins and customers live here, distinguished by `role`
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('admin','customer') NOT NULL DEFAULT 'customer',
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    password VARCHAR(255) NOT NULL,
    security_question VARCHAR(255) DEFAULT NULL,
    security_answer VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- movies: catalog of movie covers uploaded by admins
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS movies (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- requests: customer orders ("I want this movie") and inquiries
-- ("is this movie in the library?")
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS requests (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Note: the very first admin account is NOT inserted here.
-- It is created interactively by backend/install.php, which also
-- writes backend/config/config.php with your DB credentials.
