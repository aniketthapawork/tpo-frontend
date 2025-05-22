
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInterviewsByPlacementId, Interview } from '@/api/interviewService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CalendarDays, LinkIcon, ListChecks, Clock, UserCheck, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface PlacementInterviewsProps {
  placementId: string;
}

const PlacementInterviews: React.FC<PlacementInterviewsProps> = ({ placementId }) => {
  const { user } = useAuth();
  const { data: interviews, isLoading, error, refetch } = useQuery<Interview[], Error>({
    queryKey: ['interviews', placementId],
    queryFn: () => getInterviewsByPlacementId(placementId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <span>Loading interview rounds...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-red-600">
        <AlertTriangle className="mr-2 h-6 w-6" />
        <span>Error loading interview rounds: {error.message}</span>
        <Button onClick={() => refetch()} variant="outline" className="mt-2">Retry</Button>
      </div>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-xl">Interview Rounds</CardTitle>
          <CardDescription>Details about scheduled interviews for this placement.</CardDescription>
        </div>
        {user?.role === 'admin' && (
          <Button size="sm" disabled> {/* TODO: Implement Add Interview functionality */}
            <PlusCircle className="mr-2 h-4 w-4" /> Add Interview
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {interviews && interviews.length > 0 ? (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <Card key={interview._id} className="bg-slate-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Interview on {new Date(interview.interviewDate).toLocaleDateString()}
                  </CardTitle>
                  <CardDescription>
                    {interview.startTime} - {interview.endTime} ({interview.mode})
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {interview.meetingLink && (
                    <div className="flex items-center">
                      <LinkIcon className="mr-2 h-4 w-4 text-slate-500" />
                      <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        Meeting Link
                      </a>
                    </div>
                  )}
                  {interview.shortlistedStudentsDoc && (
                    <div className="flex items-center">
                      <ListChecks className="mr-2 h-4 w-4 text-slate-500" />
                       <a href={interview.shortlistedStudentsDoc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        Shortlisted Students
                      </a>
                    </div>
                  )}
                  {interview.additionalNotes && interview.additionalNotes.length > 0 && (
                    <div>
                      <p className="font-semibold">Additional Notes:</p>
                      <ul className="list-disc list-inside pl-4">
                        {interview.additionalNotes.map((note, index) => <li key={index}>{note}</li>)}
                      </ul>
                    </div>
                  )}
                </CardContent>
                {/* TODO: Add Edit/Delete buttons for admin */}
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-slate-600">No interview rounds scheduled yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PlacementInterviews;
