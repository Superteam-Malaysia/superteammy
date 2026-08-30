"use client";

import { useEffect, useMemo, useState } from "react";
import { FolderOpen, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type MemberOption = { id: string; label: string };

const EMPTY_FORM = {
  profile_id: "",
  title: "",
  description: "",
  link: "",
  image_url: "",
  is_featured: false,
  display_order: 0,
};

type FormState = typeof EMPTY_FORM;

function ownerName(p: Project) {
  return p.profile?.nickname || p.profile?.real_name || "—";
}

interface AdminShowcaseClientProps {
  initialProjects: Project[];
}

export function AdminShowcaseClient({ initialProjects }: AdminShowcaseClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // profile_id is NOT NULL, so a project always needs an owner to attach to.
  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, nickname, real_name")
      .eq("is_active", true)
      .order("nickname")
      .then(({ data }) => {
        setMembers(
          (data || [])
            .map((m) => ({
              id: m.id as string,
              label: (m.nickname as string) || (m.real_name as string) || "",
            }))
            .filter((m) => m.label.length > 0)
        );
      });
  }, []);

  const featuredCount = useMemo(
    () => projects.filter((p) => p.is_featured).length,
    [projects]
  );

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setIsOpen(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      profile_id: p.profile_id,
      title: p.title,
      description: p.description || "",
      link: p.link || "",
      image_url: p.image_url || "",
      is_featured: p.is_featured,
      display_order: p.display_order ?? 0,
    });
    setError("");
    setIsOpen(true);
  }

  async function handleSave() {
    if (!form.profile_id) return setError("Pick a member to attribute this to.");
    if (!form.title.trim()) return setError("Title is required.");

    setIsSaving(true);
    setError("");

    if (editing) {
      const { data, error } = await supabase
        .from("projects")
        .update(form)
        .eq("id", editing.id)
        .select("*, profile:profiles(id, nickname, real_name)")
        .single();

      if (error) setError(error.message);
      else {
        setProjects(projects.map((p) => (p.id === editing.id ? (data as Project) : p)));
        setIsOpen(false);
      }
    } else {
      const { data, error } = await supabase
        .from("projects")
        .insert(form)
        .select("*, profile:profiles(id, nickname, real_name)")
        .single();

      if (error) setError(error.message);
      else {
        setProjects([data as Project, ...projects]);
        setIsOpen(false);
      }
    }
    setIsSaving(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase.from("projects").delete().eq("id", deleteTarget.id);
    if (!error) setProjects(projects.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="w-5 h-5" /> Project Showcase
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {projects.length} project{projects.length === 1 ? "" : "s"} · {featuredCount} featured
          </p>
        </div>
        <Button onClick={openAdd} className="cursor-pointer">
          <Plus className="w-4 h-4 mr-2" /> Add Project
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Member</TableHead>
              <TableHead className="w-20">Featured</TableHead>
              <TableHead className="w-20">Order</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  No projects yet.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {p.link ? (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {p.title}
                      </a>
                    ) : (
                      p.title
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{ownerName(p)}</TableCell>
                  <TableCell>
                    {p.is_featured && <Star className="w-4 h-4 text-amber-400" />}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.display_order}</TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 text-muted-foreground hover:text-white cursor-pointer"
                      aria-label={`Edit ${p.title}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="p-1.5 text-muted-foreground hover:text-destructive cursor-pointer"
                      aria-label={`Delete ${p.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Project" : "Add Project"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Member *</Label>
              <select
                value={form.profile_id}
                onChange={(e) => setForm({ ...form, profile_id: e.target.value })}
                className="flex h-9 w-full rounded-md border border-border/50 bg-[#171717] px-3 py-1 text-sm cursor-pointer"
              >
                <option value="">Select a member…</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Project name"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="What it does, in a sentence or two"
                className="flex min-h-[80px] w-full rounded-md border border-border/50 bg-[#171717] px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-text"
              />
            </div>

            <div className="space-y-2">
              <Label>Link</Label>
              <Input
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="https://…"
              />
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://…"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="cursor-pointer"
                />
                Featured
              </label>
              <div className="flex items-center gap-2">
                <Label className="whitespace-nowrap">Order</Label>
                <Input
                  type="number"
                  value={form.display_order}
                  onChange={(e) =>
                    setForm({ ...form, display_order: Number(e.target.value) || 0 })
                  }
                  className="w-24"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="cursor-pointer">
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            &ldquo;{deleteTarget?.title}&rdquo; will be permanently removed.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="cursor-pointer">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
