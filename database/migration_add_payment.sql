-- =========================================================
-- TUMU TIGER — Migration: add delivery/payment columns
-- Run this ONCE against your EXISTING database (the one you already
-- installed) to add the new payment/delivery fields to `requests`
-- without losing any existing data.
--
-- How to run:
--   mysql -u root -p --port=3307 tumutiger < migration_add_payment.sql
-- OR paste the ALTER TABLE statement below into phpMyAdmin's SQL tab.
-- =========================================================

USE `tumutiger`;

ALTER TABLE requests
    ADD COLUMN price DECIMAL(10,2) DEFAULT NULL AFTER admin_reply,
    ADD COLUMN payment_status ENUM('not_required','pending_payment','payment_submitted','paid') NOT NULL DEFAULT 'not_required' AFTER price,
    ADD COLUMN payment_name VARCHAR(150) DEFAULT NULL AFTER payment_status,
    ADD COLUMN payment_phone VARCHAR(30) DEFAULT NULL AFTER payment_name;
