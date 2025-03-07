import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCalculationSchema } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Calculation routes
  app.post("/api/calculations", async (req, res) => {
    try {
      const calculation = insertCalculationSchema.parse(req.body);
      const result = await storage.saveCalculation(calculation);
      res.json(result);
    } catch (error) {
      console.error("Calculation validation error:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ 
          error: "Invalid calculation data",
          details: error.errors 
        });
      } else {
        res.status(400).json({ error: "Invalid calculation data" });
      }
    }
  });

  app.get("/api/calculations", async (_req, res) => {
    try {
      const calculations = await storage.getCalculations();
      res.json(calculations);
    } catch (error) {
      console.error("Error fetching calculations:", error);
      res.status(500).json({ error: "Failed to fetch calculations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}