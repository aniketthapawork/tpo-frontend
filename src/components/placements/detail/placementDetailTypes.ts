
export interface Company {
  name: string;
  description?: string;
  website?: string;
}

export interface EligibilityCriteria {
  activeBacklogs?: string;
  deadBacklogs?: string;
  otherEligibilities?: string[];
}

export interface PlacementUpdate {
  _id: string;
  updateType: 'Alert' | 'Info' | 'Reminder';
  message: string;
  createdAt: string;
}

export interface PlacementDetails {
  _id: string;
  title: string;
  batches: string[];
  company: Company;
  jobDesignation: string;
  jobDescriptionLink?: string;
  eligibleBranches: string[];
  eligibilityCriteria: EligibilityCriteria;
  ctcDetails: string;
  location: string;
  modeOfRecruitment: string;
  tentativeDriveDate?: string;
  driveRounds: string[];
  applyLink?: string;
  applicationDeadline?: string;
  notes?: string[];
  updates?: PlacementUpdate[];
  createdAt: string;
}

