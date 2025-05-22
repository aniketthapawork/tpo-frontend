
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupData } from '@/api/authService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

const SignupPage = () => {
  const { signup, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'student',
    },
  });

  const onSubmit = async (data: SignupData) => {
    try {
      await signup(data);
      navigate('/placements');
    } catch (error) {
      // Error toast is handled in AuthContext
    }
  };

  const currentLoading = authLoading || isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-slate-700">Sign Up</CardTitle>
          <CardDescription className="text-center text-slate-500">
            Create your TPO Platform account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" {...register('name')} 
                     className={errors.name ? "border-red-500" : ""} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')}
                     className={errors.email ? "border-red-500" : ""} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="rollno">Roll Number</Label>
              <Input id="rollno" placeholder="e.g., CS101" {...register('rollno')}
                     className={errors.rollno ? "border-red-500" : ""} />
              {errors.rollno && <p className="text-red-500 text-sm">{errors.rollno.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')}
                     className={errors.password ? "border-red-500" : ""} />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select defaultValue="student" onValueChange={(value) => setValue('role', value as 'student' | 'admin')}>
                <SelectTrigger id="role" className={errors.role ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="admin">Admin (Requires specific roll number)</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800" disabled={currentLoading}>
              {currentLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center block">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-slate-700 hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignupPage;
