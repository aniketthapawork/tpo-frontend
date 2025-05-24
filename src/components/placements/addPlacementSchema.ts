
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
  location: z.string().optional(), // Renamed from jobLocation
  modeOfRecruitment: z.string().optional(), // Renamed from driveType, now a string
  tentativeDriveDate: z.date().optional(),
  applicationDeadline: z.date().optional(),
  selectionProcess: z.string().optional(), // Will be split, e.g., "Round 1: Aptitude, Round 2: Technical Interview"
  registrationLink: z.string().url({ message: "Invalid registration link URL" }).optional().or(z.literal('')),
  notes: z.string().optional(), // Comma-separated or newline-separated, will be transformed to string[]
  additionalDetails: z.string().optional(), // Kept for any other unstructured details
  status: z.enum(["Upcoming", "Ongoing", "Completed"], {
    errorMap: () => ({ message: "Please select a valid status." })
  }).default("Upcoming"),
  // Removed jobDescription as jobDescriptionLink is more specific, and general text can go in additionalDetails or notes.
  // If a full job description text area is still needed, it can be re-added.
  // Based on the JSON, jobDescription itself isn't there, but jobDescriptionLink is.
});

export type AddPlacementFormData = z.infer<typeof addPlacementSchema>;

// This is the type we expect the backend to consume for creation,
// after transforming comma-separated strings to arrays.
export type NewPlacementPayload = Omit<AddPlacementFormData, 'eligibleBranches' | 'selectionProcess' | 'batches' | 'notes' | 'eligibilityCriteria'> & {
  batches: string[];
  eligibleBranches: string[];
  selectionProcess?: string[];
  notes?: string[];
  eligibilityCriteria?: {
    activeBacklogs?: string;
    deadBacklogs?: string;
    otherEligibilities?: string[];
  };
};

// Payload for updating an existing placement.
export type EditPlacementPayload = NewPlacementPayload;
