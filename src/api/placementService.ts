
import axiosInstance from './axiosInstance';
// Removed: import { PlacementDetails } from '@/components/placements/detail/placementDetailTypes';
import { AddUpdateFormData, EditUpdateFormData } from '@/components/placements/detail/updateFormSchemas';
import { NewPlacementPayload, EditPlacementPayload } from '@/components/placements/addPlacementSchema';

export const getAllPlacements = async () => {
  const response = await axiosInstance.get('/placements');
  return response.data;
};

// Removed PlacementDetails from return type annotation
export const getPlacementById = async (id/*: string*/) => {
  const response = await axiosInstance.get(`/placements/${id}`);
  return response.data; // The actual structure { placement: ... } is determined by the API
};

export const deletePlacement = async (id/*: string*/) => {
  const response = await axiosInstance.delete(`/placements/${id}`);
  return response.data;
};

// EditPlacementPayload is still used, assuming it's defined or will be handled
export const updatePlacement = async (id/*: string*/, placementData: EditPlacementPayload) => {
  const response = await axiosInstance.put(`/placements/${id}`, placementData);
  return response.data;
};

// AddUpdateFormData and EditUpdateFormData are still used
export const addPlacementUpdate = async (placementId/*: string*/, updateData: AddUpdateFormData) => {
  const response = await axiosInstance.post(`/placements/${placementId}/updates`, updateData);
  return response.data;
};

export const editPlacementUpdate = async (placementId/*: string*/, updateId/*: string*/, updateData: EditUpdateFormData) => {
  const response = await axiosInstance.put(`/placements/${placementId}/updates/${updateId}`, updateData);
  return response.data;
};

export const deletePlacementUpdate = async (placementId/*: string*/, updateId/*: string*/) => {
  const response = await axiosInstance.delete(`/placements/${placementId}/updates/${updateId}`);
  return response.data;
};

// NewPlacementPayload is still used
export const addPlacement = async (placementData: NewPlacementPayload) => {
  const response = await axiosInstance.post('/placements', placementData);
  return response.data;
};

