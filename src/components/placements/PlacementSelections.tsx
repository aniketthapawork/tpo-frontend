
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSelectionsByPlacementId, SelectionRecord, SelectedStudent, SelectionData, addSelection, updateSelection, deleteSelection } from '@/api/selectionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from "@/components/ui/dialog";
import { Loader2, AlertTriangle, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import SelectionListItem from './SelectionListItem';
import AddSelectionDialog from './AddSelectionDialog';
import EditSelectionDialog from './EditSelectionDialog';
import { SelectionFormData, SelectedStudentInput } from './selectionSchemas';

interface PlacementSelectionsProps {
  placementId: string;
}

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

  const addMutation = useMutation({
    mutationFn: (data: SelectionData) => addSelection(placementId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selections', placementId] });
      toast({ title: "Success", description: "Selection added successfully." });
      setShowAddDialog(false);
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
        ...(s._id && { _id: s._id }), 
    }));
    
    if (validStudents.length === 0 && students.length > 0 && students.some(s => s.name || s.rollno || s.branch)) {
        toast({ title: "Validation Error", description: "Please ensure all selected students have a name, roll number, and branch.", variant: "destructive"});
        throw new Error("Invalid student data");
    }
    return validStudents as SelectedStudent[];
  };

  const handleAddSubmit = (data: SelectionFormData) => {
    try {
      const processedStudents = processStudentData(data.selectedStudents);
       if (processedStudents.length === 0 && data.selectedStudents.length > 0) { 
        if (data.selectedStudents.some(s => s.name || s.rollno || s.branch)) {
          // This case should be caught by Zod for individual fields or processStudentData's first throw.
        } else { 
            return; 
        }
      } else if (processedStudents.length === 0) { 
        return;
      }

      const selectionData: SelectionData = {
        selectedStudents: processedStudents,
        nextSteps: data.nextSteps ? data.nextSteps.split('\n').map(s => s.trim()).filter(s => s) : [],
        documentLink: data.documentLink || undefined,
        additionalNotes: data.additionalNotes ? data.additionalNotes.split('\n').map(s => s.trim()).filter(s => s) : [],
      };
      addMutation.mutate(selectionData);
    } catch (e) {
      console.error("Submission error in handleAddSubmit:", e);
    }
  };

  const handleEditSubmit = (data: SelectionFormData) => {
    if (!editingSelection) return;
    try {
      const processedStudents = processStudentData(data.selectedStudents);
       if (processedStudents.length === 0 && data.selectedStudents.length > 0) {
           if (data.selectedStudents.some(s => s.name || s.rollno || s.branch)) {
               // already handled by processStudentData or Zod
           } else {
               return;
           }
       } else if (processedStudents.length === 0) {
           return;
       }

      const selectionData: Partial<SelectionData> = {
        selectedStudents: processedStudents,
        nextSteps: data.nextSteps ? data.nextSteps.split('\n').map(s => s.trim()).filter(s => s) : [],
        documentLink: data.documentLink || undefined,
        additionalNotes: data.additionalNotes ? data.additionalNotes.split('\n').map(s => s.trim()).filter(s => s) : [],
      };
      updateMutation.mutate({ id: editingSelection._id, data: selectionData });
    } catch (e) {
      console.error("Submission error in handleEditSubmit:", e);
    }
  };
  
  const handleDelete = (selectionId: string) => {
    setCurrentDeletingId(selectionId);
    deleteMutation.mutate(selectionId);
  };

  const handleEdit = (selection: SelectionRecord) => {
    setEditingSelection(selection);
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
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Selection List
            </Button>
          </DialogTrigger>
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

        <AddSelectionDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSubmit={handleAddSubmit}
          isSubmitting={addMutation.isPending}
        />
        
        <EditSelectionDialog
          selectionRecordToEdit={editingSelection}
          onOpenChange={(isOpen) => { if(!isOpen) setEditingSelection(null); }}
          onSubmit={handleEditSubmit}
          isSubmitting={updateMutation.isPending}
        />
      </CardContent>
    </Card>
  );
};

export default PlacementSelections;
