import { z } from "zod";

export const getMessagesSchema = z.object({
  query: z.object({
    room: z.string().min(1, "room is required"),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  }),
});
