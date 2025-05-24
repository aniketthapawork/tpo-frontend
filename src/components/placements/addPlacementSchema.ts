
import * as z from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
  website: z.string().url({ message: "Invalid company website URL" }).optional().or(z.literal('')),
});

export const addPlacementSchema = z.object({
  title: z.string().min(1, "Placement title is required"),
  company: companySchema,
  jobDesignation: z.string().min(1, "Job designation is required"),
  eligibleBranches: z.string().min(1, "Eligible branches are required (comma-separated). Example: CSE, ECE, ME"),
  ctcDetails: z.string().min(1, "CTC details are required"),
  applicationDeadline: z.date().optional(),
  jobDescription: z.string().optional(),
  selectionProcess: z.string().optional(), // Will be split, e.g., "Round 1: Aptitude, Round 2: Technical Interview"
  additionalDetails: z.string().optional(),
  driveType: z.enum(["On-Campus", "Off-Campus", "Pool-Campus"], {
    errorMap: () => ({ message: "Please select a valid drive type." })
  }).optional(),
  jobLocation: z.string().optional(),
  registrationLink: z.string().url({ message: "Invalid registration link URL" }).optional().or(z.literal('')),
  status: z.enum(["Upcoming", "Ongoing", "Completed"], {
    errorMap: () => ({ message: "Please select a valid status." })
  }).default("Upcoming"),
});

export type AddPlacementFormData = z.infer<typeof addPlacementSchema>;

// This is the type we expect the backend to consume for creation,
// after transforming comma-separated strings to arrays.
export type NewPlacementPayload = Omit<AddPlacementFormData, 'eligibleBranches' | 'selectionProcess'> & {
  eligibleBranches: string[];
  selectionProcess?: string[];
};

// Payload for updating an existing placement.
// For now, assuming it's the same as creating a new one regarding the fields sent.
export type EditPlacementPayload = NewPlacementPayload;

