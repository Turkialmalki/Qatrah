"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import clsx from "clsx";
import { Label } from "@/components/ui/input";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

/**
 * File input with a local preview. The server re-validates type and size in
 * `uploadServiceImage`; the checks here are only to fail fast for the user.
 */
export function ImageField({
  name = "image",
  label = "صورة الخدمة",
  hint,
  required = false,
}: {
  name?: string;
  label?: string;
  hint?: string;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) {
      clear();
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("حجم الصورة يجب أن يكون أقل من ٥ ميجابايت");
      e.target.value = "";
      return;
    }

    setFileName(file.name);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
  }

  function clear() {
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    setFileName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-600"> *</span>}
      </Label>

      {preview ? (
        <div className="relative overflow-hidden rounded-xl border border-navy-900/15">
          {/* Blob URL of a file the user just picked — next/image can't optimize it. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={fileName ?? "معاينة الصورة"} className="h-40 w-full object-cover" />
          <button
            type="button"
            onClick={clear}
            aria-label="إزالة الصورة"
            className="absolute left-2 top-2 rounded-lg bg-navy-950/75 p-1.5 text-white transition hover:bg-navy-950"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={clsx(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-sm transition",
            error
              ? "border-red-400 bg-red-50/60 text-red-600"
              : "border-navy-900/20 text-navy-900/55 hover:border-gold-500 hover:bg-gold-100/30"
          )}
        >
          <ImagePlus className="h-6 w-6" />
          <span className="font-semibold">اختر صورة من جهازك</span>
          <span className="text-xs">JPG أو PNG أو WebP — حتى ٥ ميجابايت</span>
        </button>
      )}

      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept={ACCEPT}
        required={required}
        onChange={onChange}
        className="sr-only"
      />

      {error && <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-navy-900/50">{hint}</p>}
    </div>
  );
}

/** Renders a stored image URL, or a branded placeholder when there is none. */
export function ServiceImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div className={clsx("flex items-center justify-center navy-gradient", className)}>
        <Image src="/brand/logo-icon.png" alt="قاطرة" width={44} height={36} className="opacity-40" />
      </div>
    );
  }
  return (
    <div className={clsx("relative overflow-hidden bg-cream-dark", className)}>
      <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
    </div>
  );
}
