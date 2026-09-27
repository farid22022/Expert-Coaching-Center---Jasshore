import { CrudPage } from "../courses/CourseFoundationPages.jsx";
import { bannerApi, successStoryApi, renownedTeacherApi } from "../../../../services/resourceApi.js";

function withFileUpload(payload, fileFieldName, file) {
  if (!(file instanceof File)) return payload;
  const data = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      data.append(key, typeof value === "object" ? JSON.stringify(value) : value);
    }
  });
  data.append(fileFieldName, file);
  return data;
}

export function BannersPage() {
  return (
    <CrudPage
      title="Banners"
      showNav={false}
      api={bannerApi}
      initialForm={{ title: "", subtitle: "", image: null, link_url: "", display_order: 0, is_active: true }}
      fields={[
        { name: "title", label: "Title" },
        { name: "subtitle", label: "Subtitle" },
        { name: "image", label: "Banner Image", type: "file", accept: "image/*" },
        { name: "link_url", label: "Link URL (optional)" },
        { name: "display_order", label: "Display Order", type: "number", number: true },
        { name: "is_active", label: "Active", type: "checkbox" },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "subtitle", label: "Subtitle" },
        { key: "link_url", label: "Link" },
        { key: "display_order", label: "Order" },
        { key: "is_active", label: "Active" },
      ]}
      normalize={(form) => withFileUpload({ title: form.title?.trim() || "", subtitle: form.subtitle?.trim() || "", link_url: form.link_url?.trim() || "", display_order: Number(form.display_order || 0), is_active: Boolean(form.is_active) }, "image", form.image)}
    />
  );
}

export function SuccessStoriesPage() {
  return (
    <CrudPage
      title="Success Stories"
      showNav={false}
      api={successStoryApi}
      initialForm={{ name: "", outcome: "", quote: "", photo: null, display_order: 0, is_active: true }}
      fields={[
        { name: "name", label: "Student Name" },
        { name: "outcome", label: "Outcome (e.g. Admitted to Science Group, Class Nine)" },
        { name: "quote", label: "Quote", type: "textarea" },
        { name: "photo", label: "Photo", type: "file", accept: "image/*" },
        { name: "display_order", label: "Display Order", type: "number", number: true },
        { name: "is_active", label: "Active", type: "checkbox" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "outcome", label: "Outcome" },
        { key: "display_order", label: "Order" },
        { key: "is_active", label: "Active" },
      ]}
      normalize={(form) => withFileUpload({ name: form.name?.trim() || "", outcome: form.outcome?.trim() || "", quote: form.quote?.trim() || "", display_order: Number(form.display_order || 0), is_active: Boolean(form.is_active) }, "photo", form.photo)}
      validate={(form) => !form.name?.trim() && "Student name is required."}
    />
  );
}

export function RenownedTeachersPage() {
  return (
    <CrudPage
      title="Renowned Teachers"
      showNav={false}
      api={renownedTeacherApi}
      initialForm={{ name: "", designation: "", subject: "", image: null, bio: "", years_experience: 0, badge: "", display_order: 0, is_active: true }}
      fields={[
        { name: "name", label: "Name" },
        { name: "designation", label: "Designation (e.g. Senior Mentor)" },
        { name: "subject", label: "Subject" },
        { name: "image", label: "Photo", type: "file", accept: "image/*" },
        { name: "years_experience", label: "Years of Experience", type: "number", number: true },
        { name: "badge", label: "Badge (e.g. 12+ Yrs Experience)" },
        { name: "bio", label: "Bio", type: "textarea" },
        { name: "display_order", label: "Display Order", type: "number", number: true },
        { name: "is_active", label: "Active", type: "checkbox" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "designation", label: "Designation" },
        { key: "subject", label: "Subject" },
        { key: "badge", label: "Badge" },
        { key: "display_order", label: "Order" },
        { key: "is_active", label: "Active" },
      ]}
      normalize={(form) => withFileUpload({ name: form.name?.trim() || "", designation: form.designation?.trim() || "", subject: form.subject?.trim() || "", bio: form.bio?.trim() || "", years_experience: Number(form.years_experience || 0), badge: form.badge?.trim() || "", display_order: Number(form.display_order || 0), is_active: Boolean(form.is_active) }, "image", form.image)}
      validate={(form) => !form.name?.trim() && "Teacher name is required."}
    />
  );
}
