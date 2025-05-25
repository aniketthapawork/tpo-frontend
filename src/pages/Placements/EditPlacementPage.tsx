import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod'; // Import Zod
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { addPlacementSchema } from '@/components/placements/addPlacementSchema.js'; // JS import
import { PlacementFormValues, EditPlacementPayload } from '@/types/placementTypes'; // Import new types
import { getPlacementById, updatePlacement } from '@/api/placementService';
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
  const { id } = useParams<{ id: string }>(); // Ensure id type if using TS 4.x+
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<PlacementFormValues>({
    resolver: zodResolver(addPlacementSchema),
    defaultValues: {
      title: '',
      batches: '',
      company: { name: '', description: '', website: '' },
      jobDesignation: '',
      jobDescriptionLink: '',
      eligibleBranches: '',
      eligibilityCriteria: { activeBacklogs: '', deadBacklogs: '', otherEligibilities: '' },
      ctcDetails: '',
      location: '',
      modeOfRecruitment: '',
      tentativeDriveDate: undefined, // Explicitly undefined for optional dates
      applicationDeadline: undefined, // Explicitly undefined for optional dates
      selectionProcess: '',
      registrationLink: '',
      notes: '',
      additionalDetails: '',
      status: 'Upcoming',
    },
  });

  const { data: placementData, isLoading: isLoadingPlacement, error: fetchError } = useQuery({
    queryKey: ['placement', id],
    queryFn: () => {
      if (!id) throw new Error("Placement ID is required.");
      return getPlacementById(id);
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (placementData?.placement) {
      const placement = placementData.placement;
      // Ensure data from API is correctly mapped to form values
      const defaultValues: Partial<PlacementFormValues> = {
        title: placement.title,
        batches: placement.batches ? placement.batches.join(', ') : '',
        company: {
          name: placement.company.name,
          description: placement.company.description || '',
          website: placement.company.website || '',
        },
        jobDesignation: placement.jobDesignation,
        jobDescriptionLink: placement.jobDescriptionLink || '',
        eligibleBranches: placement.eligibleBranches.join(', '),
        eligibilityCriteria: {
          activeBacklogs: placement.eligibilityCriteria?.activeBacklogs || '',
          deadBacklogs: placement.eligibilityCriteria?.deadBacklogs || '',
          otherEligibilities: placement.eligibilityCriteria?.otherEligibilities?.join(', ') || '',
        },
        ctcDetails: placement.ctcDetails,
        location: placement.location || '',
        modeOfRecruitment: placement.modeOfRecruitment || '',
        tentativeDriveDate: placement.tentativeDriveDate ? new Date(placement.tentativeDriveDate) : undefined,
        applicationDeadline: placement.applicationDeadline ? new Date(placement.applicationDeadline) : undefined,
        selectionProcess: placement.driveRounds ? placement.driveRounds.join(', ') : (placement.selectionProcess ? (Array.isArray(placement.selectionProcess) ? placement.selectionProcess.join(', ') : placement.selectionProcess) : ''),
        registrationLink: placement.applyLink || placement.registrationLink || '',
        notes: placement.notes ? (Array.isArray(placement.notes) ? placement.notes.join('\n') : placement.notes) : '',
        additionalDetails: (placement as any).additionalDetails || '',
        status: (placement as any).status || 'Upcoming',
      };
      form.reset(defaultValues as PlacementFormValues); // Cast if confident about structure
    }
  }, [placementData, form]);

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

  const onSubmit = (data: PlacementFormValues) => { // Parameter is now PlacementFormValues
    const payload: EditPlacementPayload = {
      ...data,
      company: data.company || { name: '' }, // Ensure company is not undefined
      batches: data.batches.split(',').map(s => s.trim()).filter(s => s),
      eligibleBranches: data.eligibleBranches.split(',').map(s => s.trim()).filter(s => s),
      selectionProcess: data.selectionProcess ? data.selectionProcess.split(',').map(s => s.trim()).filter(s => s) : undefined,
      notes: data.notes ? data.notes.split('\n').map(s => s.trim()).filter(s => s) : undefined,
      eligibilityCriteria: data.eligibilityCriteria ? {
        activeBacklogs: data.eligibilityCriteria.activeBacklogs || undefined,
        deadBacklogs: data.eligibilityCriteria.deadBacklogs || undefined,
        otherEligibilities: data.eligibilityCriteria.otherEligibilities
          ? data.eligibilityCriteria.otherEligibilities.split(',').map(s => s.trim()).filter(s => s)
          : undefined,
      } : undefined,
      // Dates (tentativeDriveDate, applicationDeadline) are passed as Date objects from form
      // and are part of '...data' spread if they exist on PlacementFormValues.
      // The EditPlacementPayload type expects them as Date | undefined.
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
        <p className="mt-2 text-slate-600">{(fetchError as Error).message || "Could not load placement data."}</p>
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
                name="batches"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batches (Comma-separated)</FormLabel>
                    <FormControl><Input placeholder="e.g., 2025, 2026" {...field} /></FormControl>
                    <FormDescription>Enter batch years separated by commas.</FormDescription>
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
                    <FormControl><Textarea placeholder="Brief description of the company" {...field} value={field.value || ''} /></FormControl>
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
                    <FormControl><Input placeholder="e.g., https://careers.google.com" {...field} value={field.value || ''} /></FormControl>
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
                name="jobDescriptionLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description Link (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., https://company.com/job-description" {...field} value={field.value || ''} /></FormControl>
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

              <Card className="p-4 space-y-4">
                <CardTitle className="text-lg">Eligibility Criteria (Optional)</CardTitle>
                <FormField
                  control={form.control}
                  name="eligibilityCriteria.activeBacklogs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Active Backlogs</FormLabel>
                      <FormControl><Input placeholder="e.g., None, Max 1" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eligibilityCriteria.deadBacklogs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dead Backlogs</FormLabel>
                      <FormControl><Input placeholder="e.g., None, Max 2" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eligibilityCriteria.otherEligibilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Eligibilities (Comma-separated)</FormLabel>
                      <FormControl><Textarea placeholder="e.g., CGPA > 7.0, No academic gaps" {...field} value={field.value || ''} rows={2} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., Bangalore, Remote" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="modeOfRecruitment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode of Recruitment (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., Online, On-Campus, Off-Campus" {...field} value={field.value || ''} /></FormControl>
                    <FormDescription>Specify how the recruitment will be conducted.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tentativeDriveDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tentative Drive Date (Optional)</FormLabel>
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
                              format(field.value, "PPP") // Use field.value directly
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
                          selected={field.value} // Use field.value directly
                          onSelect={field.onChange}
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
                              format(field.value, "PPP") // Use field.value directly
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
                          selected={field.value} // Use field.value directly
                          onSelect={field.onChange}
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
                name="selectionProcess"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selection Process (Optional, Comma-separated rounds)</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Online Test, Technical Interview, HR Interview" {...field} value={field.value || ''} rows={3} /></FormControl>
                    <FormDescription>Describe the stages/rounds of the selection process.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registrationLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration/Apply Link (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., https://forms.gle/xyz" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional, each note on a new line)</FormLabel>
                    <FormControl><Textarea placeholder="Important notes or reminders" {...field} value={field.value || ''} rows={3} /></FormControl>
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
                    <FormControl><Textarea placeholder="Any other relevant information" {...field} value={field.value || ''} rows={3} /></FormControl>
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
                     <Select onValueChange={field.onChange} value={field.value} >
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
                <Button type="submit" disabled={mutation.isPending || form.formState.isSubmitting} className="md:w-auto">
                  {(mutation.isPending || form.formState.isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
