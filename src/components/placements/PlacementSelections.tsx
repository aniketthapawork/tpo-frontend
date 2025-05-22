
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSelectionsByPlacementId, SelectionRecord, SelectedStudent } from '@/api/selectionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Users, LinkIcon, FileText, Award, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


interface PlacementSelectionsProps {
  placementId: string;
}

const PlacementSelections: React.FC<PlacementSelectionsProps> = ({ placementId }) => {
  const { user } = useAuth();
  const { data: selections, isLoading, error, refetch } = useQuery<SelectionRecord[], Error>({
    queryKey: ['selections', placementId],
    queryFn: () => getSelectionsByPlacementId(placementId),
  });

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
  
  // Assuming a placement might have multiple selection records (e.g., different phases),
  // but typically there's one main final selection. We'll display all if multiple exist.
  const selectionData = selections?.[0]; // For now, let's focus on the first selection record if multiple.

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-xl">Final Selections</CardTitle>
          <CardDescription>Students selected for this placement opportunity.</CardDescription>
        </div>
         {user?.role === 'admin' && !selectionData && ( // Show Add button only if no selection data exists or allow multiple?
          <Button size="sm" disabled> {/* TODO: Implement Add Selection functionality */}
            <PlusCircle className="mr-2 h-4 w-4" /> Add Selection
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {selectionData ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-lg flex items-center">
                <Award className="mr-2 h-5 w-5 text-green-600" /> Selected Students
              </h3>
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
            </div>

            {selectionData.nextSteps && selectionData.nextSteps.length > 0 && (
              <div>
                <h4 className="font-semibold">Next Steps:</h4>
                <ul className="list-disc list-inside pl-4 text-slate-700">
                  {selectionData.nextSteps.map((step, index) => <li key={index}>{step}</li>)}
                </ul>
              </div>
            )}

            {selectionData.documentLink && (
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-slate-500" />
                <a href={selectionData.documentLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                  Relevant Document
                </a>
              </div>
            )}

            {selectionData.additionalNotes && selectionData.additionalNotes.length > 0 && (
              <div>
                <h4 className="font-semibold">Additional Notes:</h4>
                <ul className="list-disc list-inside pl-4 text-slate-700">
                  {selectionData.additionalNotes.map((note, index) => <li key={index}>{note}</li>)}
                </ul>
              </div>
            )}
             {/* TODO: Add Edit/Delete buttons for admin */}
          </div>
        ) : (
          <p className="text-slate-600">No final selection data available yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PlacementSelections;
