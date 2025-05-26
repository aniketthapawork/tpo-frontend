
import axiosInstance from './axiosInstance';

export const getAllPlacements = async () => {
  const response = await axiosInstance.get('/placements');
  return response.data;
};

export const getPlacementById = async (id) => {
  const response = await axiosInstance.get(`/placements/${id}`);
  return response.data;
};

export const deletePlacement = async (id) => {
  const response = await axiosInstance.delete(`/placements/${id}`);
  return response.data;
};

export const updatePlacement = async (id, placementData) => {
  const response = await axiosInstance.put(`/placements/${id}`, placementData);
  return response.data;
};

export const addPlacementUpdate = async (placementId, updateData) => {
  const response = await axiosInstance.post(`/placements/${placementId}/updates`, updateData);
  return response.data;
};

export const editPlacementUpdate = async (placementId, updateId, updateData) => {
  const response = await axiosInstance.put(`/placements/${placementId}/updates/${updateId}`, updateData);
  return response.data;
};

export const deletePlacementUpdate = async (placementId, updateId) => {
  const response = await axiosInstance.delete(`/placements/${placementId}/updates/${updateId}`);
  return response.data;
};

export const addPlacement = async (placementData) => {
  const response = await axiosInstance.post('/placements', placementData);
  return response.data;
};
