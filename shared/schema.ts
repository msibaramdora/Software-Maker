import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // email
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'employee' | 'watchman'
});

export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  visitorName: text("visitor_name"),
  visitorEmail: text("visitor_email"),
  visitorPhone: text("visitor_phone"),
  visitorPhotoUrl: text("visitor_photo_url"),
  visitDate: timestamp("visit_date").notNull(),
  purpose: text("purpose").notNull(),
  status: text("status").notNull().default('pending'), // 'invited', 'pending', 'approved', 'rejected', 'active', 'completed'
  inviteToken: text("invite_token"),
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertVisitSchema = createInsertSchema(visits).omit({ id: true, checkInTime: true, checkOutTime: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Visit = typeof visits.$inferSelect;
export type InsertVisit = z.infer<typeof insertVisitSchema>;
