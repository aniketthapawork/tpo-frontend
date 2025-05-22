
import axiosInstance from './axiosInstance';
import { PlacementDetails, PlacementUpdate } from '@/pages/Placements/PlacementDetailPage'; // Assuming types are exported or defined here

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

interface AddPlacementUpdateData {
  updateType: 'Alert' | 'Info' | 'Reminder';
  message: string;
}

export const addPlacementUpdate = async (placementId: string, updateData: AddPlacementUpdateData) => {
  const response = await axiosInstance.post(`/placements/${placementId}/updates`, updateData);
  return response.data;
};

// Placeholder for editing an existing update - not implemented in UI yet
export const editPlacementUpdate = async (placementId: string, updateId: string, updateData: Partial<AddPlacementUpdateData>) => {
  const response = await axiosInstance.put(`/placements/${placementId}/updates/${updateId}`, updateData);
  return response.data;
};

// Placeholder for deleting an existing update - not implemented in UI yet
export const deletePlacementUpdate = async (placementId: string, updateId: string) => {
  const response = await axiosInstance.delete(`/placements/${placementId}/updates/${updateId}`);
  return response.data;
};

