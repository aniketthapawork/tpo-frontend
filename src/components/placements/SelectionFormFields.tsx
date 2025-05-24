
import React from 'react';
import { Control, FieldArrayWithId, FieldErrors } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { SelectionFormData, SelectedStudentInput } from './selectionSchemas';

interface SelectionFormFieldsProps {
  formControl: Control<SelectionFormData>;
  studentFields: FieldArrayWithId<SelectionFormData, "selectedStudents", "id">[];
  studentAppend: (value: SelectedStudentInput | { name: string; rollno: string; branch: string; _id?: string | undefined }) => void; // Adjusted type for append
  studentRemove: (index: number) => void;
  errors: FieldErrors<SelectionFormData>;
}

const SelectionFormFields: React.FC<SelectionFormFieldsProps> = ({
  formControl,
  studentFields,
  studentAppend,
  studentRemove,
  errors
}) => {
  return (
    <>
      <div>
        <FormLabel>Selected Students</FormLabel>
        {errors.selectedStudents && errors.selectedStudents.message && !errors.selectedStudents.root && !Array.isArray(errors.selectedStudents) && (
            <p className="text-sm font-medium text-destructive mt-1">{errors.selectedStudents.message}</p>
        )}
        {studentFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-10 gap-2 mt-2 items-start">
            <div className="col-span-3">
              <FormField
                control={formControl}
                name={`selectedStudents.${index}.name`}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Name" {...formField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-3">
              <FormField
                control={formControl}
                name={`selectedStudents.${index}.rollno`}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Roll No" {...formField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-3">
              <FormField
                control={formControl}
                name={`selectedStudents.${index}.branch`}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Branch" {...formField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-1 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => studentRemove(index)}
                disabled={studentFields.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => studentAppend({ name: '', rollno: '', branch: '' })}
          className="mt-2"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </div>
      <FormField
        control={formControl}
        name="nextSteps"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Next Steps (Optional, one per line)</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe next steps..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={formControl}
        name="documentLink"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Document Link (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Document URL" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={formControl}
        name="additionalNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes (Optional, one per line)</FormLabel>
            <FormControl>
              <Textarea placeholder="Any additional information..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default SelectionFormFields;
