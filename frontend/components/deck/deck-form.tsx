"use client";

import type React from "react";

import { useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DeckFormSchema, type DeckFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, UploadCloud, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { api } from "@/lib/axios-instance";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { DeckDetail } from "@/types"; // For initialData type
import { getImageUrl } from "@/lib/get-image-url";
import { Badge } from "@/components/ui/badge";

interface DeckFormProps {
  initialData?: DeckDetail; // For edit mode
  onSubmitForm: (data: DeckFormValues) => Promise<any>; // Returns a promise for loading state
  isSubmitting: boolean;
}

export function DeckForm({
  initialData,
  onSubmitForm,
  isSubmitting,
}: DeckFormProps) {
  const router = useRouter();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialData?.thumbnailUrl || null,
  );
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<DeckFormValues>({
    resolver: zodResolver(DeckFormSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description || "",
          thumbnailUrl: initialData.thumbnailUrl || "",
          tags: initialData.tags?.map((tag) => tag.name) || [],
          snippets: initialData.snippets.map((s) => ({
            language: s.language ?? "",
            code: s.code,
            caption: s.caption || "",
          })),
        }
      : {
          title: "",
          description: "",
          thumbnailUrl: "",
          tags: [],
          snippets: [{ language: "", code: "", caption: "" }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "snippets",
  });

  const currentTags = form.watch("tags") || [];

  const onDropThumbnail = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploadingThumbnail(true);

      try {
        const formData = new FormData();
        formData.append("image", file);

        // 🔧 1.  let axios set the header + boundary
        const { data } = await api.post<{ url: string }>(
          "/decks/thumbnail",
          formData,
        );

        // 🔧 3.  make sure the field name matches your API
        form.setValue("thumbnailUrl", data.url, { shouldValidate: true });

        // 🔧 2.  show local preview without getImageUrl
        setThumbnailPreview(URL.createObjectURL(file));

        toast.success("Thumbnail uploaded!");
      } catch (err) {
        console.error(err);
        toast.error("Thumbnail upload failed.");
      } finally {
        setIsUploadingThumbnail(false);
      }
    },
    [form],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropThumbnail,
    accept: { "image/*": [".jpeg", ".png", ".webp", ".jpg"] },
    maxFiles: 1,
    noKeyboard: true, // keep keyboard disabled if you like
  });

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTagFromInput();
    } else if (
      e.key === "Backspace" &&
      tagInput === "" &&
      currentTags.length > 0
    ) {
      // Remove last tag if input is empty and backspace is pressed
      const newTags = [...currentTags];
      newTags.pop();
      form.setValue("tags", newTags);
    }
  };

  const addTagFromInput = () => {
    const trimmedTag = tagInput.trim();
    if (
      trimmedTag &&
      !currentTags.includes(trimmedTag) &&
      currentTags.length < 25
    ) {
      const newTags = [...currentTags, trimmedTag];
      form.setValue("tags", newTags);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = currentTags.filter((tag) => tag !== tagToRemove);
    form.setValue("tags", newTags);
  };

  const handleTagInputBlur = () => {
    // Add tag when input loses focus if there's content
    if (tagInput.trim()) {
      addTagFromInput();
    }
  };

  const handleFormSubmit = async (data: DeckFormValues) => {
    await onSubmitForm(data);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {initialData ? "Edit Deck" : "Create New Deck"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Awesome Neovim Setup"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of your deck..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thumbnailUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail (Optional)</FormLabel>
                  <FormControl>
                    {/* the entire div is now the button */}
                    <div
                      {...getRootProps()}
                      className={`
           mt-1 flex justify-center px-6 pt-5 pb-6 cursor-pointer rounded-md
           border-2 border-dashed
           ${isDragActive ? "border-primary" : "border-border"}
         `}
                    >
                      {/* 👇 hidden input must be a direct child of the root */}
                      <input {...getInputProps()} className="sr-only" />
                      <div className="space-y-1 text-center">
                        {thumbnailPreview ? (
                          <Image
                            src={
                              thumbnailPreview?.startsWith("blob:")
                                ? thumbnailPreview // local object URL
                                : getImageUrl(thumbnailPreview) ||
                                  "/placeholder.svg"
                            }
                            alt="Thumbnail preview"
                            width={200}
                            height={112}
                            className="mx-auto h-28 w-auto object-contain rounded"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        )}
                        <p className="text-sm text-muted-foreground">
                          Click or drag &amp; drop
                        </p>
                        {isUploadingThumbnail && (
                          <p className="text-xs text-primary">Uploading...</p>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>PNG, JPG, WEBP up to 2MB</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (Optional)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {/* Display current tags */}
                      {currentTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/20">
                          {currentTags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1 hover:bg-destructive/10 transition-colors group"
                            >
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 group-hover:text-destructive transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Tag input */}
                      <Input
                        placeholder={
                          currentTags.length === 0
                            ? "Type tags and press Enter or comma to add (e.g., neovim, lua, productivity)"
                            : "Add another tag..."
                        }
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        onBlur={handleTagInputBlur}
                        disabled={currentTags.length >= 25}
                        className="focus-ring"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Up to 25 tags. Press Enter or comma to add each tag. Tags
                    will be searchable.
                    {currentTags.length > 0 && (
                      <span className="block mt-1 text-sm">
                        {currentTags.length}/25 tags added
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Snippets</h3>
              {fields.map((item, index) => (
                <Card key={item.id} className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Snippet #{index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <FormField
                    control={form.control}
                    name={`snippets.${index}.language`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., javascript, lua, bash"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`snippets.${index}.caption`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Caption (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Function to fetch data"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`snippets.${index}.code`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste your code snippet here"
                            {...field}
                            rows={6}
                            className="font-mono text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => append({ language: "", code: "", caption: "" })}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Snippet
              </Button>
              {form.formState.errors.snippets?.root?.message && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.snippets.root.message}
                </p>
              )}
              {form.formState.errors.snippets &&
                !form.formState.errors.snippets.root &&
                typeof form.formState.errors.snippets !== "string" && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    Please check errors in snippets.
                  </p>
                )}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploadingThumbnail}
              >
                {isSubmitting
                  ? initialData
                    ? "Saving..."
                    : "Creating..."
                  : initialData
                    ? "Save Changes"
                    : "Create Deck"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
