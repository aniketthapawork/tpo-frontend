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
import PlacementSelections from '@/components/placements/PlacementSelections';

import { addUpdateSchema, editUpdateSchema, AddUpdateFormData, EditUpdateFormData } from '@/components/placements/detail/updateFormSchemas';
import AddPlacementUpdateDialog from '@/components/placements/detail/AddPlacementUpdateDialog';
import EditPlacementUpdateDialog from '@/components/placements/detail/EditPlacementUpdateDialog';
import PlacementHeader from '@/components/placements/detail/PlacementHeader';
import PlacementInformationSection from '@/components/placements/detail/PlacementInformationSection';
import PlacementUpdatesSection from '@/components/placements/detail/PlacementUpdatesSection';

const PlacementDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placement, setPlacement] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const [showAddUpdateDialog, setShowAddUpdateDialog] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<any | null>(null);

  const fetchPlacementDetails = async () => {
    if (!id) {
      setError("Placement ID is missing.");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await getPlacementById(id);
      setPlacement(data.placement); 
      setError(null);
    } catch (err: any) {
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

  const addUpdateForm = useForm<AddUpdateFormData>({
    resolver: zodResolver(addUpdateSchema),
    defaultValues: { updateType: "Info", message: "" },
  });

  const editUpdateForm = useForm<EditUpdateFormData>({
    resolver: zodResolver(editUpdateSchema),
  });

  const handleAddUpdateSubmit = async (values: AddUpdateFormData) => {
    if (!id) return;
    setIsSubmittingUpdate(true);
    try {
      await addPlacementUpdate(id, values);
      toast({ title: "Success", description: "Placement update added successfully." });
      setShowAddUpdateDialog(false);
      addUpdateForm.reset();
      await fetchPlacementDetails(); 
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to add update.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const handleEditUpdateClick = (update: any) => {
    setEditingUpdate(update);
  };
  
  const handleEditUpdateSubmit = async (values: EditUpdateFormData) => {
    if (!id || !editingUpdate) return;
    setIsSubmittingUpdate(true);
    try {
      await editPlacementUpdate(id, editingUpdate._id, values);
      toast({ title: "Success", description: "Update edited successfully." });
      setEditingUpdate(null); 
      await fetchPlacementDetails(); 
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to edit update.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!id) return;
    try {
      await deletePlacementUpdate(id, updateId);
      toast({ title: "Success", description: "Update deleted successfully." });
      await fetchPlacementDetails(); 
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to delete update.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };
  
  const handleDeletePlacement = async () => {
    if (!id) return;
    try {
      await deletePlacement(id);
      toast({ title: "Success", description: "Placement deleted successfully." });
      navigate("/placements");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to delete placement.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleNavigateToEditPlacement = () => {
    if (placement) {
      navigate(`/admin/placements/edit/${placement._id}`);
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

        {id && (
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
