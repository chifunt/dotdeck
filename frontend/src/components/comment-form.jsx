/**
 * @file Small uncontrolled form used to create a new comment.
 */

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * @param {{
 *   onSubmit: (body: string) => void | Promise<void>;
 *   isLoading?: boolean;
 * }} props
 */
export function CommentForm({ onSubmit, isLoading = false }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { body: "" } });

  /** Forward the plain body string and clear the textarea on success. */
  const submit = async ({ body }) => {
    await onSubmit(body);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-2">
      <Textarea
        rows={3}
        placeholder="Add a comment…"
        {...register("body", { required: true })}
      />

      <Button disabled={isLoading || isSubmitting}>Post</Button>
    </form>
  );
}
