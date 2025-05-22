
import axiosInstance from './axiosInstance';
import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rollno: z.string().min(1, "Roll number is required"),
  role: z.enum(['student', 'admin']).default('student'),
});
export type SignupData = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginData = z.infer<typeof loginSchema>;

export const registerUser = async (data: SignupData) => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data;
};

export const loginUser = async (data: LoginData) => {
  const response = await axiosInstance.post('/auth/login', data);
  return response.data;
};

export const getMe = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};
