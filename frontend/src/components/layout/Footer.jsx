import { Link } from "react-router-dom";
import { institution } from "../../data/site.js";

const cols = [
  ["Institution", [["About", "/about/history"], ["History", "/about/history"], ["Teachers", "/about/teachers"], ["Contact", "/contact"]]],
  ["Academic", [["Student List", "/academic/students"], ["Class Routine", "/academic/class-routine"], ["Exam Routine", "/academic/exam-routine"], ["Results", "/result/individual"]]],
  ["Admission", [["Online Admission", "/admission/online"], ["Admission Result", "/admission/result"], ["Admit Card", "/admission/admit-card"]]],
  ["Important", [["Notices", "/notices"], ["News", "/news"], ["Events", "/events"], ["Gallery", "/gallery/photos"]]],
];

export default function Footer() {
  return (
    <footer className="border-t border-emerald-900 bg-emerald-950 text-emerald-50">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:px-8">
        <div className="grid gap-4">
          <Link className="flex items-center gap-3" to="/">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white p-1 shadow-sm">
              <img
                src="/jasshoreExpert.png"
                alt={`${institution.name} logo`}
                className="h-full w-full object-contain"
              />
            </span>
            <span className="text-lg font-black leading-tight">
              {institution.name}
            </span>
          </Link>

          <div className="grid gap-1 text-sm font-semibold text-emerald-100/80">
            <p>{institution.address}</p>
            <p>{institution.phone}</p>
            <p>{institution.email}</p>
          </div>
        </div>

        {cols.map(([title, links]) => (
          <div className="grid content-start gap-2" key={title}>
            <h3 className="mb-1 text-sm font-black uppercase tracking-wide text-white">
              {title}
            </h3>
            {links.map(([label, path]) => (
              <Link
                className="text-sm font-semibold text-emerald-100/75 transition-colors hover:text-white"
                key={path + label}
                to={path}
              >
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs font-semibold text-emerald-100/65">
        © {new Date().getFullYear()} {institution.name}. Public website clone.
      </div>
    </footer>
  );
}
