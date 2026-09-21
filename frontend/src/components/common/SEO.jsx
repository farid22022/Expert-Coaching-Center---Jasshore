import { useEffect } from "react";
import { institution } from "../../data/site.js";

export default function SEO({ title, description }) {
  useEffect(() => {
    document.title = `${institution.name} | ${title}`;
    const meta = document.querySelector('meta[name="description"]') || document.head.appendChild(document.createElement("meta"));
    meta.name = "description";
    meta.content = description || `${title} at ${institution.name}`;
  }, [title, description]);
  return null;
}
