"use client";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { useRef, useState } from "react";
import { ImagePlus, Link2, X, GripVertical } from "lucide-react";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { SmartImage } from "../SmartImage";

async function upload(files: FileList | File[]): Promise<{ urls: string[]; error?: string }> {
  const fd = new FormData();
  Array.from(files).forEach((f) => fd.append("files", f));
  const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const d = await r.json().catch(() => ({}));
  return r.ok ? { urls: d.urls } : { urls: [], error: d.error ?? "Upload failed" };
}

export function ImageListUploader({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const [drag, setDrag] = useState(false);

  async function handle(files: FileList | File[]) {
    setBusy(true);
    setError("");
    const res = await upload(files);
    setBusy(false);
    if (res.error) setError(res.error);
    onChange([...value, ...res.urls]);
  }

  return (
    <div>
      <Reorder.Group axis="x" values={value} onReorder={onChange} className="flex flex-wrap gap-3">
        <AnimatePresence>
          {value.map((src, i) => (
            <Reorder.Item key={src} value={src} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="group relative h-32 w-24 cursor-grab overflow-hidden rounded-xl bg-ivory-deep active:cursor-grabbing">
              <SmartImage src={src} alt="" className="h-full w-full object-cover" />
              {i === 0 && <span className="absolute bottom-1 left-1 rounded-full bg-ink px-2 py-0.5 text-[9px] font-bold uppercase text-white">Cover</span>}
              <span className="absolute left-1 top-1 rounded bg-white/80 p-0.5 opacity-0 transition group-hover:opacity-100"><GripVertical size={12} /></span>
              <button type="button" onClick={() => onChange(value.filter((v) => v !== src))} className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-ink shadow" aria-label="Remove image">
                <X size={12} />
              </button>
            </Reorder.Item>
          ))}
        </AnimatePresence>
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          onClick={() => input.current?.click()}
          onDragOver={(e) => (e.preventDefault(), setDrag(true))}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            if (e.dataTransfer.files.length) handle(e.dataTransfer.files);
          }}
          className={`flex h-32 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-xs font-semibold text-ink-mute transition ${drag ? "border-brand bg-brand/5" : "border-line hover:border-ink/30"}`}
        >
          {busy ? (
            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} className="h-5 w-5 rounded-full border-2 border-line border-t-brand" />
          ) : (
            <>
              <AnimatedIcon icon={ImagePlus} size={20} /> Upload
            </>
          )}
        </motion.button>
      </Reorder.Group>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && handle(e.target.files)} />
      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <Link2 size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste an image URL" className="input py-2 pl-9 text-sm" aria-label="Image URL" />
        </div>
        <button type="button" onClick={() => { if (/^(https?:\/\/|\/)/.test(url.trim())) { onChange([...value, url.trim()]); setUrl(""); } }} className="btn-outline px-4 py-2 text-xs">
          Add
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-ink-mute">Drag to reorder. The first image is the cover photo.</p>
      {error && <p className="mt-1 text-xs text-brand">{error}</p>}
    </div>
  );
}

export function SingleImageField({ value, onChange, label = "Image" }: { value: string; onChange: (v: string) => void; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex gap-3">
        <button type="button" onClick={() => input.current?.click()} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-dashed border-line bg-ivory-deep text-ink-mute hover:border-ink/30" aria-label="Upload image">
          {value ? <SmartImage src={value} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center"><ImagePlus size={20} /></span>}
          {busy && <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs">…</span>}
        </button>
        <div className="flex-1">
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Upload or paste an image URL" className="input py-2 text-sm" aria-label={`${label} URL`} />
          <button type="button" onClick={() => input.current?.click()} className="mt-2 text-xs font-semibold text-brand">Upload from device</button>
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          if (!e.target.files?.length) return;
          setBusy(true);
          const res = await upload(e.target.files);
          setBusy(false);
          if (res.urls[0]) onChange(res.urls[0]);
        }}
      />
    </div>
  );
}
