
import React, { useEffect } from 'react';
// import { UseFormReturn } from "react-hook-form"; // Removed
import { Button } from '@/components/ui/button.jsx'; // Adj
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog.jsx"; // Adj
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.jsx"; // Adj
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx"; // Adj
import { Textarea } from "@/components/ui/textarea.jsx"; // Adj
import { Loader2 } from 'lucide-react';
// import { EditUpdateFormData } from './updateFormSchemas'; // Removed
// import { PlacementUpdate } from './placementDetailTypes'; // Removed

// No EditPlacementUpdateDialogProps interface

const EditPlacementUpdateDialog = ({
  open,
  onOpenChange,
  form,
  onSubmit,
  isSubmitting,
  editingUpdate,
}) => {
  useEffect(() => {
    if (editingUpdate && open) {
      form.reset({
        updateType: editingUpdate.updateType,
        message: editingUpdate.message,
      });
    }
  }, [editingUpdate, open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Update</DialogTitle>
          <DialogDescription>
            Modify the details for the placement update.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="updateType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Update Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select update type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Info">Info</SelectItem>
                      <SelectItem value="Alert">Alert</SelectItem>
                      <SelectItem value="Reminder">Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter update message" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlacementUpdateDialog;

