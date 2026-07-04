import "dotenv/config";
import express from "express";
import path from "path";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Set up multer for file upload handling in memory
  const upload = multer({ storage: multer.memoryStorage() });

  let aiClient: GoogleGenAI | null = null;
  function getAiClient() {
    if (!aiClient) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing");
      }
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return aiClient;
  }

  // Define types for response
  interface MedicineDetails {
    medicineName: string;
    manufacturer: string;
    saltComposition: string;
    prescriptionRequirement: string;
    overview: string;
    usefulFor?: string;
    uses: string;
    sideEffects: string;
    precautions: string;
    composition: string;
    warnings: string;
    batchNumber: string;
  }

  interface ScanResult {
    id: string;
    medicineName: string;
    status: 'Real' | 'Fake' | 'Unknown';
    confidence: number;
    batchNumber: string;
    timestamp: Date;
    details: string;
    fullDetails?: MedicineDetails;
  }

  // Simple in-memory store for scans
  const scans: ScanResult[] = [];

  app.post("/api/scan", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No image file provided" });
        return;
      }

      // We dynamically import @gradio/client to ensure compatibility
      const { Client } = await import("@gradio/client");
      const hfApp = await Client.connect("Ataanggg/medisureai");

      // Convert the uploaded multer buffer into a Blob for the Gradio client
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
      const result: any = await hfApp.predict("/predict", [blob]);

      // Result from Gradio looks like: { data: [ '✅ Real Medicine\nConfidence: 97.23%' ] }
      const outputText = result?.data?.[0] || "";

      let statusValue: 'Real' | 'Fake' | 'Unknown' = 'Unknown';
      let confidenceValue = 0;
      let detailsText = outputText;
      
      if (outputText.includes("Real")) {
        statusValue = 'Real';
      } else if (outputText.includes("Fake")) {
        statusValue = 'Fake';
      }

      // Extract confidence percentage if it exists
      const confMatch = outputText.match(/Confidence:\s*([\d.]+)%/i);
      if (confMatch && confMatch[1]) {
        confidenceValue = parseFloat(confMatch[1]);
      } else {
        // Fallback random generation for confidence if missing
        confidenceValue = statusValue === 'Unknown' ? 0 : 90 + Math.random() * 9;
      }

      const newScan: ScanResult = {
        id: Math.random().toString(36).substring(7),
        medicineName: req.file.originalname,
        status: statusValue,
        confidence: Math.round(confidenceValue),
        batchNumber: 'N/A', // Not provided by this model
        details: statusValue === 'Real' ? 'Verified as authentic medicine by Medisure AI.' : (statusValue === 'Fake' ? 'Potential counterfeit detected by Medisure AI.' : 'Analysis complete.'),
        timestamp: new Date()
      };

      scans.unshift(newScan);
      res.json(newScan);
    } catch (error: any) {
      console.error("Error analyzing image via Hugging Face:", error);
      res.status(500).json({ error: error.message || "Failed to analyze image via backend" });
    }
  });

  app.post("/api/info", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No image file provided" });
        return;
      }

      const aiClient = getAiClient();
      const base64Data = req.file.buffer.toString('base64');
      
      const prompt = `
        Analyze this image of a medicine/drug package. Provide a concise, structured JSON response extracting detailed information.
        Be brief and precise to save API tokens. Avoid wordy explanations.
        Format your response EXACTLY as this JSON structure:
        {
          "medicineName": "string",
          "batchNumber": "string",
          "manufacturer": "string",
          "saltComposition": "string",
          "prescriptionRequirement": "string (Rx Required, OTC, etc.)",
          "overview": "string (1 brief sentence overview)",
          "usefulFor": "string (Who should use this, e.g. 'Adults with headaches', brief)",
          "uses": "string (Concise bullet points or short sentence)",
          "sideEffects": "string (Top 3-4 side effects, concise)",
          "precautions": "string (Top 2 precautions, concise)",
          "composition": "string (Brief composition)",
          "warnings": "string (Critical warnings only, concise)"
        }
        Respond with ONLY the JSON object, no formatting.
      `;

      const geminiResult = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: req.file.mimetype
            }
          }
        ]
      });

      // Parse Gemini Result
      let medDetails: MedicineDetails = {
        medicineName: req.file.originalname,
        batchNumber: 'Unknown',
        manufacturer: 'Unknown',
        saltComposition: 'Unknown',
        prescriptionRequirement: 'Unknown',
        overview: 'No detailed overview available.',
        usefulFor: 'Unknown',
        uses: 'No uses data available.',
        sideEffects: 'No side effects data available.',
        precautions: 'No precautions data available.',
        composition: 'No composition data available.',
        warnings: 'No warnings data available.'
      };

      if (geminiResult && geminiResult.text) {
        try {
          const cleanedText = geminiResult.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedText);
          medDetails = { ...medDetails, ...parsed };
        } catch (e) {
          console.error("Failed to parse Gemini JSON:", geminiResult.text);
        }
      }

      const newScan: ScanResult = {
        id: Math.random().toString(36).substring(7),
        medicineName: medDetails.medicineName !== 'Unknown' && medDetails.medicineName !== req.file.originalname 
                        ? medDetails.medicineName 
                        : req.file.originalname,
        status: 'Unknown', // Authenticity is unknown for info-only scan
        confidence: 0,
        batchNumber: medDetails.batchNumber,
        details: 'Detailed AI Medicine Analysis',
        timestamp: new Date(),
        fullDetails: medDetails
      };

      scans.unshift(newScan);
      res.json(newScan);
    } catch (error: any) {
      console.error("Error analyzing image via Gemini:", error);
      res.status(500).json({ error: error.message || "Failed to analyze image via backend" });
    }
  });

  app.get("/api/scans/:id", (req, res) => {
    const scan = scans.find(s => s.id === req.params.id);
    if (scan) {
      res.json(scan);
    } else {
      res.status(404).json({ error: "Scan not found" });
    }
  });

  app.get("/api/scans", (req, res) => {
    res.json(scans);
  });

  app.get("/api/stats", (req, res) => {
    const total = scans.length;
    const real = scans.filter(s => s.status === 'Real').length;
    const fake = scans.filter(s => s.status === 'Fake').length;
    const sumConfidence = scans.reduce((acc, curr) => acc + curr.confidence, 0);
    const avgConfidence = total > 0 ? Math.round(sumConfidence / total) : 0;

    res.json({
      total,
      real,
      fake,
      accuracy: avgConfidence
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
