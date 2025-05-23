import axiosInstance from './axiosInstance';

export interface SelectedStudent {
  name: string;
  rollno: string;
  branch: string;
  _id?: string; // May or may not have _id from backend inside the array
}

export interface SelectionData {
  selectedStudents: SelectedStudent[];
  nextSteps?: string[];
  documentLink?: string;
  additionalNotes?: string[];
}

export interface SelectionRecord extends SelectionData {
  _id: string;
  placementId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  message: string;
  selections?: T[];
  selection?: T;
  updated?: T; // For update response
}

export const getSelectionsByPlacementId = async (placementId: string): Promise<SelectionRecord[]> => {
  const response = await axiosInstance.get<ApiResponse<SelectionRecord>>(`/selections/${placementId}`);
  
  // Prefer the 'selections' array if it's provided and is actually an array
  if (Array.isArray(response.data.selections)) {
    return response.data.selections;
  }
  
  // Fallback: if 'selections' isn't a valid array, check if a singular 'selection' object was provided
  if (response.data.selection && typeof response.data.selection === 'object') {
    // Assuming if 'selection' object is returned from this endpoint for the given placementId, it's the relevant one.
    // We'll wrap it in an array to match the expected return type.
    const singleSelection = response.data.selection as SelectionRecord;
    // Optional: Add a check to ensure the single selection matches the placementId, though the API endpoint should guarantee this.
    // if (singleSelection.placementId === placementId) {
    return [singleSelection];
    // }
  }
  
  return []; // Default to empty array if neither form of data is found or applicable
};

export const addSelection = async (placementId: string, data: SelectionData): Promise<SelectionRecord> => {
  const response = await axiosInstance.post<ApiResponse<SelectionRecord>>(`/selections/${placementId}`, data);
  if (!response.data.selection) throw new Error("Selection data not returned from API after creation.");
  return response.data.selection;
};

export const updateSelection = async (selectionId: string, data: Partial<SelectionData>): Promise<SelectionRecord> => {
  const response = await axiosInstance.put<ApiResponse<SelectionRecord>>(`/selections/${selectionId}`, data);
  if (!response.data.updated) throw new Error("Updated selection data not returned from API.");
  return response.data.updated;
};

export const deleteSelection = async (selectionId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/selections/${selectionId}`);
  return response.data;
};
