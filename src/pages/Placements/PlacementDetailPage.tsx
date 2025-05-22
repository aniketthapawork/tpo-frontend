import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { deletePlacement, getPlacementById, addPlacementUpdate } from '@/api/placementService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Briefcase, Building, CalendarDays, FileText, Users, CircleDollarSign, MapPin, Laptop, CalendarClock, LinkIcon, ExternalLink, AlertTriangle, Info, Edit, Trash2, PlusCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PlacementInterviews from '@/components/placements/PlacementInterviews';
import PlacementSelections from '@/components/placements/PlacementSelections';
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input"; // Not used in this form, but Textarea is
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Company {
  name: string;
  description?: string;
  website?: string;
}

interface EligibilityCriteria {
  activeBacklogs?: string;
  deadBacklogs?: string;
  otherEligibilities?: string[];
}

export interface PlacementUpdate { // Exporting for service
  _id: string;
  updateType: 'Alert' | 'Info' | 'Reminder';
  message: string;
  createdAt: string;
}

export interface PlacementDetails { // Exporting for service
  _id: string;
  title: string;
  batches: string[];
  company: Company;
  jobDesignation: string;
  jobDescriptionLink?: string;
  eligibleBranches: string[];
  eligibilityCriteria: EligibilityCriteria;
  ctcDetails: string;
  location: string;
  modeOfRecruitment: string;
  tentativeDriveDate?: string;
  driveRounds: string[];
  applyLink?: string;
  applicationDeadline?: string;
  notes?: string[];
  updates?: PlacementUpdate[];
  createdAt: string;
}

const addUpdateSchema = z.object({
  updateType: z.enum(["Alert", "Info", "Reminder"], { required_error: "Update type is required." }),
  message: z.string().min(1, "Message cannot be empty.").max(500, "Message is too long."),
});

type AddUpdateFormData = z.infer<typeof addUpdateSchema>;

const PlacementDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placement, setPlacement] = useState<PlacementDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const [showAddUpdateDialog, setShowAddUpdateDialog] = useState(false);

  const fetchPlacementDetails = async () => {
    if (!id) {
      setError("Placement ID is missing.");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true); // Set loading true before fetch
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
    defaultValues: {
      updateType: "Info",
      message: "",
    },
  });

  const handleAddUpdateSubmit = async (values: AddUpdateFormData) => {
    if (!id) return;
    setIsSubmittingUpdate(true);
    try {
      await addPlacementUpdate(id, values);
      toast({ title: "Success", description: "Placement update added successfully." });
      setShowAddUpdateDialog(false);
      addUpdateForm.reset();
      await fetchPlacementDetails(); // Refetch to get the latest updates
    } catch (err: any) {
      console.error("Failed to add placement update:", err);
      const errorMessage = err.response?.data?.message || "Failed to add update.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const handleDeletePlacement = async () => {
    if (!id) return;
    try {
      await deletePlacement(id);
      toast({ title: "Success", description: "Placement deleted successfully." });
      navigate("/placements");
    } catch (err: any) {
      console.error("Failed to delete placement:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete placement.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  if (isLoading && !placement) { // Show initial loading spinner only if no placement data yet
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
        <AlertTriangle className="h-16 w-16 text-red-500" />
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
      </div>
    );
  }
  
  const renderDetail = (IconComponent: React.ElementType, label: string, value?: string | string[] | null, isLink: boolean = false) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    return (
      <div className="flex items-start space-x-3">
        <IconComponent className="h-5 w-5 text-slate-500 mt-1 flex-shrink-0" />
        <div>
          <span className="font-semibold text-slate-700">{label}:</span>{' '}
          {isLink && typeof displayValue === 'string' ? (
            <a href={displayValue} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
              {displayValue} <ExternalLink className="inline h-4 w-4" />
            </a>
          ) : (
            <span className="text-slate-600 break-words">{displayValue}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="container mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/placements">
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Placements
            </Button>
          </Link>
          {user?.role === 'admin' && (
             <Dialog open={showAddUpdateDialog} onOpenChange={setShowAddUpdateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Update
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Update</DialogTitle>
                  <DialogDescription>
                    Provide details for the new placement update.
                  </DialogDescription>
                </DialogHeader>
                <Form {...addUpdateForm}>
                  <form onSubmit={addUpdateForm.handleSubmit(handleAddUpdateSubmit)} className="space-y-4">
                    <FormField
                      control={addUpdateForm.control}
                      name="updateType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Update Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select update type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Info">Info</SelectItem>
                              <SelectItem value="Alert">Alert</SelectItem>
                              <SelectItem value="Reminder">Reminder</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addUpdateForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter update message" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isSubmittingUpdate}>
                        {isSubmittingUpdate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Update
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card className="shadow-lg mb-6">
          <CardHeader className="border-b pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle className="text-3xl font-bold text-slate-800">{placement.title}</CardTitle>
                <CardDescription className="text-lg text-slate-500 flex items-center mt-1">
                  <Building className="mr-2 h-5 w-5" /> {placement.company.name}
                </CardDescription>
              </div>
              {user?.role === 'admin' && (
                <div className="mt-4 sm:mt-0 space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/admin/placements/edit/${placement._id}`)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the placement
                          and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePlacement} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
             {placement.company.website && (
              <a href={placement.company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center mt-2">
                Visit Company Website <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            )}
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {renderDetail(Briefcase, "Job Designation", placement.jobDesignation)}
              {renderDetail(CircleDollarSign, "CTC / Stipend", placement.ctcDetails)}
              {renderDetail(MapPin, "Location", placement.location)}
              {renderDetail(Laptop, "Mode of Recruitment", placement.modeOfRecruitment)}
              {renderDetail(Users, "Eligible Branches", placement.eligibleBranches)}
              {renderDetail(FileText, "Job Description", placement.jobDescriptionLink, true)}
              {renderDetail(Users, "Eligible Batches", placement.batches)}
            </div>
            
            <div className="space-y-4">
              {renderDetail(CalendarDays, "Application Deadline", placement.applicationDeadline ? new Date(placement.applicationDeadline).toLocaleDateString() : 'N/A')}
              {renderDetail(CalendarClock, "Tentative Drive Date", placement.tentativeDriveDate ? new Date(placement.tentativeDriveDate).toLocaleDateString() : 'N/A')}
              {renderDetail(LinkIcon, "Apply Link", placement.applyLink, true)}
               <div className="space-y-1">
                 <p className="font-semibold text-slate-700 flex items-center"><FileText className="h-5 w-5 text-slate-500 mr-2" />Eligibility Criteria:</p>
                 <ul className="list-disc list-inside pl-2 text-slate-600 text-sm">
                    {placement.eligibilityCriteria.activeBacklogs && <li>Active Backlogs: {placement.eligibilityCriteria.activeBacklogs}</li>}
                    {placement.eligibilityCriteria.deadBacklogs && <li>Dead Backlogs: {placement.eligibilityCriteria.deadBacklogs}</li>}
                    {placement.eligibilityCriteria.otherEligibilities?.map(crit => <li key={crit}>{crit}</li>)}
                 </ul>
              </div>
            </div>

            {placement.driveRounds && placement.driveRounds.length > 0 && (
              <div className="md:col-span-3 space-y-2 pt-4 border-t mt-2">
                <h3 className="text-lg font-semibold text-slate-700">Drive Rounds:</h3>
                <div className="flex flex-wrap gap-2">
                  {placement.driveRounds.map((round, index) => (
                    <Badge key={index} variant="secondary" className="bg-slate-200 text-slate-700">{round}</Badge>
                  ))}
                </div>
              </div>
            )}

            {placement.notes && placement.notes.length > 0 && (
              <div className="md:col-span-3 space-y-2 pt-4 border-t mt-2">
                <h3 className="text-lg font-semibold text-slate-700 flex items-center">
                  <Info className="mr-2 h-5 w-5 text-blue-500" /> Additional Notes:
                </h3>
                <ul className="list-disc list-inside pl-5 text-slate-600 space-y-1">
                  {placement.notes.map((note, index) => <li key={index}>{note}</li>)}
                </ul>
              </div>
            )}

            {placement.updates && placement.updates.length > 0 && (
               <div className="md:col-span-3 space-y-3 pt-4 border-t mt-2">
                <h3 className="text-lg font-semibold text-slate-700">Updates:</h3>
                {placement.updates.slice().reverse().map(update => ( 
                  <Card key={update._id} className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2 pt-3">
                      <CardTitle className="text-md text-blue-700 flex items-center">
                        {update.updateType === 'Alert' && <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />}
                        {update.updateType === 'Info' && <Info className="mr-2 h-5 w-5 text-blue-500" />}
                        {update.updateType === 'Reminder' && <CalendarClock className="mr-2 h-5 w-5 text-green-500" />}
                        {update.updateType}
                        {/* TODO: Admin edit/delete buttons for this specific update */}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        {new Date(update.createdAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-slate-700">{update.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
