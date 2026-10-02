import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import api, { getApiErrorMessage } from "../../services/api.js";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

/**
 * Uploads an image to Django (POST /uploads/images/), which forwards it to ImgBB with a
 * server-side key. The browser only ever sees the resulting public URL.
 *
 * Props: value (current image URL), onChange(url|""), context (e.g. "course_cover"),
 *        label, helpText, disabled.
 */
export default function ImageUploader({ value = "", onChange, context = "general", label = "Image", helpText = "", disabled = false }) {
  const inputRef = useRef(null);
  const lastFileRef = useRef(null);
  const [preview, setPreview] = useState("");
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState("idle"); // idle | uploading | success | error
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const upload = useCallback(async (file) => {
    if (!file) return;
    if (!ACCEPT.split(",").includes(file.type)) {
      setState("error");
      setError("Please choose a JPEG, PNG, WebP or GIF image.");
      return;
    }
    lastFileRef.current = file;
    setPreview(URL.createObjectURL(file));
    setState("uploading");
    setError("");
    setProgress(0);
    const body = new FormData();
    body.append("image", file);
    body.append("context", context);
    try {
      const { data } = await api.post("/uploads/images/", body, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
        onUploadProgress: (event) => event.total && setProgress(Math.round((event.loaded / event.total) * 100)),
      });
      setState("success");
      onChange?.(data.url, data);
    } catch (err) {
      // Never keep a broken URL: the form value is left untouched on failure.
      setState("error");
      setError(getApiErrorMessage(err, "Image upload failed. Please retry."));
    }
  }, [context, onChange]);

  const pick = (event) => {
    upload(event.target.files?.[0]);
    event.target.value = "";
  };
  const drop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) upload(event.dataTransfer.files?.[0]);
  };
  const remove = () => {
    setPreview("");
    setState("idle");
    setError("");
    onChange?.("", null);
  };

  const shown = state === "uploading" || state === "error" ? preview || value : value || preview;
  const busy = state === "uploading";

  return (
    <div className="space-y-2 text-base-content">
      {label && <span className="block text-sm font-bold">{label}</span>}
      <div
        onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={drop}
        className={`relative flex min-h-36 items-center gap-4 rounded-lg border-2 border-dashed p-3 transition ${dragging ? "border-success bg-success/10" : "border-base-300 bg-base-100"} ${disabled ? "opacity-60" : ""}`}
      >
        {shown ? (
          <img src={shown} alt={label} className="h-28 w-28 shrink-0 rounded-md border border-base-300 object-cover" />
        ) : (
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-md bg-base-200 opacity-60"><ImagePlus size={30} /></div>
        )}
        <div className="min-w-0 flex-1 space-y-2 text-sm">
          <p className="opacity-80">{busy ? `Uploading… ${progress}%` : "Drag an image here or browse (JPEG, PNG, WebP, GIF)."}</p>
          {busy && <progress className="progress progress-success w-full" value={progress} max="100" />}
          {state === "success" && !busy && <p className="font-semibold text-success">Image uploaded.</p>}
          {state === "error" && (
            <p role="alert" className="font-semibold text-error">{error}</p>
          )}
          {helpText && <p className="text-xs opacity-70">{helpText}</p>}
          <div className="flex flex-wrap gap-2">
            <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={pick} disabled={disabled || busy} />
            <button type="button" className="btn btn-sm btn-outline" disabled={disabled || busy} onClick={() => inputRef.current?.click()}>
              {busy ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}{value ? "Replace image" : "Browse"}
            </button>
            {state === "error" && lastFileRef.current && (
              <button type="button" className="btn btn-sm btn-outline" onClick={() => upload(lastFileRef.current)}><RefreshCw size={15} />Retry</button>
            )}
            {(value || preview) && !busy && (
              <button type="button" className="btn btn-sm btn-ghost text-error" onClick={remove}><Trash2 size={15} />Remove</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
