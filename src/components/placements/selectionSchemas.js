
import * as z from "zod";

export const selectedStudentSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  rollno: z.string().min(1, "Roll number is required"),
  branch: z.string().min(1, "Branch is required"),
});

export const selectionSchema = z.object({
  selectedStudents: z.array(selectedStudentSchema).min(1, "At least one student must be selected with complete details."),
  nextSteps: z.string().optional(),
  documentLink: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
  additionalNotes: z.string().optional(),
});

// No more SelectionFormData, SelectedStudentInput TypeScript types
