import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, AlertTriangle, Info as InfoIcon, CalendarClock } from 'lucide-react';
import { PlacementUpdate } from './placementDetailTypes';

// Local User type definition if not exported from AuthContext
interface User {
  role?: 'admin' | 'student' | 'faculty';
  // Add other relevant user properties if needed by the component
}

interface UpdateCardItemProps {
  update: PlacementUpdate;
  user: User | null; 
  onEdit: (update: PlacementUpdate) => void;
  onDelete: (updateId: string) => void;
}

const UpdateCardItem: React.FC<UpdateCardItemProps> = ({ update, user, onEdit, onDelete }) => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-2 pt-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-md text-blue-700 flex items-center">
              {update.updateType === 'Alert' && <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />}
              {update.updateType === 'Info' && <InfoIcon className="mr-2 h-5 w-5 text-blue-500" />}
              {update.updateType === 'Reminder' && <CalendarClock className="mr-2 h-5 w-5 text-green-500" />}
              {update.updateType}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              {new Date(update.createdAt).toLocaleString()}
            </CardDescription>
          </div>
          {user?.role === 'admin' && (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(update)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Update</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this update? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(update._id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-slate-700">{update.message}</p>
      </CardContent>
    </Card>
  );
};

export default UpdateCardItem;
