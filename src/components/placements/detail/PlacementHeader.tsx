import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Building, Edit, Trash2, ExternalLink, PlusCircle } from 'lucide-react';
import { PlacementDetails } from './placementDetailTypes';

// Local User type definition
interface User {
  role?: 'admin' | 'student' | 'faculty';
}

interface PlacementHeaderProps {
  placement: PlacementDetails;
  user: User | null;
  onNavigateToEdit: (placementId: string) => void;
  onDeletePlacement: () => void;
  onTriggerAddUpdateDialog: () => void;
}

const PlacementHeader: React.FC<PlacementHeaderProps> = ({
  placement,
  user,
  onNavigateToEdit,
  onDeletePlacement,
  onTriggerAddUpdateDialog,
}) => {
  return (
    <CardHeader className="border-b pb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <CardTitle className="text-3xl font-bold text-slate-800">{placement.title}</CardTitle>
          <CardDescription className="text-lg text-slate-500 flex items-center mt-1">
            <Building className="mr-2 h-5 w-5" /> {placement.company.name}
          </CardDescription>
        </div>
        {user?.role === 'admin' && (
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateToEdit(placement._id)}
            >
              <Edit className="mr-2 h-4 w-4" /> Edit Placement
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
                  <AlertDialogAction onClick={onDeletePlacement} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button size="sm" onClick={onTriggerAddUpdateDialog}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Update
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
  );
};

export default PlacementHeader;
