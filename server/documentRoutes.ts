import { Express, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { companyDocuments } from "@shared/schema";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Direktorij za pohranu dokumenata tvrtke
const companyDocsDir = path.join(process.cwd(), 'public', 'company_documents');

// Osiguraj da direktorij postoji
if (!fs.existsSync(companyDocsDir)) {
  fs.mkdirSync(companyDocsDir, { recursive: true });
}

// Konfiguracija za upload dokumenata tvrtke
const uploadCompanyDocs = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, companyDocsDir);
    },
    filename: (req, file, cb) => {
      // Kreiraj jedinstveno ime datoteke
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb: multer.FileFilterCallback) => {
    // Provjeri tip datoteke
    const allowedMimeTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/webp',
      'text/plain'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      return cb(new Error('Nepodržani tip datoteke. Podržani formati su PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, WEBP i TXT.'));
    }
  }
});

export function registerDocumentRoutes(app: Express) {
  // Dohvati sve dokumente tvrtke
  app.get("/api/company-documents", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(403).json({ error: "Nemate pristup ovom resursu" });
      }
      
      const result = await db.select().from(companyDocuments);
      return res.json(result);
    } catch (error) {
      console.error("Greška kod dohvata dokumenata tvrtke:", error);
      return res.status(500).json({ error: "Greška kod dohvata dokumenata" });
    }
  });
  
  // Upload novog dokumenta tvrtke
  app.post("/api/company-documents/upload", uploadCompanyDocs.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(403).json({ error: "Nemate pristup ovom resursu" });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: "Nije priložena datoteka" });
      }
      
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Naziv dokumenta je obavezan" });
      }
      
      // Pripremi podatke za bazu
      const fileUrl = `/company_documents/${req.file.filename}`;
      const fileType = path.extname(req.file.filename).toLowerCase().substring(1);
      const fileSize = req.file.size;
      
      // Spremi zapis u bazu podataka
      const [document] = await db.insert(companyDocuments).values({
        name,
        description: description || null,
        fileUrl,
        fileType,
        fileSize,
        uploadedBy: req.user.id
      }).returning();
      
      return res.status(201).json(document);
    } catch (error) {
      console.error("Greška kod uploada dokumenta tvrtke:", error);
      return res.status(500).json({ error: "Greška kod uploada dokumenta" });
    }
  });
  
  // Brisanje dokumenta tvrtke
  app.delete("/api/company-documents/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(403).json({ error: "Nemate pristup ovom resursu" });
      }
      
      const documentId = parseInt(req.params.id);
      
      // Dohvati dokument iz baze
      const [document] = await db
        .select()
        .from(companyDocuments)
        .where(eq(companyDocuments.id, documentId));
      
      if (!document) {
        return res.status(404).json({ error: "Dokument nije pronađen" });
      }
      
      // Izbriši datoteku s diska
      const filePath = path.join(process.cwd(), 'public', document.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Izbriši zapis iz baze
      await db
        .delete(companyDocuments)
        .where(eq(companyDocuments.id, documentId));
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Greška kod brisanja dokumenta tvrtke:", error);
      return res.status(500).json({ error: "Greška kod brisanja dokumenta" });
    }
  });
}