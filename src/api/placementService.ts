import axiosInstance from './axiosInstance';
import { PlacementDetails, PlacementUpdate } from '@/components/placements/detail/placementDetailTypes';
import { AddUpdateFormData, EditUpdateFormData } from '@/components/placements/detail/updateFormSchemas';
import { NewPlacementPayload } from '@/components/placements/addPlacementSchema'; // New import

export const getAllPlacements = async () => {
  const response = await axiosInstance.get('/placements');
  return response.data;
};

export const getPlacementById = async (id: string) => {
  const response = await axiosInstance.get(`/placements/${id}`);
  return response.data;
};

export const deletePlacement = async (id: string) => {
  const response = await axiosInstance.delete(`/placements/${id}`);
  return response.data;
};

// We'll need a more complete Placement creation/update type later for a full edit form
// For now, this is a placeholder if needed by an edit page.
// This specific function isn't used in PlacementDetailPage for the main edit button in this change.
export const updatePlacement = async (id: string, placementData: Partial<PlacementDetails>) => {
  const response = await axiosInstance.put(`/placements/${id}`, placementData);
  return response.data;
};

// Using AddUpdateFormData from Zod schema directly
export const addPlacementUpdate = async (placementId: string, updateData: AddUpdateFormData) => {
  const response = await axiosInstance.post(`/placements/${placementId}/updates`, updateData);
  return response.data;
};

// Using EditUpdateFormData from Zod schema directly
// Assuming edit operation requires all fields as defined in EditUpdateFormData
export const editPlacementUpdate = async (placementId: string, updateId: string, updateData: EditUpdateFormData) => {
  const response = await axiosInstance.put(`/placements/${placementId}/updates/${updateId}`, updateData);
  return response.data;
};

// Placeholder for deleting an existing update - not implemented in UI yet
export const deletePlacementUpdate = async (placementId: string, updateId: string) => {
  const response = await axiosInstance.delete(`/placements/${placementId}/updates/${updateId}`);
  return response.data;
};

export const addPlacement = async (placementData: NewPlacementPayload) => {
  const response = await axiosInstance.post('/placements', placementData);
  return response.data;
};
