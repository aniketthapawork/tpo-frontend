
```tsx
import React, { useEffect } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';
import SelectionFormFields from './SelectionFormFields';
import { selectionSchema, SelectionFormData, SelectedStudentInput } from './selectionSchemas';
import { SelectionRecord } from '@/api/selectionService';

interface EditSelectionDialogProps {
  selectionRecordToEdit: SelectionRecord | null;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: SelectionFormData) => void;
  isSubmitting: boolean;
}

const EditSelectionDialog: React.FC<EditSelectionDialogProps> = ({
  selectionRecordToEdit,
  onOpenChange,
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<SelectionFormData>({
    resolver: zodResolver(selectionSchema),
    defaultValues: {
      selectedStudents: [{ name: '', rollno: '', branch: '' }],
      nextSteps: '',
      documentLink: '',
      additionalNotes: '',
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "selectedStudents",
  });

  useEffect(() => {
    if (selectionRecordToEdit) {
      const studentsForForm = selectionRecordToEdit.selectedStudents.map(s => ({ 
        _id: s._id || undefined,
        name: s.name,
        rollno: s.rollno,
        branch: s.branch,
      }));
      
      form.reset({
        selectedStudents: studentsForForm.length > 0 ? studentsForForm : [{ name: '', rollno: '', branch: '' }],
        nextSteps: selectionRecordToEdit.nextSteps?.join('\n') || '',
        documentLink: selectionRecordToEdit.documentLink || '',
        additionalNotes: selectionRecordToEdit.additionalNotes?.join('\n') || '',
      });
    } else {
        form.reset({
            selectedStudents: [{ name: '', rollno: '', branch: '' }],
            nextSteps: '',
            documentLink: '',
            additionalNotes: '',
        });
    }
  }, [selectionRecordToEdit, form, replace]);


  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
        form.reset({ // Reset form on explicit cancel/close
            selectedStudents: [{ name: '', rollno: '', branch: '' }],
            nextSteps: '',
            documentLink: '',
            additionalNotes: '',
        });
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={!!selectionRecordToEdit} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Selection List</DialogTitle>
          <DialogDescription>Update the selection list details.</DialogDescription>
        </DialogHeader>
        {selectionRecordToEdit && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <SelectionFormFields
                formControl={form.control}
                studentFields={fields}
                studentAppend={(value) => append(value as SelectedStudentInput)}
                studentRemove={remove}
                errors={form.formState.errors}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Selection List
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditSelectionDialog;
```
