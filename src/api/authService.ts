
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

export const userUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(1, "Current password is required if changing password").optional(), // Current password
  newPassword: z.string().min(6, "New password must be at least 6 characters").optional(),
})
.refine(data => {
  // If newPassword is provided, password (current password) must also be provided.
  if (data.newPassword && !data.password) return false;
  return true;
}, {
  message: "Current password is required to set a new password.",
  path: ["password"],
})
.refine(data => {
  // New password cannot be the same as the current password.
  if (data.password && data.newPassword && data.password === data.newPassword) return false;
  return true;
}, {
  message: "New password cannot be the same as the current password.",
  path: ["newPassword"],
})
.refine(data => {
  // At least one field should be updated.
  return !!(data.name || data.email || (data.password && data.newPassword));
}, {
  message: "Please provide details to update.", 
  // This error isn't tied to a specific field, handle as a general form error.
});

export type UserUpdateData = z.infer<typeof userUpdateSchema>;


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

export const updateMe = async (data: UserUpdateData) => {
  // Filter out undefined fields before sending to backend
  const payload: Partial<UserUpdateData> = {};
  if (data.name) payload.name = data.name;
  if (data.email) payload.email = data.email;
  if (data.password) payload.password = data.password;
  if (data.newPassword) payload.newPassword = data.newPassword;

  const response = await axiosInstance.put('/auth/me', payload);
  return response.data;
};

