import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const calculations = pgTable("calculations", {
  id: serial("id").primaryKey(),
  netWeight: numeric("net_weight").notNull(),
  goldRate: numeric("gold_rate").notNull(),
  makingCharges: numeric("making_charges").notNull(),
  makingAmount: numeric("making_amount").notNull(),
  gstAmount: numeric("gst_amount").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Update the calculation schema to handle numeric values properly
export const insertCalculationSchema = z.object({
  netWeight: z.number(),
  goldRate: z.number(),
  makingCharges: z.number(),
  makingAmount: z.number(),
  gstAmount: z.number(),
  totalAmount: z.number(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type Calculation = typeof calculations.$inferSelect;