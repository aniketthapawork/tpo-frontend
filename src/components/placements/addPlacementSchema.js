
import * as z from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
  website: z.string().url({ message: "Invalid company website URL" }).optional().or(z.literal('')),
});

export const eligibilityCriteriaSchema = z.object({
  activeBacklogs: z.string().optional(),
  deadBacklogs: z.string().optional(),
  otherEligibilities: z.string().optional(), // Comma-separated, will be transformed to string[]
});

export const addPlacementSchema = z.object({
  title: z.string().min(1, "Placement title is required"),
  batches: z.string().min(1, "Batches are required (comma-separated). Example: 2025, 2026"),
  company: companySchema,
  jobDesignation: z.string().min(1, "Job designation is required"),
  jobDescriptionLink: z.string().url({ message: "Invalid job description link URL" }).optional().or(z.literal('')),
  eligibleBranches: z.string().min(1, "Eligible branches are required (comma-separated). Example: CSE, ECE, ME"),
  eligibilityCriteria: eligibilityCriteriaSchema.optional(),
  ctcDetails: z.string().min(1, "CTC details are required"),
  location: z.string().optional(),
  modeOfRecruitment: z.string().optional(),
  tentativeDriveDate: z.date().optional(),
  driveRounds: z.string().optional(), // Comma-separated, will be transformed to string[]
  applyLink: z.string().url({ message: "Invalid apply link URL" }).optional().or(z.literal('')),
  applicationDeadline: z.date().optional(),
  selectionProcess: z.string().optional(), // Will be split, e.g., "Round 1: Aptitude, Round 2: Technical Interview"
  registrationLink: z.string().url({ message: "Invalid registration link URL" }).optional().or(z.literal('')), // This seems duplicative with applyLink, review if needed
  notes: z.string().optional(), // Comma-separated or newline-separated, will be transformed to string[]
  additionalDetails: z.string().optional(),
  status: z.enum(["Upcoming", "Ongoing", "Completed"], {
    errorMap: () => ({ message: "Please select a valid status." })
  }).default("Upcoming"),
});

// No more AddPlacementFormData, NewPlacementPayload, EditPlacementPayload TypeScript types
// These would be inferred at runtime or managed by component logic directly if needed.
// For simplicity in JS, we often rely on the Zod schema for validation and expect the runtime data to match.

