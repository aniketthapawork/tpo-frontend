
import * as z from "zod";

export const addUpdateSchema = z.object({
  updateType: z.enum(["Alert", "Info", "Reminder"], { required_error: "Update type is required." }),
  message: z.string().min(1, "Message cannot be empty.").max(500, "Message is too long."),
});

export const editUpdateSchema = z.object({
  updateType: z.enum(["Alert", "Info", "Reminder"], { required_error: "Update type is required." }),
  message: z.string().min(1, "Message cannot be empty.").max(500, "Message is too long."),
});

export type AddUpdateFormData = z.infer<typeof addUpdateSchema>;
export type EditUpdateFormData = z.infer<typeof editUpdateSchema>;

