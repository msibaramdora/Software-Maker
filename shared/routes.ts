import { z } from 'zod';
import { insertUserSchema, insertVisitSchema, users, visits } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({
        username: z.string().email(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: { 200: z.object({ message: z.string() }) }
    },
    me: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  employees: {
    list: {
      method: 'GET' as const,
      path: '/api/employees' as const,
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      }
    }
  },
  visits: {
    list: {
      method: 'GET' as const,
      path: '/api/visits' as const,
      responses: {
        200: z.array(z.custom<typeof visits.$inferSelect>()),
      }
    },
    invite: {
      method: 'POST' as const,
      path: '/api/visits/invite' as const,
      input: z.object({
        visitorName: z.string(),
        visitorEmail: z.string().email(),
        visitDate: z.string(),
        purpose: z.string()
      }),
      responses: {
        201: z.custom<typeof visits.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    getInvite: {
      method: 'GET' as const,
      path: '/api/visits/invite/:token' as const,
      responses: {
        200: z.custom<typeof visits.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    acceptInvite: {
      method: 'PATCH' as const,
      path: '/api/visits/invite/:token' as const,
      input: z.object({
        visitorName: z.string(),
        visitorPhone: z.string(),
        visitorPhotoUrl: z.string() // Base64 or plain text placeholder
      }),
      responses: {
        200: z.custom<typeof visits.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    gateRegister: {
      method: 'POST' as const,
      path: '/api/visits/register' as const,
      input: z.object({
        employeeId: z.number(),
        visitorName: z.string(),
        visitorEmail: z.string().email(),
        visitorPhone: z.string(),
        visitorPhotoUrl: z.string(),
        visitDate: z.string(),
        purpose: z.string()
      }),
      responses: {
        201: z.custom<typeof visits.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/visits/:id/status' as const,
      input: z.object({
        status: z.enum(['approved', 'rejected'])
      }),
      responses: {
        200: z.custom<typeof visits.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    getVisit: {
      method: 'GET' as const,
      path: '/api/visits/:id' as const,
      responses: {
        200: z.custom<typeof visits.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  },
  watchman: {
    stats: {
      method: 'GET' as const,
      path: '/api/watchman/stats' as const,
      responses: {
        200: z.object({
          todayVisits: z.number(),
          currentlyInside: z.number(),
          leftOffice: z.number()
        })
      }
    },
    checkIn: {
      method: 'PATCH' as const,
      path: '/api/watchman/visits/:id/checkin' as const,
      responses: {
        200: z.custom<typeof visits.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    checkOut: {
      method: 'PATCH' as const,
      path: '/api/watchman/visits/:id/checkout' as const,
      responses: {
        200: z.custom<typeof visits.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type WatchmanStatsResponse = z.infer<typeof api.watchman.stats.responses[200]>;
