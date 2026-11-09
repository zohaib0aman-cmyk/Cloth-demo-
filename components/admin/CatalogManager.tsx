"use client";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { deleteCategory, deleteCollection, reorder, saveCategory, saveCollection } from "@/app/admin/actions";
import { SingleImageField } from "./ImageUploader";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { SmartImage } from "../SmartImage";

type Item = { id: string; name: string; slug: string; text: string; image: string; count: number; featured?: boolean };

export function CatalogManager({ kind, items: initial }: { kind: "category" | "collection"; items: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [edit, setEdit] = useState<Partial<Item> | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const label = kind === "category" ? "Category" : "Collection";

  function move(i: number, d: number) {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    start(async () => {
      await reorder(kind, next.map((x) => x.id));
      router.refresh();
    });
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!edit) return;
    setError("");
    start(async () => {
      const res: { error?: string } =
        kind === "category"
          ? await saveCategory({ id: edit.id, name: edit.name ?? "", description: edit.text ?? "", image: edit.image ?? "" })
          : await saveCollection({ id: edit.id, name: edit.name ?? "", tagline: edit.text ?? "", image: edit.image ?? "", featured: edit.featured ?? true });
      if (res.error) return setError(res.error);
      setEdit(null);
      router.refresh();
    });
  }

  function remove(it: Item) {
    if (!window.confirm(`Delete ${label.toLowerCase()} “${it.name}”?`)) return;
    start(async () => {
      const res: { error?: string } = kind === "category" ? await deleteCategory(it.id) : await deleteCollection(it.id);
      if (res?.error) return setError(res.error);
      setItems(items.filter((x) => x.id !== it.id));
      router.refresh();
    });
  }

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{kind === "category" ? "Categories" : "Collections"}</h2>
        <button onClick={() => setEdit({ name: "", text: "", image: "", featured: true })} className="btn-dark px-4 py-2 text-xs">
          <AnimatedIcon icon={Plus} size={14} /> New {label.toLowerCase()}
        </button>
      </div>
      {error && !edit && <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {items.map((it, i) => (
            <motion.li key={it.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 rounded-xl border border-line p-2.5">
              <div className="flex flex-col">
                <button disabled={i === 0 || pending} onClick={() => move(i, -1)} className="rounded p-0.5 text-ink-mute hover:text-ink disabled:opacity-25" aria-label="Move up"><ArrowUp size={14} /></button>
                <button disabled={i === items.length - 1 || pending} onClick={() => move(i, 1)} className="rounded p-0.5 text-ink-mute hover:text-ink disabled:opacity-25" aria-label="Move down"><ArrowDown size={14} /></button>
              </div>
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-ivory-deep">
                <SmartImage src={it.image} alt={it.name} fallbackKey={it.slug} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{it.name}</p>
                <p className="truncate text-xs text-ink-mute">{it.count} products{kind === "collection" && !it.featured ? " · hidden from home" : ""}</p>
              </div>
              <button onClick={() => setEdit(it)} className="rounded-lg p-2 text-ink-mute hover:bg-ink/5 hover:text-ink" aria-label="Edit"><AnimatedIcon icon={Pencil} size={15} /></button>
              <button onClick={() => remove(it)} className="rounded-lg p-2 text-ink-mute hover:bg-red-50 hover:text-red-700" aria-label="Delete"><AnimatedIcon icon={Trash2} size={15} /></button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <AnimatePresence>
        {edit && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEdit(null)}>
            <motion.form onSubmit={save} initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} className="w-full max-w-md space-y-4 rounded-t-3xl bg-white p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">{edit.id ? `Edit ${label.toLowerCase()}` : `New ${label.toLowerCase()}`}</h3>
                <button type="button" onClick={() => setEdit(null)} className="rounded-full p-2 hover:bg-ink/5" aria-label="Close"><X size={18} /></button>
              </div>
              <div>
                <label className="label" htmlFor="cm-name">Name</label>
                <input id="cm-name" required value={edit.name ?? ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label" htmlFor="cm-text">{kind === "category" ? "Description" : "Tagline"}</label>
                <input id="cm-text" value={edit.text ?? ""} onChange={(e) => setEdit({ ...edit, text: e.target.value })} className="input" />
              </div>
              <SingleImageField value={edit.image ?? ""} onChange={(v) => setEdit({ ...edit, image: v })} />
              {kind === "collection" && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={edit.featured ?? true} onChange={(e) => setEdit({ ...edit, featured: e.target.checked })} className="h-4 w-4 accent-[rgb(var(--brand))]" />
                  Show on home page & menu
                </label>
              )}
              {error && <p className="text-sm text-red-700">{error}</p>}
              <button disabled={pending} className="btn-primary w-full">{pending ? "Saving…" : "Save"}</button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
