/**
 * @file Thin helper around the “upload thumbnail” endpoint.
 */

import { api } from "@/lib/axios-client";

/**
 * POST `/decks/thumbnail` with multipart-form-data.
 *
 * @param {File} file – Image chosen via <input type="file"/>.
 * @returns {Promise<string>} Resolves to the absolute/relative URL served by the backend.
 *
 * @example
 * const url = await uploadThumbnail(file);
 * setValue("thumbnailUrl", url);
 */
export async function uploadThumbnail(file) {
  const form = new FormData();
  form.append("image", file);

  const { data } = await api.post("/decks/thumbnail", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  /** @type {{ url: string }} */
  return data.url;
}
