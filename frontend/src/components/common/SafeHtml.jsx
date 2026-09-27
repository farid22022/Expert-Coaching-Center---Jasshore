import DOMPurify from "dompurify";

const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "s", "ul", "ol", "li", "a", "span", "h1", "h2", "h3"];
const ALLOWED_ATTR = ["href", "target", "rel", "style", "class"];

export default function SafeHtml({ html, className, as: Tag = "div" }) {
  if (!html) return null;
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
  return <Tag className={`rich-text-content ${className || ""}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}
