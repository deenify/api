// src/env/client.ts
import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE: z.string().url(),
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
