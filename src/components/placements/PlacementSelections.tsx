import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSelectionsByPlacementId, SelectionRecord, SelectedStudent, SelectionData, addSelection, updateSelection, deleteSelection } from '@/api/selectionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Award, PlusCircle, Edit, Trash2, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/hooks/use-toast';

interface PlacementSelectionsProps {
  placementId: string;
}

const selectedStudentSchema = z.object({
  _id: z.string().optional(), // Added to match SelectedStudent interface and preserve during edits
  name: z.string().min(1, "Name is required"),
  rollno: z.string().min(1, "Roll number is required"),
  branch: z.string().min(1, "Branch is required"),
});

const selectionSchema = z.object({
  selectedStudents: z.array(selectedStudentSchema).min(1, "At least one student must be selected"),
  nextSteps: z.string().optional(),
  documentLink: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  additionalNotes: z.string().optional(),
});

type SelectionFormData = z.infer<typeof selectionSchema>;

const PlacementSelections: React.FC<PlacementSelectionsProps> = ({ placementId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSelection, setEditingSelection] = useState<SelectionRecord | null>(null);

  const { data: selections, isLoading, error, refetch } = useQuery<SelectionRecord[], Error>({
    queryKey: ['selections', placementId],
    queryFn: () => getSelectionsByPlacementId(placementId),
  });

  const addSelectionForm = useForm<SelectionFormData>({
    resolver: zodResolver(selectionSchema),
    defaultValues: {
      selectedStudents: [{ name: '', rollno: '', branch: '' }], // _id will be undefined
      nextSteps: '',
      documentLink: '',
      additionalNotes: '',
    },
  });

  const editSelectionForm = useForm<SelectionFormData>({
    resolver: zodResolver(selectionSchema),
  });

  const { fields: addFields, append: addAppend, remove: addRemove } = useFieldArray({
    control: addSelectionForm.control,
    name: "selectedStudents",
  });

  const { fields: editFields, append: editAppend, remove: editRemove } = useFieldArray({
    control: editSelectionForm.control,
    name: "selectedStudents",
  });

  const addMutation = useMutation({
    mutationFn: (data: SelectionData) => addSelection(placementId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selections', placementId] });
      toast({ title: "Success", description: "Selection added successfully." });
      setShowAddDialog(false);
      addSelectionForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to add selection.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SelectionData> }) => updateSelection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selections', placementId] });
      toast({ title: "Success", description: "Selection updated successfully." });
      setEditingSelection(null);
      editSelectionForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to update selection.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSelection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selections', placementId] });
      toast({ title: "Success", description: "Selection deleted successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to delete selection.", variant: "destructive" });
    },
  });

  const handleAddSubmit = (data: SelectionFormData) => {
    const selectionData: SelectionData = {
      selectedStudents: data.selectedStudents.map(s => ({ name: s.name, rollno: s.rollno, branch: s.branch })), // Explicitly map to ensure type, _id is omitted for new students
      nextSteps: data.nextSteps ? data.nextSteps.split('\n').map(s => s.trim()).filter(s => s) : [],
      documentLink: data.documentLink || undefined,
      additionalNotes: data.additionalNotes ? data.additionalNotes.split('\n').map(s => s.trim()).filter(s => s) : [],
    };
    addMutation.mutate(selectionData);
  };

  const handleEditSubmit = (data: SelectionFormData) => {
    if (!editingSelection) return;
    const selectionData: Partial<SelectionData> = {
      selectedStudents: data.selectedStudents, // Now data.selectedStudents matches SelectedStudent[] due to schema update
      nextSteps: data.nextSteps ? data.nextSteps.split('\n').map(s => s.trim()).filter(s => s) : [],
      documentLink: data.documentLink || undefined,
      additionalNotes: data.additionalNotes ? data.additionalNotes.split('\n').map(s => s.trim()).filter(s => s) : [],
    };
    updateMutation.mutate({ id: editingSelection._id, data: selectionData });
  };

  const handleEdit = (selection: SelectionRecord) => {
    setEditingSelection(selection);
    editSelectionForm.reset({
      selectedStudents: selection.selectedStudents.map(s => ({ // Ensure _id is carried over if present
        _id: s._id,
        name: s.name,
        rollno: s.rollno,
        branch: s.branch,
      })),
      nextSteps: selection.nextSteps?.join('\n') || '',
      documentLink: selection.documentLink || '',
      additionalNotes: selection.additionalNotes?.join('\n') || '',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <span>Loading final selections...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-red-600">
        <AlertTriangle className="mr-2 h-6 w-6" />
        <span>Error loading final selections: {error.message}</span>
        <Button onClick={() => refetch()} variant="outline" className="mt-2">Retry</Button>
      </div>
    );
  }

  const selectionData = selections?.[0]; // Assuming only one selection record per placement

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-xl">Final Selections</CardTitle>
          <CardDescription>Students selected for this placement opportunity.</CardDescription>
        </div>
        {user?.role === 'admin' && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              {/* Disable Add button if selectionData already exists, as we assume one selection record per placement */}
              <Button size="sm" disabled={!!selectionData}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Selection
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Final Selection</DialogTitle>
                <DialogDescription>Add the final selected students for this placement.</DialogDescription>
              </DialogHeader>
              <Form {...addSelectionForm}>
                <form onSubmit={addSelectionForm.handleSubmit(handleAddSubmit)} className="space-y-4">
                  <div>
                    <FormLabel>Selected Students</FormLabel>
                    {addFields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-10 gap-2 mt-2 items-center">
                        <div className="col-span-3">
                          <FormField
                            control={addSelectionForm.control}
                            name={`selectedStudents.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-3">
                          <FormField
                            control={addSelectionForm.control}
                            name={`selectedStudents.${index}.rollno`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Roll No" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-3">
                          <FormField
                            control={addSelectionForm.control}
                            name={`selectedStudents.${index}.branch`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Branch" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => addRemove(index)}
                            disabled={addFields.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addAppend({ name: '', rollno: '', branch: '' })} // _id will be undefined
                      className="mt-2"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Student
                    </Button>
                  </div>
                  <FormField
                    control={addSelectionForm.control}
                    name="nextSteps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next Steps (Optional, one per line)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe next steps..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addSelectionForm.control}
                    name="documentLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Link (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Document URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addSelectionForm.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional, one per line)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any additional information..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={addMutation.isPending}>
                      {addMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add Selection
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {selectionData ? (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold mb-2 text-lg flex items-center">
                <Award className="mr-2 h-5 w-5 text-green-600" /> Selected Students
              </h3>
              {user?.role === 'admin' && (
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(selectionData)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selection</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this selection record? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(selectionData._id)} disabled={deleteMutation.isPending}>
                           {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
            
            {selectionData.selectedStudents && selectionData.selectedStudents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Branch</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectionData.selectedStudents.map((student, index) => (
                    <TableRow key={student._id || index}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.rollno}</TableCell>
                      <TableCell>{student.branch}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No students listed in this selection record.</p>
            )}

            {selectionData.nextSteps && selectionData.nextSteps.length > 0 && (
              <div>
                <h4 className="font-semibold">Next Steps:</h4>
                <ul className="list-disc list-inside pl-4 text-slate-700 dark:text-slate-300">
                  {selectionData.nextSteps.map((step, index) => <li key={index}>{step}</li>)}
                </ul>
              </div>
            )}

            {selectionData.documentLink && (
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <a href={selectionData.documentLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all dark:text-blue-400">
                  Relevant Document
                </a>
              </div>
            )}

            {selectionData.additionalNotes && selectionData.additionalNotes.length > 0 && (
              <div>
                <h4 className="font-semibold">Additional Notes:</h4>
                <ul className="list-disc list-inside pl-4 text-slate-700 dark:text-slate-300">
                  {selectionData.additionalNotes.map((note, index) => <li key={index}>{note}</li>)}
                </ul>
              </div>
            )}
             {(!selectionData.nextSteps || selectionData.nextSteps.length === 0) && !selectionData.documentLink && (!selectionData.additionalNotes || selectionData.additionalNotes.length === 0) && (
                selectionData.selectedStudents && selectionData.selectedStudents.length > 0 && /* Show this only if students are listed but no other info */
                <p className="text-slate-500 dark:text-slate-400 italic mt-2">No further details provided for this selection.</p>
             )}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">No final selection data available yet.</p>
        )}

        {/* Edit Selection Dialog */}
        <Dialog open={!!editingSelection} onOpenChange={(isOpen) => { if(!isOpen) setEditingSelection(null); }}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Selection</DialogTitle>
              <DialogDescription>Update the selection details.</DialogDescription>
            </DialogHeader>
            <Form {...editSelectionForm}>
              <form onSubmit={editSelectionForm.handleSubmit(handleEditSubmit)} className="space-y-4">
                <div>
                  <FormLabel>Selected Students</FormLabel>
                  {editFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-10 gap-2 mt-2 items-center">
                       <div className="col-span-3">
                        <FormField
                          control={editSelectionForm.control}
                          name={`selectedStudents.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-3">
                        <FormField
                          control={editSelectionForm.control}
                          name={`selectedStudents.${index}.rollno`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Roll No" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-3">
                        <FormField
                          control={editSelectionForm.control}
                          name={`selectedStudents.${index}.branch`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Branch" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => editRemove(index)}
                          disabled={editFields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => editAppend({ name: '', rollno: '', branch: '' })} // _id will be undefined
                    className="mt-2"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Student
                  </Button>
                </div>
                <FormField
                  control={editSelectionForm.control}
                  name="nextSteps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Steps (Optional, one per line)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe next steps..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editSelectionForm.control}
                  name="documentLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Link (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Document URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editSelectionForm.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional, one per line)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any additional information..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={() => setEditingSelection(null)}>Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Selection
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PlacementSelections;
