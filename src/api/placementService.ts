
import axiosInstance from './axiosInstance';

export const getAllPlacements = async () => {
  const response = await axiosInstance.get('/placements');
  return response.data;
};

export const getPlacementById = async (id: string) => {
  const response = await axiosInstance.get(`/placements/${id}`);
  return response.data;
};
