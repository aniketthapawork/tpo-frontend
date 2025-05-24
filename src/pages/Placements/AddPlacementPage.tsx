
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { addPlacementSchema, AddPlacementFormData, NewPlacementPayload } from '@/components/placements/addPlacementSchema';
import { addPlacement } from '@/api/placementService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const AddPlacementPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<AddPlacementFormData>({
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
      modeOfRecruitment: '', // Default to empty string for text input
      selectionProcess: '',
      registrationLink: '',
      notes: '',
      additionalDetails: '',
      status: 'Upcoming',
      // applicationDeadline and tentativeDriveDate are optional
    },
  });

  const mutation = useMutation({
    mutationFn: addPlacement,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Placement added successfully!' });
      queryClient.invalidateQueries({ queryKey: ['placements'] });
      navigate('/placements');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add placement.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: AddPlacementFormData) => {
    const payload: NewPlacementPayload = {
      ...data,
      batches: data.batches.split(',').map(s => s.trim()).filter(s => s),
      eligibleBranches: data.eligibleBranches.split(',').map(s => s.trim()).filter(s => s),
      selectionProcess: data.selectionProcess ? data.selectionProcess.split(',').map(s => s.trim()).filter(s => s) : undefined,
      notes: data.notes ? data.notes.split('\n').map(s => s.trim()).filter(s => s) : undefined, // Assuming newline separated for notes
      eligibilityCriteria: data.eligibilityCriteria ? {
        ...data.eligibilityCriteria,
        otherEligibilities: data.eligibilityCriteria.otherEligibilities
          ? data.eligibilityCriteria.otherEligibilities.split(',').map(s => s.trim()).filter(s => s)
          : undefined,
      } : undefined,
    };
    mutation.mutate(payload);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Placement</CardTitle>
          <CardDescription>Fill in the details for the new placement opportunity.</CardDescription>
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
                name="jobDescriptionLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description Link (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., https://company.com/job-description" {...field} /></FormControl>
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
                      <FormControl><Input placeholder="e.g., None, Max 1" {...field} /></FormControl>
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
                      <FormControl><Input placeholder="e.g., None, Max 2" {...field} /></FormControl>
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
                      <FormControl><Textarea placeholder="e.g., CGPA > 7.0, No academic gaps" {...field} rows={2} /></FormControl>
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
                    <FormControl><Input placeholder="e.g., Bangalore, Remote" {...field} /></FormControl>
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
                     <FormControl><Input placeholder="e.g., Online, On-Campus, Off-Campus" {...field} /></FormControl>
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
                          disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } 
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
                    <FormControl><Textarea placeholder="e.g., Online Test, Technical Interview, HR Interview" {...field} rows={3} /></FormControl>
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
                    <FormControl><Input placeholder="e.g., https://forms.gle/xyz" {...field} /></FormControl>
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
                    <FormControl><Textarea placeholder="e.g., Update resume\nPrepare for coding round" {...field} rows={3} /></FormControl>
                    <FormDescription>Important notes or reminders for this placement.</FormDescription>
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              <Button type="submit" disabled={mutation.isPending} className="w-full md:w-auto">
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Placement
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddPlacementPage;
