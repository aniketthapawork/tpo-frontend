
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { addPlacementSchema } from '@/components/placements/addPlacementSchema.js'; // Adj
import { addPlacement } from '@/api/placementService';
import { Button } from '@/components/ui/button.jsx'; // Adj
import { Input } from '@/components/ui/input.jsx'; // Adj
import { Textarea } from '@/components/ui/textarea.jsx'; // Adj
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.jsx'; // Adj
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx'; // Adj
import { toast } from '@/hooks/use-toast.js'; // Adj
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.jsx'; // Adj
import { Calendar } from '@/components/ui/calendar.jsx'; // Adj
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'; // Adj
import { cn } from '@/lib/utils.js'; // Adj
import { format } from 'date-fns';

// Removed AddPlacementFormData, NewPlacementPayload types

const AddPlacementPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({
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
      driveRounds: '',
      applyLink: '',
      selectionProcess: '',
      registrationLink: '',
      notes: '',
      additionalDetails: '',
      status: 'Upcoming',
      // applicationDeadline and tentativeDriveDate are optional and will be undefined by default
    },
  });

  const mutation = useMutation({
    mutationFn: addPlacement,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Placement added successfully!' });
      queryClient.invalidateQueries({ queryKey: ['placements'] });
      navigate('/placements');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add placement.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data) => {
    // Transform data for payload, similar to before but without explicit types
    const payload = {
      ...data,
      batches: data.batches.split(',').map(s => s.trim()).filter(s => s),
      eligibleBranches: data.eligibleBranches.split(',').map(s => s.trim()).filter(s => s),
      driveRounds: data.driveRounds ? data.driveRounds.split(',').map(s => s.trim()).filter(s => s) : undefined,
      selectionProcess: data.selectionProcess ? data.selectionProcess.split(',').map(s => s.trim()).filter(s => s) : undefined,
      notes: data.notes ? data.notes.split('\n').map(s => s.trim()).filter(s => s) : undefined,
      eligibilityCriteria: data.eligibilityCriteria ? {
        ...data.eligibilityCriteria,
        otherEligibilities: data.eligibilityCriteria.otherEligibilities
          ? data.eligibilityCriteria.otherEligibilities.split(',').map(s => s.trim()).filter(s => s)
          : undefined,
      } : undefined,
    };
    console.log("Submitting payload:", payload);
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
              {/* Placement Title */}
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

              {/* Batches */}
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
              
              {/* Company Details */}
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

              {/* Job Designation */}
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

              {/* Job Description Link */}
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

              {/* Eligible Branches */}
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
              
              {/* Eligibility Criteria Card */}
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

              {/* CTC Details */}
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

              {/* Location */}
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

              {/* Mode of Recruitment */}
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
              
              {/* Tentative Drive Date */}
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
                              format(new Date(field.value), "PPP") // Ensure field.value is a Date object if not already
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
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Drive Rounds */}
              <FormField
                control={form.control}
                name="driveRounds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drive Rounds (Optional, Comma-separated)</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Aptitude Test, Technical Interview, HR Interview" {...field} rows={3} /></FormControl>
                    <FormDescription>Describe the stages/rounds of the drive.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Apply Link */}
               <FormField
                control={form.control}
                name="applyLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apply Link (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., https://company.com/apply" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Application Deadline */}
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
                              format(new Date(field.value), "PPP") // Ensure field.value is a Date object if not already
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
                          selected={field.value ? new Date(field.value) : undefined}
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

              {/* Selection Process (Legacy - might be replaced by driveRounds or be more descriptive) */}
              <FormField
                control={form.control}
                name="selectionProcess"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Selection Process Description (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Initial screening followed by multiple technical and HR rounds." {...field} rows={3} /></FormControl>
                    <FormDescription>General description of the selection flow.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Registration Link (Legacy - consider if applyLink covers this) */}
              <FormField
                control={form.control}
                name="registrationLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Registration Link (Optional, if different from Apply Link)</FormLabel>
                    <FormControl><Input placeholder="e.g., https://forms.gle/xyz" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Notes */}
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
              
              {/* Additional Details */}
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

              {/* Status */}
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

              <Button type="submit" disabled={mutation.isPending || mutation.isLoading} className="w-full md:w-auto">
                {(mutation.isPending || mutation.isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

