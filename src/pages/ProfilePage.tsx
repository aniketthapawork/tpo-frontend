
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { userUpdateSchema, UserUpdateData, updateMe } from '@/api/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Loader2, UserCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as z from 'zod';

const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

const passwordUpdateSchema = z.object({
  password: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
}).refine(data => data.password !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
type PasswordUpdateData = z.infer<typeof passwordUpdateSchema>;

const ProfilePage = () => {
  const { user, setUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const profileForm = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordUpdateData>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      password: '',
      newPassword: '',
    },
  });

  const onProfileSubmit = async (data: ProfileUpdateData) => {
    const payload: Partial<UserUpdateData> = {};
    if (data.name !== user?.name) payload.name = data.name;
    if (data.email !== user?.email) payload.email = data.email;
    
    if (Object.keys(payload).length === 0) {
      toast({
        title: "No Changes",
        description: "You haven't made any changes to submit.",
        variant: "default",
      });
      return;
    }

    try {
      const response = await updateMe(payload);
      setUser(response.user);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      profileForm.reset({
        name: response.user.name,
        email: response.user.email,
      });
    } catch (error: any) {
      console.error("Profile update failed:", error);
      const errorMessage = error.response?.data?.message || "Profile update failed. Please try again.";
      toast({
        title: "Update Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const onPasswordSubmit = async (data: PasswordUpdateData) => {
    try {
      await updateMe({
        password: data.password,
        newPassword: data.newPassword,
      });
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });
      passwordForm.reset();
      setShowPasswordSection(false);
    } catch (error: any) {
      console.error("Password update failed:", error);
      const errorMessage = error.response?.data?.message || "Password update failed. Please try again.";
      toast({
        title: "Update Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  if (authLoading) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="h-12 w-12 animate-spin text-slate-600" />
        <p className="ml-4 text-xl text-slate-700">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Profile Information Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <UserCircle className="mx-auto h-16 w-16 text-slate-600 mb-2" />
            <CardTitle className="text-2xl font-bold">Profile Information</CardTitle>
            <CardDescription>Update your account details. Current Role: <span className="font-semibold">{user.role}</span></CardDescription>
          </CardHeader>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={profileForm.formState.isSubmitting}>
                  {profileForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Profile
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {/* Password Change Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <Lock className="mx-auto h-16 w-16 text-slate-600 mb-2" />
            <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
            <CardDescription>Update your account password for security</CardDescription>
          </CardHeader>
          {!showPasswordSection ? (
            <CardContent className="text-center">
              <Button onClick={() => setShowPasswordSection(true)} variant="outline" className="w-full">
                Change Password
              </Button>
            </CardContent>
          ) : (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <CardContent className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Current Password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="New Password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setShowPasswordSection(false);
                      passwordForm.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={passwordForm.formState.isSubmitting}>
                    {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </CardFooter>
              </form>
            </Form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
