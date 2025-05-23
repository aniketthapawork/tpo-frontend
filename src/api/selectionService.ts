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
  // Expect the response to be either an array of SelectionRecord directly,
  // or an ApiResponse object containing the selections.
  const response = await axiosInstance.get<SelectionRecord[] | ApiResponse<SelectionRecord>>(`/selections/${placementId}`);
  
  // Scenario 1: The response.data is the array of SelectionRecord itself
  if (Array.isArray(response.data)) {
    return response.data as SelectionRecord[];
  }
  
  // Scenario 2: The response.data is an ApiResponse object
  // We cast response.data to ApiResponse<SelectionRecord> as it's not an array.
  const apiResponseData = response.data as ApiResponse<SelectionRecord>;

  if (apiResponseData && Array.isArray(apiResponseData.selections)) {
    return apiResponseData.selections;
  }
  
  if (apiResponseData && apiResponseData.selection && typeof apiResponseData.selection === 'object') {
    // Ensure the single selection is wrapped in an array to match return type
    return [apiResponseData.selection as SelectionRecord];
  }
  
  // If the structure is unexpected (e.g., an object but not matching ApiResponse)
  console.warn("Unexpected response structure for getSelectionsByPlacementId:", response.data);
  return []; // Default to empty array if data is not in expected formats
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
