/**
 * @file Simple passthrough for tags (could hold caching later).
 */
import { TagModel } from "../models/tag.model.js";

export const TagService = {
  async list() {
    return TagModel.all();
  },
};
