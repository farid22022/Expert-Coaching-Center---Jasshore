import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader.jsx";
import SEO from "../components/common/SEO.jsx";
import Modal from "../components/common/Modal.jsx";
import { galleryApi } from "../services/resourceApi.js";
import { API_BASE_URL } from "../services/api.js";

const containerClass = "mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8";

function resolveFileUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
}

export function PhotoGalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  useEffect(() => {
    galleryApi
      .list({ type: "photo" })
      .then((data) => {
        const rows = Array.isArray(data) ? data : data?.results ?? [];
        setPhotos(rows.filter((r) => r.published !== false));
      })
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));
  }, []);
  const visible = useMemo(() => photos.filter((photo) => (!featuredOnly || photo.featured) && `${photo.title || ""} ${photo.description || ""}`.toLowerCase().includes(query.trim().toLowerCase())), [photos, query, featuredOnly]);

  return (
    <>
      <SEO title="Photo Gallery" />
      <PageHeader title="Photo Gallery" eyebrow="Gallery" />
      <section>
        <div className={containerClass}>
          <div className="gallery-toolbar mb-8 flex flex-wrap items-center gap-3 rounded-2xl p-4">
            <input className="input input-bordered min-w-64 flex-1" aria-label="Search gallery" placeholder="Search campus moments" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button className={`btn ${featuredOnly ? "btn-primary" : "btn-ghost"}`} onClick={() => setFeaturedOnly((value) => !value)} type="button">Featured only</button>
            <span className="text-sm text-slate-500">{visible.length} memories</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading && (
            <p className="col-span-full py-12 text-center text-slate-500">Loading photos…</p>
          )}
          {!loading && photos.length === 0 && (
            <p className="col-span-full py-12 text-center text-slate-500">No photos published yet.</p>
          )}
          {visible.map((p) => (
            <button
              className="gallery-card group overflow-hidden rounded-2xl border text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              key={p.id}
              onClick={() => setActive(p)}
            >
              <img
                loading="lazy" width="960" height="720" src={resolveFileUrl(p.file)}
                alt={p.title}
                className="aspect-[4/3] w-full object-cover transition group-hover:scale-105"
              />
              <span className="block p-4"><strong className="block font-black">{p.title}</strong><small className="mt-1 block text-slate-500">{p.description || "Expert campus story"}</small></span>
            </button>
          ))}
          </div>
        </div>
      </section>

      {active && (
        <Modal open title={active.title || "Photo preview"} onClose={()=>setActive(null)}>
          <div className="grid w-full max-w-4xl gap-3 rounded-2xl bg-white p-4 shadow-2xl">
            <button className="btn btn-sm justify-self-end" onClick={() => setActive(null)}>
              Close
            </button>
            <img
              src={resolveFileUrl(active.file)}
              alt={active.title}
              className="max-h-[70vh] w-full rounded-xl object-contain"
            />
            <h2 className="text-xl font-black text-emerald-950">{active.title}</h2>
          </div>
        </Modal>
      )}
    </>
  );
}

export function VideoGalleryPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    galleryApi
      .list({ type: "video" })
      .then((data) => {
        const rows = Array.isArray(data) ? data : data?.results ?? [];
        setVideos(rows.filter((r) => r.published !== false));
      })
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEO title="Video Gallery" />
      <PageHeader title="Video Gallery" eyebrow="Gallery" />
      <section>
        <div className={`${containerClass} grid gap-5 md:grid-cols-2`}>
          {loading && (
            <p className="col-span-full py-12 text-center text-slate-500">Loading videos…</p>
          )}
          {!loading && videos.length === 0 && (
            <p className="col-span-full py-12 text-center text-slate-500">No videos published yet.</p>
          )}
          {videos.map((v) => (
            <article className="card border border-emerald-100 bg-base-100 shadow-sm" key={v.id}>
              <figure>
                {v.file ? (
                  <video className="aspect-video w-full bg-black" src={resolveFileUrl(v.file)} controls />
                ) : (
                  <iframe
                    className="aspect-video w-full"
                    src={v.url}
                    title={v.title}
                    allowFullScreen
                  />
                )}
              </figure>
              <div className="card-body">
                <h2 className="card-title text-emerald-950">{v.title}</h2>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
