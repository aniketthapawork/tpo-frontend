
import axiosInstance from './axiosInstance';

export interface InterviewData {
  interviewDate: string; // ISO Date string e.g. "2025-06-15T10:00:00.000Z"
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "12:00 PM"
  mode: 'Online' | 'Offline' | string;
  meetingLink?: string;
  shortlistedStudentsDoc?: string;
  additionalNotes?: string[];
}

export interface Interview extends InterviewData {
  _id: string;
  placementId: string;
  createdAt?: string; // Assuming these might be in the response
  updatedAt?: string; // Assuming these might be in the response
}

interface ApiResponse<T> {
  message: string;
  interviews?: T[];
  interview?: T;
  updated?: T; // For update response
}

export const getInterviewsByPlacementId = async (placementId: string): Promise<Interview[]> => {
  const response = await axiosInstance.get<ApiResponse<Interview>>(`/interviews/${placementId}`);
  return response.data.interviews || [];
};

export const addInterview = async (placementId: string, data: InterviewData): Promise<Interview> => {
  const response = await axiosInstance.post<ApiResponse<Interview>>(`/interviews/${placementId}`, data);
  if (!response.data.interview) throw new Error("Interview data not returned from API after creation.");
  return response.data.interview;
};

export const updateInterview = async (interviewId: string, data: Partial<InterviewData>): Promise<Interview> => {
  const response = await axiosInstance.put<ApiResponse<Interview>>(`/interviews/${interviewId}`, data);
  if (!response.data.updated) throw new Error("Updated interview data not returned from API.");
  return response.data.updated;
};

export const deleteInterview = async (interviewId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/interviews/${interviewId}`);
  return response.data;
};

