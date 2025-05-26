import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deletePlacement, getPlacementById, addPlacementUpdate, editPlacementUpdate, deletePlacementUpdate } from '@/api/placementService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, AlertTriangle as AlertTriangleIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PlacementInterviews from '@/components/placements/PlacementInterviews';
import PlacementSelections from '@/components/placements/PlacementSelections'; // Will resolve to .jsx

import { addUpdateSchema, editUpdateSchema } from '@/components/placements/detail/updateFormSchemas'; // .js
import AddPlacementUpdateDialog from '@/components/placements/detail/AddPlacementUpdateDialog'; // .jsx
import EditPlacementUpdateDialog from '@/components/placements/detail/EditPlacementUpdateDialog'; // .jsx
import PlacementHeader from '@/components/placements/detail/PlacementHeader'; // .jsx
import PlacementInformationSection from '@/components/placements/detail/PlacementInformationSection'; // .jsx
import PlacementUpdatesSection from '@/components/placements/detail/PlacementUpdatesSection'; // .jsx

const PlacementDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placement, setPlacement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const [showAddUpdateDialog, setShowAddUpdateDialog] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);

  const fetchPlacementDetails = async () => {
    if (!id || id === ":id") { // Added check for ":id"
      const errorMsg = "Placement ID is invalid or not yet available.";
      setError(errorMsg);
      setIsLoading(false);
      toast({ title: "Error", description: "Invalid placement ID in URL.", variant: "destructive" });
      console.error("Attempted to fetch placement details with invalid ID:", id);
      return;
    }
    try {
      setIsLoading(true);
      const data = await getPlacementById(id);
      setPlacement(data.placement); 
      setError(null);
    } catch (err) {
      console.error("Failed to fetch placement details:", err);
      const errorMessage = err.response?.data?.message || "Failed to load placement details.";
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacementDetails();
  }, [id]);

  const addUpdateForm = useForm({
    resolver: zodResolver(addUpdateSchema),
    defaultValues: { updateType: "Info", message: "" },
  });

  const editUpdateForm = useForm({
    resolver: zodResolver(editUpdateSchema),
  });

  const handleAddUpdateSubmit = async (values) => {
    if (!id || id === ":id") {
        toast({ title: "Error", description: "Cannot add update due to invalid Placement ID.", variant: "destructive" });
        return;
    }
    setIsSubmittingUpdate(true);
    try {
      await addPlacementUpdate(id, values);
      toast({ title: "Success", description: "Placement update added successfully." });
      setShowAddUpdateDialog(false);
      addUpdateForm.reset();
      await fetchPlacementDetails(); 
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to add update.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const handleEditUpdateClick = (update) => {
    setEditingUpdate(update);
  };
  
  const handleEditUpdateSubmit = async (values) => {
    if (!id || id === ":id" || !editingUpdate) {
        toast({ title: "Error", description: "Cannot edit update due to invalid Placement or Update ID.", variant: "destructive" });
        return;
    }
    setIsSubmittingUpdate(true);
    try {
      await editPlacementUpdate(id, editingUpdate._id, values);
      toast({ title: "Success", description: "Update edited successfully." });
      setEditingUpdate(null); 
      await fetchPlacementDetails(); 
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to edit update.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const handleDeleteUpdate = async (updateId) => {
    if (!id || id === ":id") {
        toast({ title: "Error", description: "Cannot delete update due to invalid Placement ID.", variant: "destructive" });
        return;
    }
    try {
      await deletePlacementUpdate(id, updateId);
      toast({ title: "Success", description: "Update deleted successfully." });
      await fetchPlacementDetails(); 
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to delete update.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };
  
  const handleDeletePlacement = async () => {
    if (!id || id === ":id") {
        toast({ title: "Error", description: "Cannot delete placement due to invalid Placement ID.", variant: "destructive" });
        return;
    }
    try {
      await deletePlacement(id);
      toast({ title: "Success", description: "Placement deleted successfully." });
      navigate("/placements");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to delete placement.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleNavigateToEditPlacement = () => {
    if (placement && placement._id && placement._id !== ":id") {
      navigate(`/admin/placements/edit/${placement._id}`);
    } else {
      toast({ title: "Error", description: "Cannot navigate to edit page due to invalid Placement ID.", variant: "destructive" });
    }
  };

  if (isLoading && !placement) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <Loader2 className="h-16 w-16 animate-spin text-slate-600" />
        <p className="mt-4 text-2xl text-slate-700 font-semibold">Loading Placement Details...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <AlertTriangleIcon className="h-16 w-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-semibold text-red-700">Error Loading Placement</h2>
        <p className="mt-2 text-slate-600">{error}</p>
        <Link to="/placements">
          <Button className="mt-6 bg-slate-700 hover:bg-slate-800">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Placements
          </Button>
        </Link>
      </div>
    );
  }

  if (!placement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <p className="text-xl text-slate-700">Placement not found.</p>
        <Link to="/placements" className="ml-4">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="container mx-auto">
        <div className="mb-6">
          <Link to="/placements">
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Placements
            </Button>
          </Link>
        </div>

        <AddPlacementUpdateDialog
          open={showAddUpdateDialog}
          onOpenChange={setShowAddUpdateDialog}
          form={addUpdateForm}
          onSubmit={handleAddUpdateSubmit}
          isSubmitting={isSubmittingUpdate}
        />

        <EditPlacementUpdateDialog
          open={!!editingUpdate}
          onOpenChange={(isOpen) => { if (!isOpen) setEditingUpdate(null); }}
          form={editUpdateForm}
          onSubmit={handleEditUpdateSubmit}
          isSubmitting={isSubmittingUpdate}
          editingUpdate={editingUpdate}
        />
        
        <Card className="shadow-lg mb-6">
          <PlacementHeader
            placement={placement}
            user={user}
            onNavigateToEdit={handleNavigateToEditPlacement}
            onDeletePlacement={handleDeletePlacement}
            onTriggerAddUpdateDialog={() => setShowAddUpdateDialog(true)}
          />
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <PlacementInformationSection placement={placement} />
            <PlacementUpdatesSection
              updates={placement.updates || []}
              user={user}
              onEditUpdate={handleEditUpdateClick}
              onDeleteUpdate={handleDeleteUpdate}
            />
          </CardContent>
        </Card>

        {id && id !== ":id" && ( // Added id !== ":id" check here as well
          <>
            <PlacementInterviews placementId={id} />
            <PlacementSelections placementId={id} />
          </>
        )}
        
      </div>
    </div>
  );
};

export default PlacementDetailPage;
