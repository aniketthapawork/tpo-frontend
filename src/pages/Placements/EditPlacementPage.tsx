
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { addPlacementSchema, AddPlacementFormData, EditPlacementPayload } from '@/components/placements/addPlacementSchema';
import { getPlacementById, updatePlacement } from '@/api/placementService';
import { PlacementDetails } from '@/components/placements/detail/placementDetailTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const EditPlacementPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<AddPlacementFormData>({
    resolver: zodResolver(addPlacementSchema),
    defaultValues: {
      title: '',
      company: { name: '', description: '', website: '' },
      jobDesignation: '',
      eligibleBranches: '',
      ctcDetails: '',
      jobDescription: '',
      selectionProcess: '',
      additionalDetails: '',
      jobLocation: '',
      registrationLink: '',
      status: 'Upcoming',
      // applicationDeadline and driveType are optional
    },
  });

  const { data: placementData, isLoading: isLoadingPlacement, error: fetchError } = useQuery({
    queryKey: ['placement', id],
    queryFn: () => {
      if (!id) throw new Error("Placement ID is required.");
      return getPlacementById(id);
    },
    enabled: !!id,
    onSuccess: (data) => {
      const placement = data.placement;
      // Map PlacementDetails to AddPlacementFormData
      const defaultValues: Partial<AddPlacementFormData> = {
        title: placement.title,
        company: {
          name: placement.company.name,
          description: placement.company.description || '',
          website: placement.company.website || '',
        },
        jobDesignation: placement.jobDesignation,
        eligibleBranches: placement.eligibleBranches.join(', '),
        ctcDetails: placement.ctcDetails,
        applicationDeadline: placement.applicationDeadline ? new Date(placement.applicationDeadline) : undefined,
        // Assuming jobDescription is available on placement object, if not, it might need adjustment based on actual API response structure
        jobDescription: (placement as any).jobDescription || '', // Use (placement as any) if jobDescription is not in PlacementDetails type
        selectionProcess: placement.driveRounds ? placement.driveRounds.join(', ') : '',
        // Assuming additionalDetails is available
        additionalDetails: (placement as any).additionalDetails || (placement.notes ? placement.notes.join('\n') : ''),
        driveType: placement.modeOfRecruitment as "On-Campus" | "Off-Campus" | "Pool-Campus" || undefined, // Cast if API returns string
        jobLocation: placement.location || '',
        registrationLink: placement.applyLink || '',
        status: (placement as any).status || 'Upcoming', // Assuming status is available
      };
      form.reset(defaultValues);
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: EditPlacementPayload) => {
      if (!id) throw new Error("Placement ID is required for update.");
      return updatePlacement(id, payload);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Placement updated successfully!' });
      queryClient.invalidateQueries({ queryKey: ['placements'] });
      queryClient.invalidateQueries({ queryKey: ['placement', id] });
      navigate(`/placements/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update placement.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: AddPlacementFormData) => {
    const payload: EditPlacementPayload = {
      ...data,
      eligibleBranches: data.eligibleBranches.split(',').map(s => s.trim()).filter(s => s),
      selectionProcess: data.selectionProcess ? data.selectionProcess.split(',').map(s => s.trim()).filter(s => s) : [],
    };
    mutation.mutate(payload);
  };
  
  if (isLoadingPlacement) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-slate-700" />
        <p className="mt-4 text-xl text-slate-600">Loading placement details...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-semibold text-red-700">Error Loading Placement</h2>
        <p className="mt-2 text-slate-600">{fetchError.message || "Could not load placement data."}</p>
        <Link to="/placements">
          <Button variant="outline" className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Placements
          </Button>
        </Link>
      </div>
    );
  }
  
  if (!placementData && !isLoadingPlacement) {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <AlertTriangle className="h-16 w-16 text-yellow-500" />
        <h2 className="mt-4 text-2xl font-semibold text-yellow-700">Placement Not Found</h2>
        <Link to="/placements">
          <Button variant="outline" className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Placements
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Placement</CardTitle>
          <CardDescription>Update the details for the placement opportunity.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placement Title</FormLabel>
                    <FormControl><Input placeholder="e.g., Software Engineer Intern" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Google" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company.description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="Brief description of the company" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company.website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Website (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., https://careers.google.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobDesignation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Designation</FormLabel>
                    <FormControl><Input placeholder="e.g., SDE 1, Analyst" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eligibleBranches"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eligible Branches (Comma-separated)</FormLabel>
                    <FormControl><Input placeholder="e.g., CSE, ECE, IT" {...field} /></FormControl>
                    <FormDescription>Enter branch codes separated by commas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ctcDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CTC Details</FormLabel>
                    <FormControl><Input placeholder="e.g., 12 LPA + Benefits" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="applicationDeadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Application Deadline (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          // disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } // Allow past dates for editing if needed
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="Detailed job responsibilities and requirements" {...field} rows={5} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="selectionProcess"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selection Process (Optional, Comma-separated)</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Online Test, Technical Interview, HR Interview" {...field} rows={3} /></FormControl>
                    <FormDescription>Describe the stages of the selection process.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additionalDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="Any other relevant information" {...field} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="driveType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drive Type (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} /* Use value prop for controlled component */>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select drive type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="On-Campus">On-Campus</SelectItem>
                        <SelectItem value="Off-Campus">Off-Campus</SelectItem>
                        <SelectItem value="Pool-Campus">Pool-Campus</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Location (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., Bangalore, Remote" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="registrationLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Link (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., https://forms.gle/xyz" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value} /* Use value prop for controlled component */ >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Upcoming">Upcoming</SelectItem>
                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => navigate(id ? `/placements/${id}` : '/placements')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending} className="md:w-auto">
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditPlacementPage;
