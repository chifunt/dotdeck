import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentForm({ onSubmit, isLoading }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { body: "" },
  });

  const submit = (v) => {
    onSubmit(v.body);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-2">
      <Textarea
        rows={3}
        placeholder="Add a comment…"
        {...register("body", { required: true })}
      />
      <Button disabled={isLoading}>Post</Button>
    </form>
  );
}
