-- Kreiranje tablice scents ako ne postoji
CREATE TABLE IF NOT EXISTS scents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kreiranje tablice colors ako ne postoji
CREATE TABLE IF NOT EXISTS colors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  hex_value VARCHAR(7) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kreiranje tablice product_scents ako ne postoji
CREATE TABLE IF NOT EXISTS product_scents (
  product_id INTEGER NOT NULL,
  scent_id INTEGER NOT NULL,
  PRIMARY KEY (product_id, scent_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (scent_id) REFERENCES scents(id) ON DELETE CASCADE
);

-- Kreiranje tablice product_colors ako ne postoji
CREATE TABLE IF NOT EXISTS product_colors (
  product_id INTEGER NOT NULL,
  color_id INTEGER NOT NULL,
  PRIMARY KEY (product_id, color_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE CASCADE
);

-- Dodavanje kolone has_color_options u tablicu products ako ne postoji
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_color_options BOOLEAN DEFAULT false;

-- Dodavanje kolona za miris i boju u tablicu cart_items ako ne postoje
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS scent_id INTEGER REFERENCES scents(id);
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS color_id INTEGER REFERENCES colors(id);

-- Dodavanje kolona za miris i boju u tablicu order_items ako ne postoje
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS scent_name VARCHAR(255);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS color_name VARCHAR(255);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS color_hex VARCHAR(7);