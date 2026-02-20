import { db } from "./db";
import { users, visits } from "@shared/schema";
import type { User, InsertUser, Visit, InsertVisit } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getEmployees(): Promise<User[]>;

  // Visits
  getVisits(): Promise<Visit[]>;
  getVisit(id: number): Promise<Visit | undefined>;
  getVisitByToken(token: string): Promise<Visit | undefined>;
  createVisit(visit: InsertVisit): Promise<Visit>;
  updateVisitStatus(id: number, status: string): Promise<Visit>;
  updateVisitDetails(id: number, details: Partial<InsertVisit>): Promise<Visit>;
  checkInVisit(id: number, time: Date): Promise<Visit>;
  checkOutVisit(id: number, time: Date): Promise<Visit>;
  
  // Stats
  getWatchmanStats(): Promise<{ todayVisits: number, currentlyInside: number, leftOffice: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getEmployees(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, 'employee'));
  }

  async getVisits(): Promise<Visit[]> {
    return await db.select().from(visits).orderBy(desc(visits.visitDate));
  }

  async getVisit(id: number): Promise<Visit | undefined> {
    const [visit] = await db.select().from(visits).where(eq(visits.id, id));
    return visit;
  }

  async getVisitByToken(token: string): Promise<Visit | undefined> {
    if (!token) return undefined;
    const [visit] = await db.select().from(visits).where(eq(visits.inviteToken, token));
    return visit;
  }

  async createVisit(visit: InsertVisit): Promise<Visit> {
    const [newVisit] = await db.insert(visits).values(visit).returning();
    return newVisit;
  }

  async updateVisitStatus(id: number, status: string): Promise<Visit> {
    const [visit] = await db.update(visits)
      .set({ status })
      .where(eq(visits.id, id))
      .returning();
    return visit;
  }

  async updateVisitDetails(id: number, details: Partial<InsertVisit>): Promise<Visit> {
    const [visit] = await db.update(visits)
      .set(details)
      .where(eq(visits.id, id))
      .returning();
    return visit;
  }

  async checkInVisit(id: number, time: Date): Promise<Visit> {
    const [visit] = await db.update(visits)
      .set({ checkInTime: time, status: 'active' })
      .where(eq(visits.id, id))
      .returning();
    return visit;
  }

  async checkOutVisit(id: number, time: Date): Promise<Visit> {
    const [visit] = await db.update(visits)
      .set({ checkOutTime: time, status: 'completed' })
      .where(eq(visits.id, id))
      .returning();
    return visit;
  }

  async getWatchmanStats(): Promise<{ todayVisits: number, currentlyInside: number, leftOffice: number }> {
    const allVisits = await db.select().from(visits);
    
    // Simplistic calculation for MVP
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let todayVisits = 0;
    let currentlyInside = 0;
    let leftOffice = 0;
    
    for (const v of allVisits) {
      const vDate = new Date(v.visitDate);
      if (vDate >= today) {
        todayVisits++;
      }
      if (v.status === 'active' || (v.checkInTime && !v.checkOutTime)) {
        currentlyInside++;
      }
      if (v.status === 'completed' || (v.checkOutTime && new Date(v.checkOutTime) >= today)) {
        leftOffice++;
      }
    }
    
    return { todayVisits, currentlyInside, leftOffice };
  }
}

export const storage = new DatabaseStorage();
