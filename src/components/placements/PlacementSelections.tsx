
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSelectionsByPlacementId, SelectionRecord, SelectedStudent, SelectionData } from '@/api/selectionService'; // addSelection, updateSelection, deleteSelection removed as they are only used by mutations
import { addSelection, updateSelection, deleteSelection } from '@/api/selectionService'; // Re-added for mutations
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, PlusCircle } from 'lucide-react'; // Award, Edit, Trash2, FileText removed as they are in SelectionListItem
import { useAuth } from '@/contexts/AuthContext';
// import { Badge } from '@/components/ui/badge'; // Badge was unused
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Table components moved to SelectionListItem
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
// AlertDialog components moved to SelectionListItem
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form"; // FormControl, FormField, FormItem, FormLabel, FormMessage moved to SelectionFormFields
// import { Input } from "@/components/ui/input"; // Moved to SelectionFormFields
// import { Textarea } from "@/components/ui/textarea"; // Moved to SelectionFormFields
import { toast } from '@/hooks/use-toast';
import SelectionListItem from './SelectionListItem';
import SelectionFormFields from './SelectionFormFields';


interface PlacementSelectionsProps {
  placementId: string;
}

// Schemas remain here as they define the form structure and are used by useForm
const selectedStudentSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  rollno: z.string().min(1, "Roll number is required"),
  branch: z.string().min(1, "Branch is required"),
});

const selectionSchema = z.object({
  selectedStudents: z.array(selectedStudentSchema).min(1, "At least one student must be selected with complete details."),
  nextSteps: z.string().optional(),
  documentLink: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  additionalNotes: z.string().optional(),
});

type SelectionFormData = z.infer<typeof selectionSchema>;
// Type for student appended to form, matches selectedStudentSchema
type SelectedStudentInput = z.infer<typeof selectedStudentSchema>;


const PlacementSelections: React.FC<PlacementSelectionsProps> = ({ placementId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSelection, setEditingSelection] = useState<SelectionRecord | null>(null);
  const [currentDeletingId, setCurrentDeletingId] = useState<string | null>(null);


  const { data: selections, isLoading, error, refetch } = useQuery<SelectionRecord[], Error>({
    queryKey: ['selections', placementId],
    queryFn: () => getSelectionsByPlacementId(placementId),
  });

  const addSelectionForm = useForm<SelectionFormData>({
    resolver: zodResolver(selectionSchema),
    defaultValues: {
      selectedStudents: [{ name: '', rollno: '', branch: '' }],
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
      addSelectionForm.reset({
        selectedStudents: [{ name: '', rollno: '', branch: '' }],
        nextSteps: '',
        documentLink: '',
        additionalNotes: '',
      });
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
      setCurrentDeletingId(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to delete selection.", variant: "destructive" });
      setCurrentDeletingId(null);
    },
  });

  const processStudentData = (students: SelectedStudentInput[]): SelectedStudent[] => {
    const validStudents = students.filter(s => s.name && s.rollno && s.branch).map(s => ({
        name: s.name,
        rollno: s.rollno,
        branch: s.branch,
        // _id is passed if it exists (for updates), omitted for new students in add.
        ...(s._id && { _id: s._id }), 
    }));
    
    if (validStudents.length === 0 && students.length > 0 && students.some(s => s.name || s.rollno || s.branch)) {
        toast({ title: "Validation Error", description: "Please ensure all selected students have a name, roll number, and branch.", variant: "destructive"});
        throw new Error("Invalid student data");
    }
    if (validStudents.length === 0) {
        toast({ title: "Validation Error", description: "At least one student must be selected with complete details.", variant: "destructive"});
        throw new Error("No valid students");
    }
    return validStudents as SelectedStudent[];
  };


  const handleAddSubmit = (data: SelectionFormData) => {
    try {
      const processedStudents = processStudentData(data.selectedStudents);
      const selectionData: SelectionData = {
        selectedStudents: processedStudents,
        nextSteps: data.nextSteps ? data.nextSteps.split('\n').map(s => s.trim()).filter(s => s) : [],
        documentLink: data.documentLink || undefined,
        additionalNotes: data.additionalNotes ? data.additionalNotes.split('\n').map(s => s.trim()).filter(s => s) : [],
      };
      addMutation.mutate(selectionData);
    } catch (e) {
      // Toast is handled in processStudentData
      console.error("Submission error:", e);
    }
  };

  const handleEditSubmit = (data: SelectionFormData) => {
    if (!editingSelection) return;
    try {
      const processedStudents = processStudentData(data.selectedStudents);
      const selectionData: Partial<SelectionData> = {
        selectedStudents: processedStudents,
        nextSteps: data.nextSteps ? data.nextSteps.split('\n').map(s => s.trim()).filter(s => s) : [],
        documentLink: data.documentLink || undefined,
        additionalNotes: data.additionalNotes ? data.additionalNotes.split('\n').map(s => s.trim()).filter(s => s) : [],
      };
      updateMutation.mutate({ id: editingSelection._id, data: selectionData });
    } catch (e) {
      // Toast is handled in processStudentData
      console.error("Submission error:", e);
    }
  };
  
  const handleDelete = (selectionId: string) => {
    setCurrentDeletingId(selectionId);
    deleteMutation.mutate(selectionId);
  };

  const handleEdit = (selection: SelectionRecord) => {
    setEditingSelection(selection);
    // Ensure student objects have _id for editing, even if backend sometimes omits it on fetch
    // The form expects _id to be part of the student object if it's an existing student.
    const studentsForForm = selection.selectedStudents.map(s => ({ 
      _id: s._id || undefined, // Ensure _id is explicitly undefined if not present
      name: s.name,
      rollno: s.rollno,
      branch: s.branch,
    }));

    editSelectionForm.reset({
      selectedStudents: studentsForForm,
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

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-xl">Final Selections</CardTitle>
          <CardDescription>Students selected for this placement opportunity. Multiple selection lists can be added.</CardDescription>
        </div>
        {user?.role === 'admin' && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Selection List
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Selection List</DialogTitle>
                <DialogDescription>Add a list of final selected students for this placement.</DialogDescription>
              </DialogHeader>
              <Form {...addSelectionForm}>
                <form onSubmit={addSelectionForm.handleSubmit(handleAddSubmit)} className="space-y-4">
                  <SelectionFormFields
                    formControl={addSelectionForm.control}
                    studentFields={addFields}
                    studentAppend={(value) => addAppend(value as SelectedStudentInput)}
                    studentRemove={addRemove}
                    errors={addSelectionForm.formState.errors}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline" onClick={() => {
                        setShowAddDialog(false);
                        addSelectionForm.reset({ // Reset form on explicit cancel too
                            selectedStudents: [{ name: '', rollno: '', branch: '' }],
                            nextSteps: '',
                            documentLink: '',
                            additionalNotes: '',
                        });
                      }}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={addMutation.isPending}>
                      {addMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add Selection List
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {(selections && selections.length > 0) ? (
          selections.map((selectionRecord, recordIndex) => (
            <SelectionListItem
              key={selectionRecord._id}
              selectionRecord={selectionRecord}
              recordIndex={recordIndex}
              totalRecords={selections.length}
              user={user}
              onEdit={handleEdit}
              onDeletePress={handleDelete}
              isDeleting={deleteMutation.isPending}
              currentDeletingId={currentDeletingId}
            />
          ))
        ) : (
          <p className="text-slate-600 dark:text-slate-400">No final selection data available yet.</p>
        )}

        {/* Edit Selection Dialog */}
        <Dialog open={!!editingSelection} onOpenChange={(isOpen) => { if(!isOpen) { setEditingSelection(null); editSelectionForm.reset(); } }}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Selection List</DialogTitle>
              <DialogDescription>Update the selection list details.</DialogDescription>
            </DialogHeader>
            {editingSelection && ( // Ensure editingSelection is not null before rendering form
              <Form {...editSelectionForm}>
                <form onSubmit={editSelectionForm.handleSubmit(handleEditSubmit)} className="space-y-4">
                  <SelectionFormFields
                    formControl={editSelectionForm.control}
                    studentFields={editFields}
                    studentAppend={(value) => editAppend(value as SelectedStudentInput)}
                    studentRemove={editRemove}
                    errors={editSelectionForm.formState.errors}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                       <Button type="button" variant="outline" onClick={() => { setEditingSelection(null); editSelectionForm.reset();}}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Selection List
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PlacementSelections;
