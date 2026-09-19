import { z } from "zod";

export const participationSchema = z.object({
  recipientId: z.literal("yejin-22"),
  displayName: z.string().trim().min(1).max(30),
  relationship: z.string().trim().max(20),
  examChoice: z.number().int().min(0).max(3).nullable(),
  examScore: z.union([z.literal(0), z.literal(100)]),
  practiceAnswers: z.array(z.object({ roundId: z.string().max(30), choiceId: z.string().max(30) })).length(3),
  practiceScore: z.number().int().min(0).max(3),
  message: z.string().trim().min(1).max(300),
  clientSubmissionKey: z.string().uuid(),
});

export type ParticipationInput = z.infer<typeof participationSchema>;
