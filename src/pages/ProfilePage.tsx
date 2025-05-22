
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { userUpdateSchema, UserUpdateData, updateMe } from '@/api/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Loader2, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, setUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const form = useForm<UserUpdateData>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      newPassword: '',
    },
  });

  const { handleSubmit, formState: { isSubmitting, errors } } = form;

  const onSubmit = async (data: UserUpdateData) => {
    // Filter out empty strings for optional fields if they weren't touched
    const payload: UserUpdateData = {};
    if (data.name && data.name !== user?.name) payload.name = data.name;
    if (data.email && data.email !== user?.email) payload.email = data.email;
    if (data.password && data.newPassword) {
      payload.password = data.password;
      payload.newPassword = data.newPassword;
    }
    
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
      setUser(response.user); // Update user in context
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      form.reset({
        name: response.user.name,
        email: response.user.email,
        password: '',
        newPassword: '',
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
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <UserCircle className="mx-auto h-16 w-16 text-slate-600 mb-2" />
          <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
          <CardDescription>Manage your account details here. Current Role: <span className="font-semibold">{user.role}</span></CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
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
                control={form.control}
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
              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm font-medium text-slate-700">Change Password (optional)</p>
                 <FormField
                    control={form.control}
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
                    control={form.control}
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
              </div>
               {/* Display general form error for refinement */}
              {errors.root?.message && (
                <p className="text-sm font-medium text-destructive">{errors.root.message}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Profile
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;

