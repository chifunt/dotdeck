/**
 * @file Small collection of admin-only mutations & queries.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios-client";
import { toast } from "sonner";

/* ── USERS ───────────────────────────────────────────── */

export const useBanUser = (id) =>
  useMutation({
    mutationFn: (payload) => api.post(`/admin/users/${id}/ban`, payload),
    onSuccess: () => toast.success("User banned"),
  });

export const useUnbanUser = (id) =>
  useMutation({
    mutationFn: () => api.delete(`/admin/users/${id}/ban`),
    onSuccess: () => toast.success("User un-banned"),
  });

/* ── TAGS ────────────────────────────────────────────── */

const invalidateTags = (qc) => qc.invalidateQueries({ queryKey: ["tags"] });

export const useCreateTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/admin/tags", payload),
    onSuccess: () => {
      toast.success("Tag created");
      invalidateTags(qc);
    },
  });
};

export const useApproveTag = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch(`/admin/tags/${id}/approve`),
    onSuccess: () => {
      toast.success("Tag approved");
      invalidateTags(qc);
    },
  });
};

export const useMergeTag = (id, targetId) =>
  useMutation({
    mutationFn: () => api.patch(`/admin/tags/${id}/merge-into/${targetId}`),
    onSuccess: () => toast.success("Tag merged"),
  });

/* ── AUDIT LOG ───────────────────────────────────────── */

export const useAuditLog = () =>
  useQuery({
    queryKey: ["audit"],
    queryFn: async () => {
      const { data } = await api.get("/admin/audit");
      return data; // array of AuditRow
    },
  });
