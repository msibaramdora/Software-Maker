import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomBytes } from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const MemoryStore = createMemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({ checkPeriod: 86400000 })
  }));

  // Helper to get current user
  app.use(async (req, res, next) => {
    if (req.session && (req.session as any).userId) {
      const user = await storage.getUser((req.session as any).userId);
      (req as any).user = user;
    }
    next();
  });

  // Setup routes
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(input.username);
      if (!user || user.password !== input.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      (req.session as any).userId = user.id;
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Not logged in" });
    res.json(user);
  });

  app.get(api.employees.list.path, async (req, res) => {
    const emps = await storage.getEmployees();
    res.json(emps);
  });

  app.get(api.visits.list.path, async (req, res) => {
    const visits = await storage.getVisits();
    res.json(visits);
  });

  app.post(api.visits.invite.path, async (req, res) => {
    try {
      const input = api.visits.invite.input.parse(req.body);
      const inviteToken = randomBytes(16).toString('hex');
      
      const user = (req as any).user;
      if (!user || user.role !== 'employee') {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const visit = await storage.createVisit({
        employeeId: user.id,
        visitorName: input.visitorName,
        visitorEmail: input.visitorEmail,
        purpose: input.purpose,
        visitDate: new Date(input.visitDate),
        status: 'invited',
        inviteToken
      });
      res.status(201).json(visit);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.get(api.visits.getInvite.path, async (req, res) => {
    const visit = await storage.getVisitByToken(req.params.token);
    if (!visit) return res.status(404).json({ message: "Not found" });
    res.json(visit);
  });

  app.patch(api.visits.acceptInvite.path, async (req, res) => {
    try {
      const input = api.visits.acceptInvite.input.parse(req.body);
      const visit = await storage.getVisitByToken(req.params.token);
      if (!visit) return res.status(404).json({ message: "Not found" });

      const updated = await storage.updateVisitDetails(visit.id, {
        visitorName: input.visitorName,
        visitorPhone: input.visitorPhone,
        visitorPhotoUrl: input.visitorPhotoUrl,
        status: 'pending' // now waiting for approval
      });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.post(api.visits.gateRegister.path, async (req, res) => {
    try {
      const input = api.visits.gateRegister.input.parse(req.body);
      const visit = await storage.createVisit({
        employeeId: input.employeeId,
        visitorName: input.visitorName,
        visitorEmail: input.visitorEmail,
        visitorPhone: input.visitorPhone,
        visitorPhotoUrl: input.visitorPhotoUrl,
        purpose: input.purpose,
        visitDate: new Date(input.visitDate),
        status: 'pending'
      });
      res.status(201).json(visit);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: String(err) });
    }
  });

  app.patch(api.visits.updateStatus.path, async (req, res) => {
    try {
      const input = api.visits.updateStatus.input.parse(req.body);
      const visit = await storage.updateVisitStatus(Number(req.params.id), input.status);
      res.json(visit);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.get(api.visits.getVisit.path, async (req, res) => {
    const visit = await storage.getVisit(Number(req.params.id));
    if (!visit) return res.status(404).json({ message: "Not found" });
    res.json(visit);
  });

  app.get(api.watchman.stats.path, async (req, res) => {
    const stats = await storage.getWatchmanStats();
    res.json(stats);
  });

  app.patch(api.watchman.checkIn.path, async (req, res) => {
    try {
      const visit = await storage.checkInVisit(Number(req.params.id), new Date());
      res.json(visit);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.patch(api.watchman.checkOut.path, async (req, res) => {
    try {
      const visit = await storage.checkOutVisit(Number(req.params.id), new Date());
      res.json(visit);
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  });

  // Seed db with 1 employee and 1 watchman
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const adminUser = await storage.getUserByUsername('admin@company.com');
  if (!adminUser) {
    await storage.createUser({
      name: "Admin Employee",
      username: "admin@company.com",
      password: "password123", // In a real app this would be hashed
      role: "employee"
    });
  }

  const watchmanUser = await storage.getUserByUsername('gate@company.com');
  if (!watchmanUser) {
    await storage.createUser({
      name: "Main Gate Watchman",
      username: "gate@company.com",
      password: "password123",
      role: "watchman"
    });
  }
}
