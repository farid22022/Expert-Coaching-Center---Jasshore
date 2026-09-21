import { Link } from "react-router-dom";

export default function PageHeader({ title, eyebrow, description }) {
  return (
    <section className="bg-emerald-950 text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-3 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-emerald-100/75">
          <Link className="hover:text-white" to="/">
            Home
          </Link>
          <span>/</span>
          <span>{title}</span>
        </div>

        {eyebrow && (
          <p className="text-sm font-black uppercase tracking-wide text-emerald-300">
            {eyebrow}
          </p>
        )}

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {title}
        </h1>

        {description && (
          <p className="max-w-3xl text-base font-medium leading-7 text-emerald-50/80">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
