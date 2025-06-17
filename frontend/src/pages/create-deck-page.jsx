import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateDeck } from "../features/decks/mutations";
import { useTags } from "../features/tags/use-tags";
import { Navbar } from "../layouts/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  tags: z.string().array().max(25),
  thumbnailUrl: z.string().url().optional(),
  snippets: z
    .array(
      z.object({
        language: z.string(),
        caption: z.string().optional(),
        code: z.string().min(1),
      }),
    )
    .min(1),
});

export function CreateDeckPage() {
  const nav = useNavigate();
  const { data: tagList } = useTags();
  const createMut = useCreateDeck();
  const { register, handleSubmit, control, setValue, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      tags: [],
      snippets: [{ language: "", caption: "", code: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "snippets",
  });

  const onSubmit = async (vals) => {
    const { id } = await createMut.mutateAsync(vals);
    nav(`/decks/${id}`); // backend returns slug via redirect? adjust as needed
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-2xl py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Create deck</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input placeholder="Title" {...register("title")} />
          <Textarea
            rows={3}
            placeholder="Description"
            {...register("description")}
          />

          {/* Tag chooser */}
          <div className="space-y-2">
            <p className="text-sm">Tags</p>
            <div className="flex gap-2 flex-wrap">
              {tagList?.map((t) => {
                const active = watch("tags").includes(t.name);
                return (
                  <Button
                    key={t.id}
                    size="sm"
                    variant={active ? "default" : "secondary"}
                    onClick={(e) => {
                      e.preventDefault();
                      setValue(
                        "tags",
                        active
                          ? watch("tags").filter((x) => x !== t.name)
                          : [...watch("tags"), t.name],
                      );
                    }}
                  >
                    {t.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Thumbnail URL input (skip upload UI for brevity) */}
          <Input placeholder="Thumbnail URL" {...register("thumbnailUrl")} />

          {/* Snippets */}
          <div className="space-y-4">
            {fields.map((f, i) => (
              <div key={f.id} className="border rounded p-4 space-y-2">
                <Input
                  placeholder="Language"
                  {...register(`snippets.${i}.language`)}
                />
                <Input
                  placeholder="Caption"
                  {...register(`snippets.${i}.caption`)}
                />
                <Textarea
                  rows={6}
                  placeholder="Code"
                  {...register(`snippets.${i}.code`)}
                />
                {fields.length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(i)}
                  >
                    Remove snippet
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              onClick={() => append({ language: "", caption: "", code: "" })}
            >
              + Add snippet
            </Button>
          </div>

          <Button disabled={createMut.isLoading}>Publish</Button>
        </form>
      </div>
    </>
  );
}
