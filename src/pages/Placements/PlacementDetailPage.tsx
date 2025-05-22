
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPlacementById } from '@/api/placementService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Briefcase, Building, CalendarDays, FileText, Users, CircleDollarSign, MapPin, Laptop, CalendarClock, LinkIcon, ExternalLink, AlertTriangle, Info, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext'; // To check for admin role later

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

interface PlacementUpdate {
  _id: string;
  updateType: 'Alert' | 'Info' | 'Reminder';
  message: string;
  createdAt: string;
}

interface PlacementDetails {
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

const PlacementDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth(); // For future admin checks
  const [placement, setPlacement] = useState<PlacementDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Placement ID is missing.");
      setIsLoading(false);
      return;
    }
    const fetchPlacementDetails = async () => {
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
    fetchPlacementDetails();
  }, [id]);

  if (isLoading) {
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
  
  // Helper to render section if data exists
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
        <div className="mb-6">
          <Link to="/placements">
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Placements
            </Button>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="border-b pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle className="text-3xl font-bold text-slate-800">{placement.title}</CardTitle>
                <CardDescription className="text-lg text-slate-500 flex items-center mt-1">
                  <Building className="mr-2 h-5 w-5" /> {placement.company.name}
                </CardDescription>
              </div>
              {/* Admin buttons placeholder */}
              {user?.role === 'admin' && (
                <div className="mt-4 sm:mt-0 space-x-2">
                  <Button variant="outline" size="sm" disabled> {/* onClick={() => navigate(`/admin/placements/edit/${placement._id}`)} */}
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" disabled> {/* onClick={handleDeletePlacement} */}
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
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
            {/* Column 1: Core Job Details */}
            <div className="md:col-span-2 space-y-4">
              {renderDetail(Briefcase, "Job Designation", placement.jobDesignation)}
              {renderDetail(CircleDollarSign, "CTC / Stipend", placement.ctcDetails)}
              {renderDetail(MapPin, "Location", placement.location)}
              {renderDetail(Laptop, "Mode of Recruitment", placement.modeOfRecruitment)}
              {renderDetail(Users, "Eligible Branches", placement.eligibleBranches)}
              {renderDetail(FileText, "Job Description", placement.jobDescriptionLink, true)}
              {renderDetail(Users, "Eligible Batches", placement.batches)}
            </div>
            
            {/* Column 2: Dates & Links */}
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

            {/* Full Width Sections */}
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
                {placement.updates.slice().reverse().map(update => ( // Show newest first
                  <Card key={update._id} className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2 pt-3">
                      <CardTitle className="text-md text-blue-700 flex items-center">
                        {update.updateType === 'Alert' && <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />}
                        {update.updateType === 'Info' && <Info className="mr-2 h-5 w-5 text-blue-500" />}
                        {update.updateType === 'Reminder' && <CalendarClock className="mr-2 h-5 w-5 text-green-500" />}
                        {update.updateType}
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
      </div>
    </div>
  );
};

export default PlacementDetailPage;
