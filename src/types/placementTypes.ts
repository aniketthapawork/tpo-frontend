
import * as z from 'zod';
// Adjust the import path if your addPlacementSchema.js is elsewhere or named differently.
// Assuming addPlacementSchema.js exports the schema as a named export.
import { addPlacementSchema } from '@/components/placements/addPlacementSchema.js';

// Type for the form values, directly inferred from the Zod schema
export type PlacementFormValues = z.infer<typeof addPlacementSchema>;

// Base payload structure for creating/updating placements.
// This often mirrors form values but might have transformations (e.g., strings to arrays).
// Dates are kept as Date objects here; service layer can handle ISO string conversion if needed.
export interface BasePlacementPayload extends Omit<PlacementFormValues,
  'batches' |
  'eligibleBranches' |
  'selectionProcess' |
  'notes' |
  'eligibilityCriteria'
> {
  batches: string[];
  eligibleBranches: string[];
  eligibilityCriteria?: {
    activeBacklogs?: string;
    deadBacklogs?: string;
    otherEligibilities?: string[];
  };
  selectionProcess?: string[]; // Corresponds to 'driveRounds' in some backend versions
  notes?: string[]; // Assuming notes are an array of strings for the backend
  // tentativeDriveDate and applicationDeadline are inherited from PlacementFormValues as Date | undefined
}

export interface NewPlacementPayload extends BasePlacementPayload {}
export interface EditPlacementPayload extends BasePlacementPayload {}

// If you have specific types for placement updates (not the placement itself)
// like AddUpdateFormData, EditUpdateFormData, they can also be defined or inferred here
// For example, from updateFormSchemas.js:
// import { addUpdateSchema, editUpdateSchema } from '@/components/placements/detail/updateFormSchemas.js';
// export type AddUpdateFormValues = z.infer<typeof addUpdateSchema>;
// export type EditUpdateFormValues = z.infer<typeof editUpdateSchema>;

