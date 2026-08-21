"use client";

import { useRef, useState } from "react";
import { useConvex, useMutation } from "convex/react";
import { Loader2, Plus, X } from "lucide-react";
import { api } from "../../../convex/_generated/api";

export function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const convex = useConvex();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await res.json();
        const url = await convex.query(api.files.getUrl, { storageId });
        if (url) uploaded.push(url);
      }
      onChange([...images, ...uploaded]);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={img + i} className="relative h-24 w-20 overflow-hidden rounded-lg border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute end-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-cream"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-24 w-20 items-center justify-center rounded-lg border border-dashed border-line text-ink-soft"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-2 text-xs text-ink-soft">Or paste an image URL and press Enter:</p>
      <input
        placeholder="https://…"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const val = (e.target as HTMLInputElement).value.trim();
            if (val) {
              onChange([...images, val]);
              (e.target as HTMLInputElement).value = "";
            }
          }
        }}
        className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm"
      />
    </div>
  );
}
