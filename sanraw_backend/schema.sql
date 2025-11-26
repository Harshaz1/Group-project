CREATE DATABASE IF NOT EXISTS sanraw_db;
USE sanraw_db;

-- 1. User Table
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('owner', 'employee') NOT NULL,
    profile_image VARCHAR(500) DEFAULT NULL,
    phone_number VARCHAR(20) DEFAULT NULL,
    recovery_email VARCHAR(255) DEFAULT NULL,
    status ENUM('active', 'inactive') DEFAULT 'inactive',
    activation_token VARCHAR(255) DEFAULT NULL,
    activation_expires TIMESTAMP NULL,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_expires TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Inventory Tables

-- 2a. Paddy Table
CREATE TABLE IF NOT EXISTS paddy (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paddy_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2b. Equipment Table
CREATE TABLE IF NOT EXISTS equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2c. Fertilizer and Pesticides Table
CREATE TABLE IF NOT EXISTS fertilizer_pesticide (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    expire_date DATE NOT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Inventory Purchase Table
CREATE TABLE IF NOT EXISTS inventory_purchase (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    category ENUM('paddy', 'equipment', 'fertilizer_pesticide') NOT NULL,
    quantity INT NOT NULL,
    buy_price DECIMAL(10, 2) NOT NULL,
    payment_type ENUM('cash', 'cheque') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Customer Credit Table
CREATE TABLE IF NOT EXISTS customer_credit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_nic VARCHAR(20) UNIQUE NOT NULL,
    total_credit DECIMAL(10, 2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Sale Table
CREATE TABLE IF NOT EXISTS sale (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    category ENUM('paddy', 'equipment', 'fertilizer_pesticide') NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    payment_type ENUM('cash', 'credit') NOT NULL,
    customer_nic VARCHAR(20) NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 6. Credit Payment Table
CREATE TABLE IF NOT EXISTS credit_payment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_nic VARCHAR(20) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_nic) REFERENCES customer_credit(customer_nic) ON DELETE CASCADE
);

-- 7. Login History Table
CREATE TABLE IF NOT EXISTS login_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 8. Bill Table
CREATE TABLE IF NOT EXISTS bill (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NULL,
    customer_address TEXT,
    customer_phone VARCHAR(20),
    payment_type ENUM('cash', 'credit') NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    net_price DECIMAL(10, 2) NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 9. Bill Items Table
CREATE TABLE IF NOT EXISTS bill_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    item_id INT NOT NULL,
    category ENUM('paddy', 'equipment', 'fertilizer_pesticide') NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    ext_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bill(id) ON DELETE CASCADE
);

-- 10. Supplier Table
CREATE TABLE IF NOT EXISTS supplier (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Purchase Bill Table
CREATE TABLE IF NOT EXISTS purchase_bill (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INT NOT NULL,
    payment_type ENUM('cash', 'credit') NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    net_price DECIMAL(10, 2) NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES supplier(id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 12. Purchase Bill Items Table
CREATE TABLE IF NOT EXISTS purchase_bill_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_bill_id INT NOT NULL,
    item_id INT NOT NULL,
    category ENUM('paddy', 'equipment', 'fertilizer_pesticide') NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    buy_price DECIMAL(10, 2) NOT NULL,
    ext_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (purchase_bill_id) REFERENCES purchase_bill(id) ON DELETE CASCADE
);

-- SAMPLE DATA

-- Sample User (password: admin123 - hashed with bcrypt)
INSERT INTO user (first_name, last_name, email, password_hash, role, status) VALUES
('Admin', 'User', 'admin@sanraw.com', '$2a$12$LaDYNvnc9rvD/P79dH0vjuqU4RXUwk4joEN0Qg2NWOpy9weSDMUNq', 'owner', 'active');

INSERT INTO paddy (paddy_name, price, stock) VALUES 
('Basmati Rice', 150.00, 100),
('Samba Rice', 120.00, 200),
('Keeri Samba', 160.00, 150);

INSERT INTO equipment (equipment_name, price, stock) VALUES 
('Tractor', 2500000.00, 2),
('Harvester', 4500000.00, 1),
('Water Pump', 35000.00, 20);

INSERT INTO fertilizer_pesticide (name, price, expire_date, stock) VALUES 
('Urea Fertilizer', 2500.00, '2026-12-31', 500),
('Roundup Pesticide', 1800.00, '2025-06-30', 100),
('Compost Bag', 800.00, '2025-12-31', 300);

-- Sample Bills (assuming user_id 1 exists)
INSERT INTO bill (bill_number, customer_name, customer_address, customer_phone, payment_type, total_price, discount_amount, net_price, is_paid, user_id) VALUES
('BILL-1734445200000', 'John Silva', '123 Main St, Colombo', '0771234567', 'cash', 18000.00, 500.00, 17500.00, TRUE, 1),
('BILL-1734445300000', 'Mary Fernando', '456 Lake Rd, Kandy', '0772345678', 'credit', 25000.00, 1000.00, 24000.00, FALSE, 1),
('BILL-1734445400000', 'David Perera', '789 Hill View, Galle', '0773456789', 'cash', 12000.00, 200.00, 11800.00, TRUE, 1);

-- Sample Bill Items
-- Bill 1 items (Cash)
INSERT INTO bill_items (bill_id, item_id, category, product_name, quantity, unit_price, discount, ext_price) VALUES
(1, 1, 'paddy', 'Basmati Rice', 100, 150.00, 300.00, 14700.00),
(1, 1, 'fertilizer_pesticide', 'Urea Fertilizer', 1, 2500.00, 200.00, 2300.00);

-- Bill 2 items (Credit)
INSERT INTO bill_items (bill_id, item_id, category, product_name, quantity, unit_price, discount, ext_price) VALUES
(2, 2, 'paddy', 'Samba Rice', 150, 120.00, 500.00, 17500.00),
(2, 3, 'equipment', 'Water Pump', 1, 35000.00, 500.00, 34500.00);

-- Bill 3 items (Cash)
INSERT INTO bill_items (bill_id, item_id, category, product_name, quantity, unit_price, discount, ext_price) VALUES
(3, 3, 'paddy', 'Keeri Samba', 50, 160.00, 100.00, 7900.00),
(3, 3, 'fertilizer_pesticide', 'Compost Bag', 5, 800.00, 100.00, 3900.00);
