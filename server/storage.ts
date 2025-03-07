import { pgTable } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";
import { calculations, users, type User, type InsertUser, type Calculation, type InsertCalculation } from "@shared/schema";
import { db } from "./db";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // New methods for calculations
  saveCalculation(calculation: InsertCalculation): Promise<Calculation>;
  getCalculations(): Promise<Calculation[]>;
}

export class PostgresStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async saveCalculation(calculation: InsertCalculation): Promise<Calculation> {
    const result = await db.insert(calculations).values(calculation).returning();
    return result[0];
  }

  async getCalculations(): Promise<Calculation[]> {
    return await db.select().from(calculations).orderBy(desc(calculations.createdAt));
  }
}

export const storage = new PostgresStorage();