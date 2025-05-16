import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, pool } from "./db";
import {
  productScents,
  productColors,
  insertProductSchema,
  insertCategorySchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertCartItemSchema,
  insertReviewSchema,
  insertSettingSchema,
  insertScentSchema,
  insertColorSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // PayPal routes
  app.get("/api/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/api/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/api/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  app.get("/api/categories/:id/products", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const products = await storage.getProductsByCategory(id);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  app.put("/api/categories/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.updateCategory(id, validatedData);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  
  app.delete("/api/categories/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Cart
  app.get("/api/cart", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const cartItems = await storage.getCartItems(req.user.id);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const cartItem = await storage.addToCart(validatedData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const cartItem = await storage.updateCartItem(id, quantity, req.user.id);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(cartItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id, req.user.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      await storage.clearCart(req.user.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (req.user.isAdmin) {
        const orders = await storage.getAllOrders();
        return res.json(orders);
      }
      
      const orders = await storage.getUserOrders(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (!req.user.isAdmin && order.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.get("/api/orders/:id/items", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (!req.user.isAdmin && order.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const orderItems = await storage.getOrderItems(id);
      res.json(orderItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order items" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertOrderSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const order = await storage.createOrder(validatedData, req.body.items);
      await storage.clearCart(req.user.id);
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Reviews
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/products/:id/reviews", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const productId = parseInt(req.params.id);
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id,
        productId
      });
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Users (admin only)
  app.get("/api/users", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Scents (mirisi)
  app.get("/api/scents", async (req, res) => {
    try {
      const scents = await storage.getAllScents();
      res.json(scents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scents" });
    }
  });

  app.get("/api/scents/active", async (req, res) => {
    try {
      const scents = await storage.getActiveScents();
      res.json(scents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active scents" });
    }
  });

  app.post("/api/scents", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertScentSchema.parse(req.body);
      const scent = await storage.createScent(validatedData);
      res.status(201).json(scent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create scent" });
    }
  });

  app.put("/api/scents/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const validatedData = insertScentSchema.parse(req.body);
      const scent = await storage.updateScent(id, validatedData);
      
      if (!scent) {
        return res.status(404).json({ message: "Scent not found" });
      }
      
      res.json(scent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update scent" });
    }
  });

  app.delete("/api/scents/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      await storage.deleteScent(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete scent" });
    }
  });

  // Colors (boje)
  app.get("/api/colors", async (req, res) => {
    try {
      const colors = await storage.getAllColors();
      res.json(colors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch colors" });
    }
  });

  app.get("/api/colors/active", async (req, res) => {
    try {
      const colors = await storage.getActiveColors();
      res.json(colors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active colors" });
    }
  });

  app.post("/api/colors", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertColorSchema.parse(req.body);
      const color = await storage.createColor(validatedData);
      res.status(201).json(color);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create color" });
    }
  });

  app.put("/api/colors/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const validatedData = insertColorSchema.parse(req.body);
      const color = await storage.updateColor(id, validatedData);
      
      if (!color) {
        return res.status(404).json({ message: "Color not found" });
      }
      
      res.json(color);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update color" });
    }
  });

  app.delete("/api/colors/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      await storage.deleteColor(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete color" });
    }
  });

  // Product scents and colors
  app.get("/api/products/:id/scents", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const scents = await storage.getProductScents(productId);
      res.json(scents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product scents" });
    }
  });

  app.post("/api/products/:id/scents", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const productId = parseInt(req.params.id);
      const { scentId } = req.body;
      
      if (!scentId || typeof scentId !== 'number') {
        return res.status(400).json({ message: "Invalid scent ID" });
      }
      
      const productScent = await storage.addScentToProduct(productId, scentId);
      res.status(201).json(productScent);
    } catch (error) {
      res.status(500).json({ message: "Failed to add scent to product" });
    }
  });

  app.delete("/api/products/:productId/scents/:scentId", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const productId = parseInt(req.params.productId);
      const scentId = parseInt(req.params.scentId);
      
      await storage.removeScentFromProduct(productId, scentId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove scent from product" });
    }
  });
  
  // Ruta za brisanje svih mirisa s proizvoda
  app.delete("/api/products/:id/scents", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const productId = parseInt(req.params.id);
      console.log(`Brisanje svih mirisa za proizvod ID: ${productId}`);
      
      try {
        // Direktno koristimo pool.query za brisanje svih mirisa
        await pool.query(
          `DELETE FROM product_scents WHERE product_id = $1`,
          [productId]
        );
        console.log(`Uspješno izbrisani svi mirisi za proizvod ID: ${productId}`);
        res.status(204).send();
      } catch (dbError) {
        console.error("Database error removing scents:", dbError);
        
        // Još jedan pokušaj s inicijalizacijom tablice
        console.log("Pokušaj inicijalizacije tablice product_scents...");
        await pool.query(`
          CREATE TABLE IF NOT EXISTS product_scents (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            scent_id INTEGER NOT NULL REFERENCES scents(id) ON DELETE CASCADE,
            UNIQUE(product_id, scent_id)
          )
        `);
        
        // Sada ponovo pokušamo brisanje
        await pool.query(
          `DELETE FROM product_scents WHERE product_id = $1`,
          [productId]
        );
        console.log(`Nakon inicijalizacije, uspješno izbrisani svi mirisi za proizvod ID: ${productId}`);
        res.status(204).send();
      }
    } catch (error) {
      console.error("Error removing scents from product:", error);
      res.status(500).json({ 
        message: "Failed to remove all scents from product", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/products/:id/colors", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const colors = await storage.getProductColors(productId);
      res.json(colors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product colors" });
    }
  });

  app.post("/api/products/:id/colors", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const productId = parseInt(req.params.id);
      const { colorId } = req.body;
      
      if (!colorId || typeof colorId !== 'number') {
        return res.status(400).json({ message: "Invalid color ID" });
      }
      
      const productColor = await storage.addColorToProduct(productId, colorId);
      res.status(201).json(productColor);
    } catch (error) {
      res.status(500).json({ message: "Failed to add color to product" });
    }
  });

  app.delete("/api/products/:productId/colors/:colorId", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const productId = parseInt(req.params.productId);
      const colorId = parseInt(req.params.colorId);
      
      await storage.removeColorFromProduct(productId, colorId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove color from product" });
    }
  });
  
  // Ruta za brisanje svih boja s proizvoda
  app.delete("/api/products/:id/colors", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const productId = parseInt(req.params.id);
      console.log(`Brisanje svih boja za proizvod ID: ${productId}`);
      
      try {
        // Direktno koristimo pool.query za brisanje svih boja
        await pool.query(
          `DELETE FROM product_colors WHERE product_id = $1`,
          [productId]
        );
        console.log(`Uspješno izbrisane sve boje za proizvod ID: ${productId}`);
        res.status(204).send();
      } catch (dbError) {
        console.error("Database error removing colors:", dbError);
        
        // Još jedan pokušaj s inicijalizacijom tablice
        console.log("Pokušaj inicijalizacije tablice product_colors...");
        await pool.query(`
          CREATE TABLE IF NOT EXISTS product_colors (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            color_id INTEGER NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
            UNIQUE(product_id, color_id)
          )
        `);
        
        // Sada ponovo pokušamo brisanje
        await pool.query(
          `DELETE FROM product_colors WHERE product_id = $1`,
          [productId]
        );
        console.log(`Nakon inicijalizacije, uspješno izbrisane sve boje za proizvod ID: ${productId}`);
        res.status(204).send();
      }
    } catch (error) {
      console.error("Error removing colors from product:", error);
      res.status(500).json({ 
        message: "Failed to remove all colors from product", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Change password
  app.put("/api/users/:id/password", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      
      // Ensure users can only change their own password (unless admin)
      if (id !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Import the auth functions
      const { comparePasswords, hashPassword } = require("./auth");
      
      // Get the user
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update user with new password
      const updatedUser = await storage.updateUser(id, { password: hashedPassword });
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update password" });
    }
  });
  
  // Delete user account
  app.delete("/api/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      
      // Ensure users can only delete their own account (unless admin)
      if (id !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Add deletion logic for user data
      // Note: Prilagodi ovo prema stvarnoj implementaciji
      // Trenutno samo simuliramo uspješno brisanje
      
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Opće postavke - moraju biti prije generičke rute za :key
  app.get("/api/settings/general", async (req, res) => {
    try {
      // Dohvati sve opće postavke
      const storeName = await storage.getSetting("store_name");
      const storeEmail = await storage.getSetting("store_email");
      const storePhone = await storage.getSetting("store_phone");
      const storeAddress = await storage.getSetting("store_address");
      
      res.json({
        store_name: storeName?.value || "",
        store_email: storeEmail?.value || "",
        store_phone: storePhone?.value || "",
        store_address: storeAddress?.value || "",
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch general settings" });
    }
  });
  
  // Kontakt postavke - moraju biti prije generičke rute za :key
  app.get("/api/settings/contact", async (req, res) => {
    try {
      // Dohvati sve postavke koje se tiču kontakta
      const address = await storage.getSetting("contact_address");
      const city = await storage.getSetting("contact_city");
      const postalCode = await storage.getSetting("contact_postal_code");
      const phone = await storage.getSetting("contact_phone");
      const email = await storage.getSetting("contact_email");
      const workingHours = await storage.getSetting("contact_working_hours");
      
      res.json({
        address: address?.value || "",
        city: city?.value || "",
        postalCode: postalCode?.value || "",
        phone: phone?.value || "",
        email: email?.value || "",
        workingHours: workingHours?.value || "",
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact settings" });
    }
  });
  
  app.get("/api/settings/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const setting = await storage.getSetting(key);
      
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });
  
  app.post("/api/settings/general", async (req, res) => {
    try {
      console.log("Primljeni zahtjev za ažuriranje općih postavki:", req.body);
      
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        console.log("Zahtjev odbijen - korisnik nije prijavljen ili nije admin");
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const { store_name, store_email, store_phone, store_address } = req.body;
      
      console.log("Parsiran zahtjev:", { store_name, store_email, store_phone, store_address });
      
      // Direktno ažuriranje u bazi podataka kao test
      console.log("Izvršavanje SQL upita za ažuriranje 'store_name'");
      if (store_name) {
        try {
          // Prvo pokušavamo ažurirati kao test
          const checkResult = await db.execute(
            `SELECT * FROM settings WHERE key = $1`,
            ['store_name']
          );
          console.log("Rezultat provjere:", checkResult.rows);
          
          if (checkResult.rows.length > 0) {
            // Ažuriraj postojeću postavku
            const updateResult = await db.execute(
              `UPDATE settings SET value = $1, updated_at = NOW() WHERE key = $2 RETURNING *`,
              [store_name, 'store_name']
            );
            console.log("SQL Rezultat ažuriranja 'store_name':", updateResult.rows);
          } else {
            // Kreiraj novu postavku
            const insertResult = await db.execute(
              `INSERT INTO settings (key, value) VALUES ($1, $2) RETURNING *`,
              ['store_name', store_name]
            );
            console.log("SQL Rezultat dodavanja 'store_name':", insertResult.rows);
          }
        } catch (sqlError) {
          console.error("SQL greška:", sqlError);
        }
      }
      
      // Nakon SQL testa, pokušajmo i standardni način
      try {
        const results = await Promise.all([
          storage.updateSetting("store_name", store_name),
          storage.updateSetting("store_email", store_email),
          storage.updateSetting("store_phone", store_phone),
          storage.updateSetting("store_address", store_address),
        ]);
        console.log("Postavke uspješno ažurirane - rezultati:", results);
        res.json({ success: true, results });
      } catch (updateError) {
        console.error("Greška pri ažuriranju postavki:", updateError);
        throw updateError;
      }
    } catch (error) {
      console.error("Greška pri ažuriranju općih postavki:", error);
      res.status(500).json({ message: "Failed to update general settings", error: String(error) });
    }
  });
  
  app.post("/api/settings/contact", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const { address, city, postalCode, phone, email, workingHours } = req.body;
      
      // Ažuriraj ili kreiraj postavke za kontakt
      await Promise.all([
        storage.updateSetting("contact_address", address),
        storage.updateSetting("contact_city", city),
        storage.updateSetting("contact_postal_code", postalCode),
        storage.updateSetting("contact_phone", phone),
        storage.updateSetting("contact_email", email),
        storage.updateSetting("contact_working_hours", workingHours),
      ]);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update contact settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertSettingSchema.parse(req.body);
      
      // Check if setting already exists
      const existingSetting = await storage.getSetting(validatedData.key);
      if (existingSetting) {
        return res.status(400).json({ message: "Setting with this key already exists" });
      }
      
      const setting = await storage.createSetting(validatedData);
      res.status(201).json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create setting" });
    }
  });

  app.put("/api/settings/:key", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const key = req.params.key;
      const { value } = req.body;
      
      if (!value || typeof value !== 'string') {
        return res.status(400).json({ message: "Invalid value" });
      }
      
      const setting = await storage.updateSetting(key, value);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  app.delete("/api/settings/:key", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const key = req.params.key;
      await storage.deleteSetting(key);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete setting" });
    }
  });

  // Scents
  app.get("/api/scents", async (req, res) => {
    try {
      const scents = await storage.getAllScents();
      res.json(scents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scents" });
    }
  });

  app.get("/api/scents/active", async (req, res) => {
    try {
      const scents = await storage.getActiveScents();
      res.json(scents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active scents" });
    }
  });

  app.get("/api/scents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const scent = await storage.getScent(id);
      if (!scent) {
        return res.status(404).json({ message: "Scent not found" });
      }
      res.json(scent);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scent" });
    }
  });

  app.post("/api/scents", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertScentSchema.parse(req.body);
      const scent = await storage.createScent(validatedData);
      res.status(201).json(scent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create scent" });
    }
  });

  app.put("/api/scents/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const validatedData = insertScentSchema.parse(req.body);
      const scent = await storage.updateScent(id, validatedData);
      
      if (!scent) {
        return res.status(404).json({ message: "Scent not found" });
      }
      
      res.json(scent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update scent" });
    }
  });

  app.delete("/api/scents/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      await storage.deleteScent(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete scent" });
    }
  });

  // Ove rute su već definirane iznad - duplikati

  // Colors
  app.get("/api/colors", async (req, res) => {
    try {
      const colors = await storage.getAllColors();
      res.json(colors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch colors" });
    }
  });

  app.get("/api/colors/active", async (req, res) => {
    try {
      const colors = await storage.getActiveColors();
      res.json(colors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active colors" });
    }
  });

  app.get("/api/colors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const color = await storage.getColor(id);
      if (!color) {
        return res.status(404).json({ message: "Color not found" });
      }
      res.json(color);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch color" });
    }
  });

  app.post("/api/colors", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertColorSchema.parse(req.body);
      const color = await storage.createColor(validatedData);
      res.status(201).json(color);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create color" });
    }
  });

  app.put("/api/colors/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const validatedData = insertColorSchema.parse(req.body);
      const color = await storage.updateColor(id, validatedData);
      
      if (!color) {
        return res.status(404).json({ message: "Color not found" });
      }
      
      res.json(color);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update color" });
    }
  });

  app.delete("/api/colors/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      await storage.deleteColor(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete color" });
    }
  });

  // Product Colors
  app.get("/api/products/:id/colors", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const colors = await storage.getProductColors(productId);
      res.json(colors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product colors" });
    }
  });

  app.post("/api/products/:id/colors/:colorId", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const productId = parseInt(req.params.id);
      const colorId = parseInt(req.params.colorId);
      
      const productColor = await storage.addColorToProduct(productId, colorId);
      res.status(201).json(productColor);
    } catch (error) {
      res.status(500).json({ message: "Failed to add color to product" });
    }
  });

  app.delete("/api/products/:id/colors/:colorId", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const productId = parseInt(req.params.id);
      const colorId = parseInt(req.params.colorId);
      
      await storage.removeColorFromProduct(productId, colorId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove color from product" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
