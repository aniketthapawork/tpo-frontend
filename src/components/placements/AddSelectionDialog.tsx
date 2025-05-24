
import React from 'react';
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

interface AddSelectionDialogProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: SelectionFormData) => void;
  isSubmitting: boolean;
}

const AddSelectionDialog: React.FC<AddSelectionDialogProps> = ({
  open,
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "selectedStudents",
  });

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset({
        selectedStudents: [{ name: '', rollno: '', branch: '' }],
        nextSteps: '',
        documentLink: '',
        additionalNotes: '',
      });
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Selection List</DialogTitle>
          <DialogDescription>Add a list of final selected students for this placement.</DialogDescription>
        </DialogHeader>
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
                Add Selection List
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSelectionDialog;
