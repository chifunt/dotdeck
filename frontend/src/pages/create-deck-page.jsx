/**
 * @file Form wizard used for *both* “create” **and** “edit**” flows
 * (the edit page just injects `initialValues` + a custom onSubmit).
 */

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useCreateDeck } from "@/features/decks/mutations";
import { useTags } from "@/features/tags/use-tags";

import { Navbar } from "@/layouts/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/*──────────────────────── Validation schema (Zod) ────────────────────────*/
const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  tags: z.array(z.string()).max(25),
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

/**
 * Generic deck-editor page.
 * If `initialValues` & `onSubmit` are passed (Edit page),
 * it becomes a pre-filled “edit” form.
 */
export function CreateDeckPage({
  initialValues,
  submitLabel = "Publish",
  onSubmit: externalSubmit,
}) {
  const nav = useNavigate();
  const { data: tagList } = useTags();
  const createMut = useCreateDeck();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      tags: [],
      snippets: [{ language: "", caption: "", code: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "snippets",
  });

  /* Actual submit handler */
  const onSubmit = async (vals) => {
    const mutFn = externalSubmit ?? createMut.mutateAsync;
    const { id } = await mutFn(vals);
    toast.success("Saved!");
    if (!externalSubmit) nav(`/decks/${id}`);
  };

  /*──────────────────────── Render ────────────────────────*/
  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">
          {initialValues ? "Edit deck" : "Create deck"}
        </h1>

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
            <div className="flex flex-wrap gap-2">
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

          {/* Thumbnail (URL for now – could be replaced with upload widget) */}
          <Input placeholder="Thumbnail URL" {...register("thumbnailUrl")} />

          {/* Snippets array UI */}
          <div className="space-y-4">
            {fields.map((f, i) => (
              <div key={f.id} className="space-y-2 rounded border p-4">
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
                    type="button"
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

          <Button disabled={isSubmitting || createMut.isLoading}>
            {submitLabel}
          </Button>
        </form>
      </div>
    </>
  );
}
