
```tsx
import React from 'react';
import { SelectionRecord } from '@/api/selectionService';
import { User } from '@/contexts/AuthContext'; // Changed AuthUser to User
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Award, Edit, Trash2, FileText, Loader2 } from 'lucide-react';

interface SelectionListItemProps {
  selectionRecord: SelectionRecord;
  recordIndex: number;
  totalRecords: number;
  user: User | null; // Changed AuthUser to User
  onEdit: (selection: SelectionRecord) => void;
  onDeletePress: (selectionId: string) => void;
  isDeleting: boolean;
  currentDeletingId: string | null;
}

const SelectionListItem: React.FC<SelectionListItemProps> = ({
  selectionRecord,
  recordIndex,
  totalRecords,
  user,
  onEdit,
  onDeletePress,
  isDeleting,
  currentDeletingId
}) => {
  return (
    <div key={selectionRecord._id} className={`space-y-4 ${recordIndex > 0 ? 'mt-6 pt-6 border-t' : ''}`}>
      <div className="flex justify-between items-start">
        <h3 className="font-semibold mb-2 text-lg flex items-center">
          <Award className="mr-2 h-5 w-5 text-green-600" />
          Selected Students List {totalRecords > 1 ? `#${recordIndex + 1}` : ''}
        </h3>
        {user?.role === 'admin' && (
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(selectionRecord)}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Selection List</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this selection list? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeletePress(selectionRecord._id)} disabled={isDeleting && currentDeletingId === selectionRecord._id}>
                    {isDeleting && currentDeletingId === selectionRecord._id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {selectionRecord.selectedStudents && selectionRecord.selectedStudents.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Roll No.</TableHead>
              <TableHead>Branch</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectionRecord.selectedStudents.map((student, index) => (
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

      {selectionRecord.nextSteps && selectionRecord.nextSteps.length > 0 && (
        <div>
          <h4 className="font-semibold">Next Steps:</h4>
          <ul className="list-disc list-inside pl-4 text-slate-700 dark:text-slate-300">
            {selectionRecord.nextSteps.map((step, index) => <li key={index}>{step}</li>)}
          </ul>
        </div>
      )}

      {selectionRecord.documentLink && (
        <div className="flex items-center">
          <FileText className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
          <a href={selectionRecord.documentLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all dark:text-blue-400">
            Relevant Document
          </a>
        </div>
      )}

      {selectionRecord.additionalNotes && selectionRecord.additionalNotes.length > 0 && (
        <div>
          <h4 className="font-semibold">Additional Notes:</h4>
          <ul className="list-disc list-inside pl-4 text-slate-700 dark:text-slate-300">
            {selectionRecord.additionalNotes.map((note, index) => <li key={index}>{note}</li>)}
          </ul>
        </div>
      )}
      {(!selectionRecord.nextSteps || selectionRecord.nextSteps.length === 0) && !selectionRecord.documentLink && (!selectionRecord.additionalNotes || selectionRecord.additionalNotes.length === 0) && (
        selectionRecord.selectedStudents && selectionRecord.selectedStudents.length > 0 &&
        <p className="text-slate-500 dark:text-slate-400 italic mt-2">No further details provided for this selection list.</p>
      )}
    </div>
  );
};

export default SelectionListItem;
```
