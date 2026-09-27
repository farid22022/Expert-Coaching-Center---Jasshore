import { useEffect } from "react";
import { institution } from "../../data/site.js";

export default function SEO({ title, description, image }) {
  useEffect(() => {
    document.title = `${institution.name} | ${title}`;
    const meta = document.querySelector('meta[name="description"]') || document.head.appendChild(document.createElement("meta"));
    meta.name = "description";
    meta.content = description || `${title} at ${institution.name}`;

    if (image) {
      const ogImage = document.querySelector('meta[property="og:image"]') || document.head.appendChild(document.createElement("meta"));
      ogImage.setAttribute("property", "og:image");
      ogImage.setAttribute("content", image);
    }
  }, [title, description, image]);
  return null;
}
