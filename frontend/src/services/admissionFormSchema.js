// Never silently remove incomplete fields: that can replace a saved form with [].
export function cleanSchemaForSave(schema) {
  return schema.map((section, sectionIndex) => {
    const title = (section.title || "").trim();
    if (!title) throw new Error(`Section ${sectionIndex + 1}: enter a section heading.`);
    if (!section.fields?.length) throw new Error(`Section "${title}": add at least one applicant field, or remove this section.`);
    const fields = section.fields.map((field, fieldIndex) => {
      const label = (field.label || "").trim();
      if (!label) throw new Error(`Section "${title}", field ${fieldIndex + 1}: enter a field label (for example Full name or Phone). The section heading is not an applicant field.`);
      const options = (field.optionsText || "").split(",").map((option) => option.trim()).filter(Boolean);
      if (field.type === "select" && !options.length) throw new Error(`Field "${label}": enter at least one select option.`);
      return { id: field.id, label, name: (field.name || label).trim(), type: field.type || "text", placeholder: (field.placeholder || "").trim(), required: Boolean(field.required), options };
    });
    return { id: section.id, title, fields };
  });
}
