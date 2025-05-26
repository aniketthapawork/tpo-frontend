import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Remove SelectionRecord, SelectedStudent, SelectionData from this import
import { getSelectionsByPlacementId, addSelection, updateSelection, deleteSelection } from '@/api/selectionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import SelectionListItem from './SelectionListItem';
import AddSelectionDialog from './AddSelectionDialog'; // Will resolve to .jsx
import EditSelectionDialog from './EditSelectionDialog'; // Will resolve to .jsx
// The schema imports below are fine as they are likely Zod schemas (runtime values)
import { selectionSchema }
// Commenting out unused SelectionFormData, SelectedStudentInput, if they are only types and not used as values.
// If they are Zod objects, they can remain. Given the error is about selectionService.ts types, these might be okay or similarly problematic if they are TS types from a .js file.
// For now, focusing on the direct error.
from './selectionSchemas'; // Schema definitions would be in .js

const PlacementSelections = ({ placementId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSelection, setEditingSelection] = useState(null);
  const [currentDeletingId, setCurrentDeletingId] = useState(null);

  const { data: selections, isLoading, error, refetch } = useQuery({
    queryKey: ['selections', placementId],
    queryFn: () => getSelectionsByPlacementId(placementId),
    enabled: !!placementId && placementId !== ":id", // Ensure query runs only with valid placementId
  });

  const addMutation = useMutation({
    mutationFn: (data) => addSelection(placementId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selections', placementId] });
      toast({ title: "Success", description: "Selection added successfully." });
      setShowAddDialog(false);
    },
    onError: (err) => {
      console.error("Add Selection API Error:", err.response?.data || err.message || err);
      toast({ title: "Error Adding Selection", description: err.response?.data?.message || "Failed to add selection. Check console for details.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSelection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selections', placementId] });
      toast({ title: "Success", description: "Selection updated successfully." });
      setEditingSelection(null);
    },
    onError: (err) => {
      console.error("Update Selection API Error:", err.response?.data || err.message || err);
      toast({ title: "Error Updating Selection", description: err.response?.data?.message || "Failed to update selection. Check console for details.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSelection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selections', placementId] });
      toast({ title: "Success", description: "Selection deleted successfully." });
      setCurrentDeletingId(null);
    },
    onError: (err) => {
      console.error("Delete Selection API Error:", err.response?.data || err.message || err);
      toast({ title: "Error Deleting Selection", description: err.response?.data?.message || "Failed to delete selection. Check console for details.", variant: "destructive" });
      setCurrentDeletingId(null);
    },
  });
  
  const processStudentData = (students) => {
    // Filter out students that don't have all required fields, ensuring cleaner data for the backend.
    // Zod validation should ideally catch this, but this is an extra safeguard.
    const validStudents = students
      .filter(s => s.name && s.rollno && s.branch) 
      .map(s => ({
        name: s.name,
        rollno: s.rollno,
        branch: s.branch,
        ...(s._id && { _id: s._id }), // Include _id if it exists (for updates)
    }));
    
    // This condition checks if there were input students, some were partially filled, but none were fully valid.
    if (validStudents.length === 0 && students.length > 0 && students.some(s => s.name || s.rollno || s.branch)) {
        toast({ title: "Validation Error", description: "Please ensure all selected students have a name, roll number, and branch.", variant: "destructive"});
        // Throwing an error here will be caught by the handleSubmit's try/catch block.
        throw new Error("Invalid student data: Incomplete student entries found.");
    }
    return validStudents;
  };

  const handleAddSubmit = (data) => {
    console.log("Attempting to add selection with data:", data);
    try {
      const processedStudents = processStudentData(data.selectedStudents);
      // Zod schema (min(1) for selectedStudents) should prevent submission if processedStudents is empty
      // and the form was submitted with no students. This check is more for logical integrity.
      if (processedStudents.length === 0 && !data.nextSteps && !data.documentLink && !data.additionalNotes) {
          toast({ title: "Info", description: "Cannot add an empty selection list. Please add students or other details.", variant: "default" });
          return;
      }

      const selectionData = {
        selectedStudents: processedStudents,
        nextSteps: data.nextSteps ? data.nextSteps.split('\n').map(s => s.trim()).filter(s => s) : [],
        documentLink: data.documentLink || undefined,
        additionalNotes: data.additionalNotes ? data.additionalNotes.split('\n').map(s => s.trim()).filter(s => s) : [],
      };
      console.log("Submitting selection data to API:", selectionData);
      addMutation.mutate(selectionData);
    } catch (e) {
      // This catch is for errors thrown by processStudentData primarily.
      console.error("Error processing selection data for add:", e.message);
      // Toast for this specific error is already handled in processStudentData,
      // but you could add a generic one here if needed.
    }
  };

  const handleEditSubmit = (data) => {
    if (!editingSelection) {
      console.error("handleEditSubmit called without an editingSelection.");
      toast({title: "Error", description: "No selection record found to edit.", variant: "destructive"});
      return;
    }
    console.log("Attempting to edit selection with data:", data, "for ID:", editingSelection._id);
    try {
      const processedStudents = processStudentData(data.selectedStudents);
      if (processedStudents.length === 0 && !data.nextSteps && !data.documentLink && !data.additionalNotes) {
          toast({ title: "Info", description: "Cannot save an empty selection list. Please add students or other details.", variant: "default" });
          return;
      }

      const selectionData = {
        selectedStudents: processedStudents,
        nextSteps: data.nextSteps ? data.nextSteps.split('\n').map(s => s.trim()).filter(s => s) : [],
        documentLink: data.documentLink || undefined,
        additionalNotes: data.additionalNotes ? data.additionalNotes.split('\n').map(s => s.trim()).filter(s => s) : [],
      };
      console.log("Submitting updated selection data to API:", selectionData);
      updateMutation.mutate({ id: editingSelection._id, data: selectionData });
    } catch (e) {
      console.error("Error processing selection data for edit:", e.message);
    }
  };
  
  const handleDelete = (selectionId) => {
    console.log("Attempting to delete selection with ID:", selectionId);
    setCurrentDeletingId(selectionId);
    deleteMutation.mutate(selectionId);
  };

  const handleEdit = (selection) => {
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
    console.error("Error fetching selections:", error);
    return (
      <div className="flex flex-col items-center justify-center p-4 text-red-600">
        <AlertTriangle className="mr-2 h-6 w-6" />
        <span>Error loading final selections: {error.message}. Check console.</span>
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
          <Button size="sm" onClick={() => setShowAddDialog(true)} disabled={addMutation.isPending || updateMutation.isPending}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Selection List
          </Button>
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
              isDeleting={deleteMutation.isPending && currentDeletingId === selectionRecord._id}
              currentDeletingId={currentDeletingId} // Though isDeleting should be specific
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
