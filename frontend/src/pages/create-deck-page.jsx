/**
 * @file Form wizard used for both “create” *and* “edit” flows.
 */
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useCreateDeck } from "@/features/decks/mutations";
import { useTags } from "@/features/tags/use-tags";
import { uploadThumbnail } from "@/lib/uploads";

import { Navbar } from "@/layouts/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbnailUploader } from "@/components/thumbnail-uploader";
import { Textarea } from "@/components/ui/textarea";

/* ──────────────────── Validation schema ──────────────────── */
/**
 * **Important note** – `thumbnailFile` is declared so Zod keeps it,
 * otherwise React-Hook-Form would hand us an object *without* that key.
 */
const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  tags: z.array(z.string()).max(25),
  thumbnailUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)), // empty → undefined
  thumbnailFile: z.any().optional(), // <── keep the File object
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

/* ───────────────────── Component ─────────────────────────── */
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
      title: "",
      description: "",
      tags: [],
      snippets: [{ language: "", caption: "", code: "" }],
      thumbnailFile: undefined,
      thumbnailUrl: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "snippets",
  });

  /* ──────────────── Submit handler ─────────────────────── */
  const onSubmit = async (vals) => {
    /* 1 – upload if the user picked a local file */
    let url = vals.thumbnailUrl;
    if (vals.thumbnailFile instanceof File) {
      try {
        url = await uploadThumbnail(vals.thumbnailFile);
      } catch (e) {
        toast.error(e.response?.data?.message || "Thumbnail upload failed");
        return; // abort save
      }
    }

    /* 2 – build payload (strip the File) */
    const payload = {
      ...vals,
      thumbnailUrl: url,
      thumbnailFile: undefined,
    };

    /* 3 – send to create or external (edit) mutation */
    const { id } = await (externalSubmit ?? createMut.mutateAsync)(payload);
    toast.success("Saved!");
    if (!externalSubmit) nav(`/decks/${id}`);
  };

  /* ───────────────────── Render ─────────────────────────── */
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

          {/* Tag chooser ------------------------------------------------------- */}
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

          {/* Thumbnail --------------------------------------------------------- */}
          <Controller
            name="thumbnailFile"
            control={control}
            render={({ field }) => (
              <ThumbnailUploader
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          {/* Snippets array ---------------------------------------------------- */}
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
