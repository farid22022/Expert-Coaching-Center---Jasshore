import { useState } from "react";
import PageHeader from "../components/common/PageHeader.jsx";
import SEO from "../components/common/SEO.jsx";
import { photos, videos } from "../data/mockData.js";

const containerClass = "mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8";

export function PhotoGalleryPage() {
  const [active, setActive] = useState(null);

  return (
    <>
      <SEO title="Photo Gallery" />
      <PageHeader title="Photo Gallery" eyebrow="Gallery" />
      <section>
        <div className={`${containerClass} grid gap-5 sm:grid-cols-2 lg:grid-cols-3`}>
          {photos.map((p) => (
            <button
              className="group overflow-hidden rounded-2xl border border-emerald-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              key={p.id}
              onClick={() => setActive(p)}
            >
              <img
                src={p.src}
                alt={p.title}
                className="aspect-[4/3] w-full object-cover transition group-hover:scale-105"
              />
              <span className="block p-4 font-black text-emerald-950">{p.title}</span>
            </button>
          ))}
        </div>
      </section>

      {active && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-4" role="dialog">
          <div className="grid w-full max-w-4xl gap-3 rounded-2xl bg-white p-4 shadow-2xl">
            <button className="btn btn-sm justify-self-end" onClick={() => setActive(null)}>
              Close
            </button>
            <img src={active.src} alt={active.title} className="max-h-[70vh] w-full rounded-xl object-contain" />
            <h2 className="text-xl font-black text-emerald-950">{active.title}</h2>
          </div>
        </div>
      )}
    </>
  );
}

export function VideoGalleryPage() {
  return (
    <>
      <SEO title="Video Gallery" />
      <PageHeader title="Video Gallery" eyebrow="Gallery" />
      <section>
        <div className={`${containerClass} grid gap-5 md:grid-cols-2`}>
          {videos.map((v) => (
            <article className="card border border-emerald-100 bg-base-100 shadow-sm" key={v.id}>
              <figure>
                <iframe
                  className="aspect-video w-full"
                  src={v.url}
                  title={v.title}
                  allowFullScreen
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title text-emerald-950">{v.title}</h2>
                <p className="leading-7 text-slate-600">{v.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
