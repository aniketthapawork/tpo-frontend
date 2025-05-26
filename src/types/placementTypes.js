
// Convert TypeScript types to JSDoc comments for better JavaScript documentation
import { addPlacementSchema } from '@/components/placements/addPlacementSchema.js';

/**
 * @typedef {import('zod').infer<typeof addPlacementSchema>} PlacementFormValues
 */

/**
 * @typedef {Object} BasePlacementPayload
 * @property {string[]} batches
 * @property {string[]} eligibleBranches
 * @property {{activeBacklogs?: string, deadBacklogs?: string, otherEligibilities?: string[]}} [eligibilityCriteria]
 * @property {string[]} [selectionProcess]
 * @property {string[]} [notes]
 * @property {Date} [tentativeDriveDate]
 * @property {Date} [applicationDeadline]
 */

/**
 * @typedef {BasePlacementPayload} NewPlacementPayload
 */

/**
 * @typedef {BasePlacementPayload} EditPlacementPayload
 */

// No exports needed as this is just for documentation
