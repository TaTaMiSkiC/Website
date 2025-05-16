import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Funkcija za inicijalizaciju baze podataka
export async function initDatabase() {
  try {
    console.log("Inicijalizacija baze podataka...");
    
    // Provjeri postoji li tablica invoices
    const checkInvoices = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'invoices'
      ) AS "exists";
    `);
    
    if (!checkInvoices.rows[0]?.exists) {
      console.log("Kreiranje tablice invoices...");
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS invoices (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT now(),
          order_id INTEGER,
          invoice_number VARCHAR(255) NOT NULL,
          customer_name VARCHAR(255) NOT NULL,
          customer_email VARCHAR(255),
          customer_address VARCHAR(255),
          customer_city VARCHAR(255),
          customer_postal_code VARCHAR(255),
          customer_country VARCHAR(255),
          customer_phone VARCHAR(255),
          subtotal VARCHAR(255) NOT NULL,
          tax VARCHAR(255) NOT NULL,
          total VARCHAR(255) NOT NULL,
          language VARCHAR(255) NOT NULL
        );
      `);
    }
    
    // Provjeri postoji li tablica invoice_items
    const checkInvoiceItems = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'invoice_items'
      ) AS "exists";
    `);
    
    if (!checkInvoiceItems.rows[0]?.exists) {
      console.log("Kreiranje tablice invoice_items...");
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS invoice_items (
          id SERIAL PRIMARY KEY,
          invoice_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          product_name VARCHAR(255) NOT NULL,
          quantity INTEGER NOT NULL,
          price VARCHAR(255) NOT NULL,
          selected_scent VARCHAR(255),
          selected_color VARCHAR(255)
        );
      `);
    }
    
    console.log("Inicijalizacija baze podataka završena");
    return true;
  } catch (error) {
    console.error("Greška pri inicijalizaciji baze podataka:", error);
    return false;
  }
}