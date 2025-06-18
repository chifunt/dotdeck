/**
 * Drag-and-drop (or click) thumbnail uploader.
 * On file drop it:
 *   • uploads the image with `uploadThumbnail`
 *   • returns the served URL via `onChange`
 *   • shows a live preview
 */

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { uploadThumbnail } from "@/lib/uploads";
import { Button } from "@/components/ui/button";

export function ThumbnailUploader({ value, onChange }) {
  const [preview, setPreview] = useState(
    // if `value` is a File, create a local URL; otherwise assume it's already a URL string
    value instanceof File ? URL.createObjectURL(value) : value || "",
  );

  /* -------- upload + propagate -------- */
  const onDrop = useCallback(
    (accepted) => {
      const file = accepted[0];
      if (!file) return;

      // show a local preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // hand the File back to RHF — we'll do the real upload in onSubmit
      onChange(file);
    },
    [onChange],
  );

  /* -------- react-dropzone -------- */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop,
  });

  /* -------- UI -------- */
  return (
    <div
      {...getRootProps()}
      className="flex cursor-pointer flex-col items-center justify-center gap-2
                 rounded border-2 border-dashed border-input p-6 text-center
                 hover:bg-muted/20"
    >
      <input {...getInputProps()} />
      {preview ? (
        <>
          <img
            src={preview}
            alt="thumbnail preview"
            className="max-h-48 w-full object-contain"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              setPreview("");
              onChange(undefined);
            }}
          >
            Remove
          </Button>
        </>
      ) : (
        <p className="text-sm">
          {isDragActive ? "Drop it here…" : "Drag & drop thumbnail, or click"}
        </p>
      )}
    </div>
  );
}
