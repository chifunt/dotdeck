/**
 * @file Admin console – users, tags & audit log
 */

import { useState } from "react";
import { Navbar } from "@/layouts/navbar";
import { RequireAuth } from "@/features/auth/require-auth";
import {
  useBanUser,
  useUnbanUser,
  useCreateTag,
  useApproveTag,
  useMergeTag,
  useAuditLog,
} from "@/features/admin/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function UsersPanel() {
  const [uid, setUid] = useState("");
  const ban = useBanUser(uid);
  const unban = useUnbanUser(uid);

  return (
    <section className="space-y-2">
      <h2 className="font-semibold text-lg">Users</h2>
      <div className="flex gap-2">
        <Input
          placeholder="User ID"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          className="w-32"
        />
        <Button size="sm" onClick={() => ban.mutate()} disabled={!uid}>
          Ban
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => unban.mutate()}
          disabled={!uid}
        >
          Un-ban
        </Button>
      </div>
    </section>
  );
}

function TagsPanel() {
  const [name, setName] = useState("");
  const [merge, setMerge] = useState({ src: "", dst: "" });
  const create = useCreateTag();
  const approve = useApproveTag(name);
  const mergeMut = useMergeTag(merge.src, merge.dst);

  return (
    <section className="space-y-2">
      <h2 className="font-semibold text-lg">Tags</h2>

      {/* Create */}
      <div className="flex gap-2 items-end">
        <Input
          placeholder="New tag name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button size="sm" onClick={() => create.mutate({ name, tagType: 1 })}>
          Create
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => approve.mutate()}
          disabled={!name}
        >
          Approve
        </Button>
      </div>

      {/* Merge */}
      <div className="flex gap-2 items-end">
        <Input
          placeholder="Source tag ID"
          value={merge.src}
          onChange={(e) => setMerge((o) => ({ ...o, src: e.target.value }))}
          className="w-32"
        />
        <Input
          placeholder="→ Target ID"
          value={merge.dst}
          onChange={(e) => setMerge((o) => ({ ...o, dst: e.target.value }))}
          className="w-32"
        />
        <Button
          size="sm"
          onClick={() => mergeMut.mutate()}
          disabled={!merge.src || !merge.dst}
        >
          Merge
        </Button>
      </div>
    </section>
  );
}

function AuditPanel() {
  const { data } = useAuditLog();

  return (
    <section className="space-y-2">
      <h2 className="font-semibold text-lg">Audit log (latest 100)</h2>
      <pre className="max-h-64 overflow-y-auto rounded bg-rosePine-highlight p-4 text-xs">
        {JSON.stringify(data ?? [], null, 2)}
      </pre>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

export function AdminPage() {
  return (
    <RequireAuth role="admin">
      <Navbar />
      <div className="container mx-auto space-y-8 px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">Admin console</h1>
        <UsersPanel />
        <TagsPanel />
        <AuditPanel />
      </div>
    </RequireAuth>
  );
}
