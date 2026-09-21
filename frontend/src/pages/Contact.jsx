import { useState } from "react";
import PageHeader from "../components/common/PageHeader.jsx";
import SEO from "../components/common/SEO.jsx";
import { institution } from "../data/site.js";

const containerClass = "mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8";
const fieldClass = "grid gap-1 text-sm font-bold text-slate-700";
const inputClass = "input input-bordered w-full";

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <SEO title="Contact" />
      <PageHeader title="Contact Us" eyebrow="Contact" />
      <section>
        <div className={`${containerClass} grid gap-6 lg:grid-cols-[1.1fr_.9fr]`}>
          <form
            className="card border border-emerald-100 bg-base-100 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className="card-body grid gap-4 md:grid-cols-2">
              <label className={fieldClass}>
                Name
                <input className={inputClass} required />
              </label>
              <label className={fieldClass}>
                Email
                <input className={inputClass} type="email" required />
              </label>
              <label className={fieldClass}>
                Mobile
                <input className={inputClass} required />
              </label>
              <label className={fieldClass}>
                Subject
                <input className={inputClass} required />
              </label>
              <label className={`${fieldClass} md:col-span-2`}>
                Message
                <textarea className="textarea textarea-bordered min-h-32 w-full" required />
              </label>
              <button className="btn bg-emerald-700 text-white hover:bg-emerald-800 md:w-fit">
                Submit
              </button>
              {sent && (
                <p className="alert alert-success md:col-span-2">
                  Your message has been submitted successfully.
                </p>
              )}
            </div>
          </form>

          <div className="card border border-emerald-100 bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-emerald-950">Company Name: {institution.name}</h2>
              <div className="grid gap-2 font-semibold text-slate-600">
                <p>Email: {institution.email}</p>
                <p>Mobile: {institution.phone}</p>
                <p>Year Of Establish: {institution.established}</p>
                <p>Address: {institution.address}</p>
              </div>
              <div className="mt-4 grid min-h-52 place-items-center rounded-xl border border-dashed border-emerald-200 bg-emerald-50 font-black text-emerald-800">
                Google Maps section
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
