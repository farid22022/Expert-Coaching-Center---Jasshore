import { useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link"],
    ["clean"],
  ],
};

const formats = ["size", "bold", "italic", "underline", "strike", "color", "background", "list", "align", "link"];

export default function RichTextEditor({ value, onChange, placeholder, className = "" }) {
  const mods = useMemo(() => modules, []);
  return (
    <div className={`rich-text-editor overflow-hidden rounded-lg bg-white ${className}`}>
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={mods}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
