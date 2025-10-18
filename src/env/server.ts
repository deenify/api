// src/env/server.ts
import { z } from "zod";

const serverEnvSchema = z.object({
  MONGODB_QURAN_URI: z.string().url(),
  MONGODB_HADITH_CHAPTERWISE_ABM_URI: z.string().url(),
  MONGODB_HADITH_CHAPTERWISE_ITN_URI: z.string().url(),
  MONGODB_HADITH_BOOKWISE_URI: z.string().url(),
  MONGODB_SUPPLICATION_URI: z.string().url(),
});

export const serverEnv = serverEnvSchema.parse({
  MONGODB_QURAN_URI: process.env.MONGODB_QURAN_URI,
  MONGODB_HADITH_CHAPTERWISE_ABM_URI:
    process.env.MONGODB_HADITH_CHAPTERWISE_ABM_URI,
  MONGODB_HADITH_CHAPTERWISE_ITN_URI:
    process.env.MONGODB_HADITH_CHAPTERWISE_ITN_URI,
  MONGODB_HADITH_BOOKWISE_URI: process.env.MONGODB_HADITH_BOOKWISE_URI,
  MONGODB_SUPPLICATION_URI: process.env.MONGODB_SUPPLICATION_URI,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
