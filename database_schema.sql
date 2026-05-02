-- Cloudflare D1 Datenbank Schema für ASYA GOLD

-- Tabelle für Produkte
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'EUR',
    description TEXT,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabelle für Bestellungen
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_email TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, paid, shipped, cancelled
    stripe_session_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabelle für Bestellpositionen
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price_at_purchase REAL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
);

-- Beispiel-Daten einfügen
INSERT INTO products (title, category, price, description, image_url, stock) VALUES 
('Klassischer Diamantring', 'Ringe', 1299.00, 'Handgefertigter Ring aus 18k Gelbgold mit einem brillanten Diamanten.', 'images/gold_diamond_ring_luxury.png', 5),
('Elegante Goldkette', 'Ketten', 849.00, 'Filigrane Goldkette mit zeitlosem Anhänger.', 'images/gold_necklace_elegant.png', 10);
