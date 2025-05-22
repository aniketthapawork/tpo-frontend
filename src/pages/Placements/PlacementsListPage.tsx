
import React, { useEffect, useState } from 'react';
import { getAllPlacements } from '@/api/placementService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2, Briefcase, Building, CalendarDays, ExternalLink, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Company {
  name: string;
  description?: string;
  website?: string;
}

interface Placement {
  _id: string;
  title: string;
  company: Company;
  jobDesignation: string;
  eligibleBranches: string[];
  ctcDetails: string;
  applicationDeadline?: string;
  createdAt: string;
}

const PlacementsListPage = () => {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlacements = async () => {
      try {
        setIsLoading(true);
        const data = await getAllPlacements();
        setPlacements(data.placements);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch placements:", err);
        const errorMessage = err.response?.data?.message || "Failed to load placements. Please try again later.";
        setError(errorMessage);
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlacements();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <Loader2 className="h-16 w-16 animate-spin text-slate-600" />
        <p className="mt-4 text-2xl text-slate-700 font-semibold">Loading Placements...</p>
        <p className="text-slate-500">Please wait while we fetch the latest opportunities.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-semibold text-red-700">Oops! Something went wrong.</h2>
        <p className="mt-2 text-slate-600">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-6 bg-slate-700 hover:bg-slate-800">
          Try Again
        </Button>
      </div>
    );
  }
  
  if (placements.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <Briefcase className="h-16 w-16 text-slate-500" />
        <h2 className="mt-4 text-2xl font-semibold text-slate-700">No Placements Available</h2>
        <p className="mt-2 text-slate-500">Check back later for new opportunities.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 mb-8 text-center">Available Placements</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {placements.map((placement) => (
            <Card key={placement._id} className="flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-700">{placement.title}</CardTitle>
                <CardDescription className="flex items-center text-slate-500 pt-1">
                  <Building className="mr-2 h-4 w-4" /> {placement.company.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="flex items-center text-slate-600">
                  <Briefcase className="mr-2 h-5 w-5 text-slate-500" />
                  <strong>Role:</strong> <span className="ml-1">{placement.jobDesignation}</span>
                </p>
                <p className="text-slate-600">
                  <strong>CTC:</strong> {placement.ctcDetails}
                </p>
                <p className="text-slate-600">
                  <strong>Eligible Branches:</strong> {placement.eligibleBranches.join(', ')}
                </p>
                {placement.applicationDeadline && (
                  <p className="flex items-center text-sm text-red-600 font-medium">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Apply by: {new Date(placement.applicationDeadline).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Link to={`/placements/${placement._id}`} className="w-full">
                  <Button className="w-full bg-slate-700 hover:bg-slate-800">
                    View Details <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlacementsListPage;
