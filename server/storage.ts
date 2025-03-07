import { pgTable } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";
import { calculations, type Calculation, type InsertCalculation } from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  saveCalculation(calculation: InsertCalculation): Promise<Calculation>;
  getCalculations(): Promise<Calculation[]>;
}

export class PostgresStorage implements IStorage {
  async saveCalculation(calculation: InsertCalculation): Promise<Calculation> {
    // Convert numbers to strings for PostgreSQL numeric type
    const numericCalculation = {
      netWeight: String(calculation.netWeight),
      goldRate: String(calculation.goldRate),
      makingCharges: String(calculation.makingCharges),
      makingAmount: String(calculation.makingAmount),
      gstAmount: String(calculation.gstAmount),
      totalAmount: String(calculation.totalAmount),
    };

    const result = await db.insert(calculations).values(numericCalculation).returning();
    return result[0];
  }

  async getCalculations(): Promise<Calculation[]> {
    // Limit to last 3 calculations
    return await db.select()
      .from(calculations)
      .orderBy(desc(calculations.createdAt))
      .limit(3);
  }
}

export const storage = new PostgresStorage();